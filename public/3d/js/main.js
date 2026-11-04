/*
 * main.js - Scene bootstrap: constants, renderer, scene, reflection field, lights, drawing helpers and shared materials.
 * Classic script: shares the page's global scope with the other files in js/.
 * Load order matters; see the <script> tags at the bottom of index.html.
 */

/* short alias for the THREE namespace */
var T = THREE;
var MACHINE_WIDTH = 0.6;
var MACHINE_DEPTH = 0.6;
var FONT_STACK = '"Helvetica Neue",Arial,sans-serif';
var stage = document.getElementById('stage');
var renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputEncoding = T.sRGBEncoding;
renderer.toneMapping = T.NoToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = T.PCFSoftShadowMap;
stage.appendChild(renderer.domElement);
var scene = new T.Scene();
var camera = new T.PerspectiveCamera(28, 1, 0.12, 40);
scene.background = new T.Color(0x010102);
scene.fog = new T.FogExp2(0x010102, 0.006);
/* fixed showroom reflection field and world-space cinematic lights */
var reflectionScene = new T.Scene();
reflectionScene.background = new T.Color(0x020203);
function addReflectionPanel(w, h, x, y, z, i, c) {
    var m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: c || new T.Color(i, i, i), side: T.DoubleSide }));
    m.position.set(x, y, z);
    m.lookAt(0, 1, 0);
    reflectionScene.add(m);
}
addReflectionPanel(6, 4, 0, 7, 1, 3.8);
addReflectionPanel(2.4, 5, -7, 2, 3, 4.5);
addReflectionPanel(2.4, 5, 7, 2, 3, 3);
addReflectionPanel(6, 2.5, 0, 2, 9, 1.8);
addReflectionPanel(6, 2.2, 0, 2, -9, 1);
addReflectionPanel(2, 5, -8, 2, -4, 0, 0x310004);
addReflectionPanel(2, 5, 8, 2, -4, 0, 0x240003);
var pm = new T.PMREMGenerator(renderer);
scene.environment = pm.fromScene(reflectionScene, 0.04).texture;
pm.dispose();
var key = new T.SpotLight(0xfff8ef, 1.18, 16, 0.44, 0.76, 1.15);
key.position.set(3.6, 4.28, 5.2);
key.target.position.set(0, 0.9, 0);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
var keyShadowCamera = key.shadow.camera;
keyShadowCamera.near = 1;
keyShadowCamera.far = 18;
key.shadow.bias = -0.00035;
key.shadow.radius = 6;
var topLight = new T.SpotLight(0xf8f6f1, 1.02, 11, 0.47, 0.9, 1.25);
topLight.position.set(0, 3.42, 0.2);
topLight.target.position.set(0, 0.15, 0);
topLight.castShadow = true;
topLight.shadow.mapSize.set(1024, 1024);
topLight.shadow.radius = 7;
var fill = new T.DirectionalLight(0xcbd5e4, 0.17);
fill.position.set(-4.5, 3.2, 3.8);
var rimL = new T.SpotLight(0xe8efff, 0.72, 11, 0.4, 0.9, 1.5);
rimL.position.set(-4.2, 3.4, -3.2);
rimL.target.position.set(0, 1.05, 0);
var rimR = new T.SpotLight(0xffebe7, 0.56, 11, 0.4, 0.9, 1.5);
rimR.position.set(4.2, 3.1, -3.5);
rimR.target.position.set(0, 1.05, 0);
scene.add(key, key.target, topLight, topLight.target, fill, rimL, rimL.target, rimR, rimR.target, new T.HemisphereLight(0x30343b, 0x010102, 0.1));
/* helpers */
function makeCanvasTexture(w, h, fn) {
    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    fn(c.getContext('2d'), w, h);
    var t = new T.CanvasTexture(c);
    t.encoding = T.sRGBEncoding;
    t.anisotropy = 8;
    return t;
}
var machine = new T.Group();
scene.add(machine);
function addBox(w, h, d, m, x, y, z, p) {
    var o = new T.Mesh(new T.BoxGeometry(w, h, d), m);
    o.position.set(x, y, z);
    (p || machine).add(o);
    return o;
}
function addCylinder(r, h, m, x, y, z, p, rx, rz) {
    var o = new T.Mesh(new T.CylinderGeometry(r, r, h, 32), m);
    o.position.set(x, y, z);
    if (rx) {
        o.rotation.x = rx;
    }
    if (rz) {
        o.rotation.z = rz;
    }
    (p || machine).add(o);
    return o;
}
function decal(tex, w, h, x, y, z, basic) {
    var m = basic ? new T.MeshBasicMaterial({ map: tex, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }) : new T.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.5, metalness: 0.1, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
    var o = new T.Mesh(new T.PlaneGeometry(w, h), m);
    o.position.set(x, y, z);
    machine.add(o);
    return o;
}
function drawHelmetLogo(x, cx, cy, s, cut) {
    x.save();
    x.fillStyle = '#fff';
    x.beginPath();
    x.arc(cx, cy, s, Math.PI * 0.85, Math.PI * 2.05);
    x.lineTo(cx + s * 0.95, cy + s * 0.78);
    x.quadraticCurveTo(cx, cy + s * 1.08, cx - s * 0.9, cy + s * 0.8);
    x.closePath();
    x.fill();
    x.clip();
    if (cut === 'clear') {
        x.globalCompositeOperation = 'destination-out';
        x.fillStyle = '#000';
    }
    else {
        x.fillStyle = cut;
    }
    x.beginPath();
    x.moveTo(cx - s * 0.05, cy - s * 0.28);
    x.quadraticCurveTo(cx + s * 0.5, cy - s * 0.4, cx + s * 1.2, cy - s * 0.1);
    x.lineTo(cx + s * 1.2, cy + s * 0.2);
    x.quadraticCurveTo(cx + s * 0.4, cy + s * 0.25, cx - s * 0.05, cy + s * 0.1);
    x.closePath();
    x.fill();
    x.restore();
}
function fillTextLines(x, arr, cx, y, lh) {
    arr.forEach(function (t, i) {
        x.fillText(t, cx, y + i * lh);
    });
}
/* materials */
function srgbColor(h) {
    return new T.Color(h).convertSRGBToLinear();
}
var black = new T.MeshPhysicalMaterial({ color: srgbColor(0x0e0e10), roughness: 0.22, metalness: 0.5, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.1 });
var red = new T.MeshPhysicalMaterial({ color: srgbColor(0xaf0010), roughness: 0.16, metalness: 0.12, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.15 });
var steel = new T.MeshStandardMaterial({ color: srgbColor(0xdcdcde), metalness: 1, roughness: 0.22 });
var plastic = new T.MeshStandardMaterial({ color: srgbColor(0x161618), roughness: 0.3, metalness: 0.3, envMapIntensity: 0.9 });
var lining = new T.MeshStandardMaterial({ color: 0xd2d2d6, metalness: 0.55, roughness: 0.45, side: T.BackSide });
var glass = new T.MeshPhysicalMaterial({ color: 0xe6f0f2, metalness: 0, roughness: 0.02, transparent: true, opacity: 0.13, clearcoat: 1, clearcoatRoughness: 0, envMapIntensity: 1.6, depthWrite: false });
var chamberLedMat = new T.MeshBasicMaterial({ color: new T.Color(1, 0.1, 0.05) });
