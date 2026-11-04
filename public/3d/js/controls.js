/*
 * controls.js - Orbit camera, view/door/start buttons, cleaning sequence update, resize handling and the render loop (entry point).
 * Classic script: shares the page's global scope with the other files in js/.
 * Load order matters; see the <script> tags at the bottom of index.html.
 */

/* orbit + views */
var VIEW_PRESETS = { front: { az: 0, ph: 1.5, r: 5.4, ty: 0.98 }, three: { az: 0.6, ph: 1.45, r: 5.4, ty: 0.98 }, side: { az: Math.PI / 2, ph: 1.5, r: 5.4, ty: 0.98 }, inside: { az: 0.22, ph: 1.5, r: 2.4, ty: 1.2 } };
var goalState = { az: 0.29, ph: 1.43, r: 8.1, ty: 0.98, door: 0 };
var currentState = { az: 0.29, ph: 1.43, r: 8.1, ty: 0.98, door: 0 };
/* radius-aware safe orbit volume: camera stays below ceiling beams and above floor */
var ORBIT_CEILING_Y = 2.72;
var ORBIT_FLOOR_Y = 0.16;
function orbitBounds(o) {
    var r = Math.max(1.8, o.r);
    var hi = Math.max(-1, Math.min(1, (ORBIT_CEILING_Y - o.ty) / r));
    var lo = Math.max(-1, Math.min(1, (ORBIT_FLOOR_Y - o.ty) / r));
    return { min: Math.max(0.6, Math.acos(hi)), max: Math.min(1.75, Math.acos(lo)) };
}
function clampOrbit(o) {
    var b = orbitBounds(o);
    o.ph = Math.min(b.max, Math.max(b.min, o.ph));
    return o;
}
var autoRotate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var activePointers = {};
stage.addEventListener('pointerdown', function (e) {
    autoRotate = false;
    stage.setPointerCapture(e.pointerId);
    activePointers[e.pointerId] = [e.clientX, e.clientY];
});
stage.addEventListener('pointermove', function (e) {
    var p = activePointers[e.pointerId];
    if (!p) {
        return;
    }
    var ids = Object.keys(activePointers);
    if (ids.length == 2) {
        var o = activePointers[ids[0] == e.pointerId ? ids[1] : ids[0]];
        var d0 = Math.hypot(p[0] - o[0], p[1] - o[1]);
        activePointers[e.pointerId] = [e.clientX, e.clientY];
        var d1 = Math.hypot(e.clientX - o[0], e.clientY - o[1]);
        if (d0 > 0) {
            goalState.r = Math.min(9, Math.max(1.8, goalState.r * d0 / d1));
        }
        clampOrbit(goalState);
        return;
    }
    goalState.az -= (e.clientX - p[0]) * 0.006;
    goalState.ph -= ((e.clientY - p[1]) * 0.005);
    clampOrbit(goalState);
    activePointers[e.pointerId] = [e.clientX, e.clientY];
    clearActive();
});
function releasePointer(e) {
    delete activePointers[e.pointerId];
}
stage.addEventListener('pointerup', releasePointer);
stage.addEventListener('pointercancel', releasePointer);
stage.addEventListener('wheel', function (e) {
    e.preventDefault();
    autoRotate = false;
    goalState.r = Math.min(9, Math.max(1.8, goalState.r * (1 + e.deltaY * 0.001)));
    clampOrbit(goalState);
}, { passive: false });
var viewButtons = document.querySelectorAll('[data-v]');
var doorButton = document.getElementById('door');
function clearActive() {
    viewButtons.forEach(function (b) {
        b.classList.remove('on');
    });
}
function setDoor(o) {
    if (cleaning && o) {
        return;
    }
    goalState.door = o ? 1 : 0;
    doorButton.setAttribute('aria-pressed', o);
    doorButton.textContent = o ? 'Close door' : 'Open door';
    doorButton.classList.toggle('on', !!o);
}
viewButtons.forEach(function (b) {
    b.addEventListener('click', function () {
        autoRotate = false;
        var v = VIEW_PRESETS[b.dataset.v];
        Object.assign(goalState, v);
        clampOrbit(goalState);
        clearActive();
        b.classList.add('on');
    });
});
doorButton.addEventListener('click', function () {
    setDoor(!goalState.door);
});
var startButton = document.getElementById('start');
var statusPanel = document.getElementById('st');
var statusText = document.getElementById('stt');
var progressBar = document.getElementById('bar');
var cleaningTime = 0;
var completeTimer = 0;
var cleaningGlow = 0;
var fanSpin = 0;
function mistEnvelope(t) {
    return t < 1 ? 0.35 * t : t < 3.5 ? 0.35 + 0.65 * smoothStep(0, 1, (t - 1) / 2.5) : 1 - smoothStep(0, 1, (t - 3.5) / 1.5);
}
startButton.addEventListener('click', function () {
    if (cleaning) {
        return;
    }
    cleaning = true;
    cleaningTime = 0;
    completeTimer = 0;
    resetMist();
    mist.visible = true;
    startButton.hidden = true;
    statusPanel.hidden = false;
    statusText.textContent = 'Cleaning in progress…';
    progressBar.style.setProperty('--p', 0);
    doorButton.disabled = true;
    autoRotate = false;
    clearActive();
    Object.assign(goalState, { az: 0.38, ph: 1.47, r: 3.1, ty: 1.12 });
});
function updateCleaning(dt) {
    if (cleaning) {
        cleaningTime += dt;
        mistUniforms.uT.value = cleaningTime;
        stepMist(dt, mistEnvelope(cleaningTime), cleaningTime, cleaningTime < 3.4);
        progressBar.style.setProperty('--p', Math.min(1, cleaningTime / 5));
        if (cleaningTime >= 5) {
            cleaning = false;
            mist.visible = false;
            resetMist();
            statusText.textContent = 'Cleaning Complete ✓';
            progressBar.style.setProperty('--p', 1);
            completeTimer = 4;
            doorButton.disabled = false;
        }
    }
    else if (completeTimer > 0) {
        completeTimer -= dt;
        if (completeTimer <= 0) {
            statusPanel.hidden = true;
        }
    }
    cleaningGlow += ((cleaning ? 1 : 0) - cleaningGlow) * Math.min(1, dt * 4);
    fanSpin += ((cleaning && cleaningTime < 4.4 ? 1 : 0) - fanSpin) * Math.min(1, dt * 3);
    chamberLightUpper.intensity = 1.5 + 1.1 * cleaningGlow * (1 + 0.06 * Math.sin(cleaningTime * 9));
    chamberLightLower.intensity = 0.7 + 0.6 * cleaningGlow;
    chamberLedMat.color.setRGB(1, 0.1, 0.05).multiplyScalar(1 + 0.6 * cleaningGlow);
    mistUniforms.uL.value = cleaningGlow;
    for (var i = 0; i < fans.length; i++) {
        fans[i].rotation.z -= fanSpin * 20 * dt;
    }
    var closed = !cleaning && goalState.door === 0 && currentState.door < 0.03 && completeTimer <= 0;
    if (startButton.hidden === closed) {
        startButton.hidden = !closed;
    }
}
function resizeRenderer() {
    var w = stage.clientWidth;
    var h = stage.clientHeight;
    renderer.setSize(w, h, false);
    if (bloomComposer) {
        bloomComposer.setSize(w, h);
        finalComposer.setSize(w, h);
    }
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    mistUniforms.uScale.value = renderer.domElement.height / (2 * Math.tan(camera.fov * Math.PI / 360));
}
window.addEventListener('resize', resizeRenderer);
resizeRenderer();
var lastFrameTime = performance.now();
function renderLoop() {
    var now = performance.now();
    var dt = Math.min(0.05, (now - lastFrameTime) / 1000);
    lastFrameTime = now;
    updateCleaning(dt);
    if (autoRotate) {
        goalState.az += 0.0035;
    }
    clampOrbit(goalState);
    ['az', 'ph', 'r', 'ty', 'door'].forEach(function (n) {
        currentState[n] += (goalState[n] - currentState[n]) * 0.07;
    });
    clampOrbit(currentState);
    camera.position.set(Math.sin(currentState.ph) * Math.sin(currentState.az) * currentState.r, currentState.ty + Math.cos(currentState.ph) * currentState.r, Math.sin(currentState.ph) * Math.cos(currentState.az) * currentState.r);
    camera.lookAt(0, currentState.ty, 0);
    door.rotation.y = -currentState.door * 1.75;
    if (bloomComposer) {
        scene.traverse(darkenNonBloomed);
        bloomComposer.render();
        scene.traverse(restoreBloomMaterial);
        finalComposer.render();
    }
    else {
        renderer.render(scene, camera);
    }
    requestAnimationFrame(renderLoop);
}
renderLoop();
