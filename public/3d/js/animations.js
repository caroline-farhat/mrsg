/*
 * animations.js - Disinfectant mist particle system (emitters, spawning and per-frame stepping).
 * Classic script: shares the page's global scope with the other files in js/.
 * Load order matters; see the <script> tags at the bottom of index.html.
 */

/* disinfectant mist */
var PARTICLE_COUNT = 420;
var mistPositions = new Float32Array(PARTICLE_COUNT * 3);
var mistAttribs = new Float32Array(PARTICLE_COUNT * 4);
var mistVelocities = new Float32Array(PARTICLE_COUNT * 3);
var mistAge = new Float32Array(PARTICLE_COUNT);
var mistLife = new Float32Array(PARTICLE_COUNT);
var mistBaseAlpha = new Float32Array(PARTICLE_COUNT);
var mistBaseSize = new Float32Array(PARTICLE_COUNT);
var mistGeometry = new T.BufferGeometry();
mistGeometry.setAttribute('position', new T.BufferAttribute(mistPositions, 3).setUsage(T.DynamicDrawUsage));
mistGeometry.setAttribute('aD', new T.BufferAttribute(mistAttribs, 4).setUsage(T.DynamicDrawUsage));
var mistUniforms = { uScale: { value: 900 }, uT: { value: 0 }, uL: { value: 0 } };
var mist = new T.Points(mistGeometry, new T.ShaderMaterial({ uniforms: mistUniforms, transparent: true, depthWrite: false,
    vertexShader: 'attribute vec4 aD;uniform float uScale;varying float vA;varying float vS;varying float vY;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=aD.x*uScale/-mv.z;vA=aD.y;vS=aD.z;vY=position.y;}',
    fragmentShader: 'uniform float uT;uniform float uL;varying float vA;varying float vS;varying float vY;float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}void main(){vec2 uv=gl_PointCoord-.5;float c=cos(vS*6.28),s=sin(vS*6.28);uv=mat2(c,-s,s,c)*uv;float d=length(uv);float nn=n(uv*4.+vS*17.+uT*.15)*.6+n(uv*9.-vS*5.)*.4;float a=smoothstep(.5,.05,d)*(.45+.75*nn)*vA;if(a<.003)discard;vec3 col=vec3(.93,.94,.96);float red=smoothstep(.95,1.4,vY)*.5+.18;col=mix(col,vec3(1.,.55,.5),red*uL*.55);col*=.82+.3*nn;gl_FragColor=vec4(col,a);}' }));
mist.frustumCulled = false;
mist.visible = false;
machine.add(mist);
/* mist emitter positions (x, y, z) inside the chamber */
var NOZZLES = [[-0.17, 1.4, -0.2], [0.17, 1.4, -0.2], [-0.205, 1.25, -0.1], [0.205, 1.25, -0.1], [-0.1, 1.41, 0.16], [0.1, 1.41, 0.16], [-0.18, 0.97, -0.2], [0.18, 0.97, -0.2]];
function resetMist() {
    mistLife.fill(0);
    mistAttribs.fill(0);
}
function spawnMistParticle(i) {
    var n = NOZZLES[(Math.random() * NOZZLES.length) | 0];
    var r = Math.random;
    mistPositions[i * 3] = n[0] + (r() - .5) * .03;
    mistPositions[i * 3 + 1] = n[1] + (r() - .5) * .03;
    mistPositions[i * 3 + 2] = n[2] + (r() - .5) * .03;
    var dx = -n[0] * 0.6 + (r() - .5) * .1;
    var dy = (1.1 - n[1]) * 0.8 + (r() - .5) * .1;
    var dz = -0.04 - n[2] + (r() - .5) * .1;
    var l = Math.hypot(dx, dy, dz) || 1;
    var sp = 0.12 + r() * 0.16;
    mistVelocities[i * 3] = dx / l * sp;
    mistVelocities[i * 3 + 1] = dy / l * sp;
    mistVelocities[i * 3 + 2] = dz / l * sp;
    mistAge[i] = 0;
    mistLife[i] = 1.8 + r() * 1.6;
    mistBaseAlpha[i] = 0.4 + r() * 0.5;
    mistBaseSize[i] = 0.09 + r() * 0.12;
    mistAttribs[i * 4 + 2] = r();
}
function stepMist(dt, e, t, emit) {
    var sp = emit ? Math.ceil((60 + 170 * Math.min(1, t / 1.2)) * dt) : 0;
    var dmp = Math.pow(0.35, dt);
    for (var i = 0; i < PARTICLE_COUNT; i++) {
        if (mistLife[i] <= 0) {
            if (sp > 0) {
                spawnMistParticle(i);
                sp--;
            }
            else {
                mistAttribs[i * 4 + 1] = 0;
                continue;
            }
        }
        mistAge[i] += dt;
        var k = mistAge[i] / mistLife[i];
        if (k >= 1) {
            mistLife[i] = 0;
            mistAttribs[i * 4 + 1] = 0;
            continue;
        }
        var x = mistPositions[i * 3];
        var y = mistPositions[i * 3 + 1];
        var z = mistPositions[i * 3 + 2];
        var sd = mistAttribs[i * 4 + 2];
        var vx = mistVelocities[i * 3];
        var vy = mistVelocities[i * 3 + 1];
        var vz = mistVelocities[i * 3 + 2];
        var rx = x;
        var rz = z + 0.04;
        vx += (-rz * 0.9 + Math.sin(t * 1.3 + sd * 9 + y * 11) * 0.09) * dt;
        vz += (rx * 0.9 + Math.cos(t * 1.1 + sd * 7 + x * 10) * 0.09) * dt;
        vy += (Math.sin(t * 0.9 + sd * 5 + z * 12) * 0.06 - 0.015) * dt;
        if (z < -0.1) {
            vz += 0.25 * dt;
        }
        else if (z > 0.1) {
            vz -= 0.12 * dt;
            vy += 0.03 * dt;
        }
        vx *= dmp;
        vy *= dmp;
        vz *= dmp;
        x += vx * dt;
        y += vy * dt;
        z += vz * dt;
        if (x < -0.2) {
            x = -0.2;
            vx *= -0.3;
        }
        else if (x > 0.2) {
            x = 0.2;
            vx *= -0.3;
        }
        if (y < 0.97) {
            y = 0.97;
            vy *= -0.3;
        }
        else if (y > 1.41) {
            y = 1.41;
            vy *= -0.3;
        }
        if (z < -0.235) {
            z = -0.235;
            vz *= -0.3;
        }
        else if (z > 0.235) {
            z = 0.235;
            vz *= -0.3;
        }
        mistPositions[i * 3] = x;
        mistPositions[i * 3 + 1] = y;
        mistPositions[i * 3 + 2] = z;
        mistVelocities[i * 3] = vx;
        mistVelocities[i * 3 + 1] = vy;
        mistVelocities[i * 3 + 2] = vz;
        mistAttribs[i * 4] = mistBaseSize[i] * (0.7 + 0.9 * k);
        mistAttribs[i * 4 + 1] = e * mistBaseAlpha[i] * Math.min(1, k * 6) * Math.min(1, (1 - k) * 2.5);
    }
    mistGeometry.attributes.position.needsUpdate = true;
    mistGeometry.attributes.aD.needsUpdate = true;
}
