/*
 * showroom.js - Showroom: reflective floor, stage tiers and LED rings, faceted walls, ceiling, wall logo and signage, contact shadow, selective bloom.
 * Classic script: shares the page's global scope with the other files in js/.
 * Load order matters; see the <script> tags at the bottom of index.html.
 */

/* cohesive 360-degree showroom, presentation stage and reflective floor */
var showroomGroup = new T.Group();
var architectureGroup = new T.Group();
var roomGroup = new T.Group();
scene.add(showroomGroup);
showroomGroup.add(roomGroup, architectureGroup);
var floorM = new T.MeshPhysicalMaterial({ color: srgbColor(0x010102), roughness: 0.5, metalness: 0.08, clearcoat: 0.14, clearcoatRoughness: 0.5, envMapIntensity: 0.12, transparent: true, opacity: 0.87, depthWrite: false });
var sideM = new T.MeshPhysicalMaterial({ color: srgbColor(0x020203), roughness: 0.42, metalness: 0.3, clearcoat: 0.2, clearcoatRoughness: 0.36, envMapIntensity: 0.38 });
var topM = new T.MeshPhysicalMaterial({ color: srgbColor(0x050507), roughness: 0.3, metalness: 0.2, clearcoat: 0.42, clearcoatRoughness: 0.24, envMapIntensity: 0.48 });
var wallM = new T.MeshStandardMaterial({ color: srgbColor(0x020203), roughness: 0.72, metalness: 0.08, envMapIntensity: 0.14 });
var wallM2 = new T.MeshStandardMaterial({ color: srgbColor(0x08080c), roughness: 0.6, metalness: 0.2, envMapIntensity: 0.28 });
var trimM = new T.MeshStandardMaterial({ color: srgbColor(0x111116), roughness: 0.3, metalness: 0.68, envMapIntensity: 0.58 });
var edgeM = new T.MeshStandardMaterial({ color: srgbColor(0x202026), roughness: 0.24, metalness: 0.76, envMapIntensity: 0.66 });
var BRAND_RED = 0xc8101e;
var stageLED = new T.MeshStandardMaterial({ color: srgbColor(0x78000b), emissive: srgbColor(BRAND_RED), emissiveIntensity: 4.2, roughness: 0.18, metalness: 0.08, toneMapped: false });
var archLED = new T.MeshStandardMaterial({ color: srgbColor(0x680009), emissive: srgbColor(BRAND_RED), emissiveIntensity: 4.8, roughness: 0.16, metalness: 0.06, toneMapped: false });
var ledGlow = new T.MeshBasicMaterial({ color: 0xd61222, transparent: true, opacity: 0.13, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false });
var BLOOM_LAYER = new T.Layers();
BLOOM_LAYER.set(1);
function bloom(o) {
    o.layers.enable(1);
    return o;
}
/* true planar reflections under a controlled-gloss surface */
if (T.Reflector) {
    var mirror = new T.Reflector(new T.PlaneGeometry(24, 24), { clipBias: 0.003, textureWidth: 1024, textureHeight: 1024, color: 0x030305 });
    mirror.rotation.x = -Math.PI / 2;
    mirror.position.y = -0.244;
    mirror.material.transparent = true;
    mirror.material.opacity = 0.39;
    showroomGroup.add(mirror);
}
var floor = new T.Mesh(new T.PlaneGeometry(24, 24), floorM);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.241;
floor.receiveShadow = true;
showroomGroup.add(floor);
/* real multi-level stage; its top surface finishes at machine-foot level y=0 */
function tier(r, h, y) {
    var s = new T.Mesh(new T.CylinderGeometry(r, r, h, 96), sideM);
    s.position.y = y;
    s.receiveShadow = true;
    s.castShadow = true;
    showroomGroup.add(s);
    var t = new T.Mesh(new T.CylinderGeometry(r - 0.012, r - 0.012, 0.012, 96), topM);
    t.position.y = y + h / 2 - 0.0055;
    t.receiveShadow = true;
    showroomGroup.add(t);
    var e = new T.Mesh(new T.TorusGeometry(r - 0.012, 0.006, 8, 128), edgeM);
    e.rotation.x = Math.PI / 2;
    e.position.y = y + h / 2 - 0.002;
    showroomGroup.add(e);
}
tier(1.42, 0.11, -0.19);
tier(1.12, 0.085, -0.0925);
tier(0.85, 0.055, -0.0275);
function ring(r, y) {
    var q = bloom(new T.Mesh(new T.TorusGeometry(r, 0.009, 10, 128), stageLED));
    q.rotation.x = Math.PI / 2;
    q.position.y = y;
    showroomGroup.add(q);
    var g = bloom(new T.Mesh(new T.TorusGeometry(r, 0.034, 10, 128), ledGlow));
    g.rotation.x = Math.PI / 2;
    g.position.y = y - 0.003;
    showroomGroup.add(g);
}
ring(1.425, -0.136);
ring(1.125, -0.051);
ring(0.855, 0.001);
[-1, 1].forEach(function (s) {
    var b = new T.PointLight(BRAND_RED, 0.19, 2.9, 2);
    b.position.set(s * 1.18, -0.04, 0.12);
    showroomGroup.add(b);
});
/* continuous faceted perimeter: rear, corners, sides and front all connect */
var ROOM_RADIUS = 9.75;
var WALL_HEIGHT = 5.25;
var WALL_SEGMENTS = 20;
var segmentAngle = 2 * Math.PI / WALL_SEGMENTS;
var segmentWidth = 2 * ROOM_RADIUS * Math.tan(segmentAngle / 2) + 0.08;
function localBeam(parent, a, b, width, depth, mat, z) {
    var dx = b[0] - a[0];
    var dy = b[1] - a[1];
    var len = Math.hypot(dx, dy);
    var o = new T.Mesh(new T.BoxGeometry(len, width, depth), mat);
    o.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, z);
    o.rotation.z = Math.atan2(dy, dx);
    o.castShadow = true;
    o.receiveShadow = true;
    parent.add(o);
    return o;
}
for (var wi = 0; wi < WALL_SEGMENTS; wi++) {
    (function (i) {
        var a = i * segmentAngle;
        var g = new T.Group();
        g.position.set(Math.sin(a) * ROOM_RADIUS, 0, Math.cos(a) * ROOM_RADIUS);
        g.lookAt(0, 0, 0);
        roomGroup.add(g);
        var wall = new T.Mesh(new T.BoxGeometry(segmentWidth, WALL_HEIGHT, 0.34), i % 2 ? wallM : wallM2);
        wall.position.y = 2.35;
        wall.receiveShadow = true;
        g.add(wall);
        var seam = new T.Mesh(new T.BoxGeometry(0.055, WALL_HEIGHT, 0.11), trimM);
        seam.position.set(-segmentWidth / 2, 2.35, 0.23);
        g.add(seam);
        var flip = i % 2 ? 1 : -1;
        var p1 = [-segmentWidth * .46, 0.32];
        var p2 = [segmentWidth * .46, 3.9];
        if (flip < 0) {
            p1[1] = 3.9;
            p2[1] = 0.32;
        }
        localBeam(g, p1, p2, 0.19, 0.16, wallM2, 0.22);
        if (i % 2 === 0) {
            bloom(localBeam(g, p1, p2, 0.018, 0.045, archLED, 0.315));
            var gh = bloom(localBeam(g, p1, p2, 0.072, 0.026, ledGlow, 0.342));
            gh.renderOrder = 2;
        }
        var inset = new T.Mesh(new T.BoxGeometry(segmentWidth * .7, 0.045, 0.09), trimM);
        inset.position.set(0, 4.48, 0.22);
        g.add(inset);
    })(wi);
}
/* designed architectural ceiling: layered panels, angular ribs and recessed light */
var ceilingM = new T.MeshStandardMaterial({ color: srgbColor(0x010102), roughness: 0.86, metalness: 0.04, side: T.DoubleSide });
var ceilingPanelM = new T.MeshStandardMaterial({ color: srgbColor(0x050507), roughness: 0.6, metalness: 0.18, envMapIntensity: 0.22 });
var ceiling = new T.Mesh(new T.CircleGeometry(ROOM_RADIUS + 0.35, 80), ceilingM);
ceiling.rotation.x = Math.PI / 2;
ceiling.position.y = 4.38;
roomGroup.add(ceiling);
var cove = new T.Mesh(new T.TorusGeometry(ROOM_RADIUS - 0.28, 0.045, 8, 160), trimM);
cove.rotation.x = Math.PI / 2;
cove.position.y = 4.28;
roomGroup.add(cove);
function ceilingBeam(a, b, width, height, mat, y) {
    var dx = b[0] - a[0];
    var dz = b[1] - a[1];
    var len = Math.hypot(dx, dz);
    var o = new T.Mesh(new T.BoxGeometry(len, height, width), mat);
    o.position.set((a[0] + b[0]) / 2, y, (a[1] + b[1]) / 2);
    o.rotation.y = -Math.atan2(dz, dx);
    o.castShadow = true;
    o.receiveShadow = true;
    roomGroup.add(o);
    return o;
}
function ceilingBeam3D(a, b, width, depth, mat) {
    var av = new T.Vector3(a[0], a[1], a[2]);
    var bv = new T.Vector3(b[0], b[1], b[2]);
    var d = bv.clone().sub(av);
    var len = d.length();
    var o = new T.Mesh(new T.BoxGeometry(len, width, depth), mat);
    o.position.copy(av.clone().add(bv).multiplyScalar(.5));
    o.quaternion.setFromUnitVectors(new T.Vector3(1, 0, 0), d.normalize());
    o.castShadow = true;
    o.receiveShadow = true;
    roomGroup.add(o);
    return o;
}
function ceilingLight(a, b, y) {
    var c = bloom(ceilingBeam(a, b, 0.026, 0.028, archLED, y));
    var g = bloom(ceilingBeam(a, b, 0.12, 0.018, ledGlow, y - 0.022));
    g.renderOrder = 3;
    return c;
}
var canopy = new T.Mesh(new T.CylinderGeometry(1.72, 1.72, 0.2, 8), ceilingPanelM);
canopy.position.y = 3.72;
canopy.rotation.y = Math.PI / 8;
canopy.castShadow = true;
roomGroup.add(canopy);
[[[-6, -3.9], [0, -1.72], [6, -3.9]], [[-6, 3.9], [0, 1.72], [6, 3.9]], [[-5.7, -3.8], [-2, 0], [-5.7, 3.8]], [[5.7, -3.8], [2, 0], [5.7, 3.8]]].forEach(function (v, i) {
    ceilingBeam(v[0], v[1], 0.68, 0.22, i % 2 ? wallM2 : ceilingPanelM, 3.45 - i * .025);
    ceilingBeam(v[1], v[2], 0.68, 0.22, i % 2 ? wallM2 : ceilingPanelM, 3.45 - i * .025);
});
ceilingLight([-6, -3.9], [0, -1.72], 3.315);
ceilingLight([0, -1.72], [6, -3.9], 3.315);
ceilingLight([-5.7, -3.8], [-2, 0], 3.265);
ceilingLight([2, 0], [5.7, 3.8], 3.215);
[[3.45, 2.72, .34], [-3.45, 2.72, -.34], [3.45, -2.72, -.34], [-3.45, -2.72, .34]].forEach(function (p, i) {
    var q = new T.Mesh(new T.BoxGeometry(3.5, 0.16, 1.42), i % 2 ? wallM2 : ceilingPanelM);
    q.position.set(p[0], 3.82, p[1]);
    q.rotation.y = p[2];
    q.castShadow = true;
    q.receiveShadow = true;
    roomGroup.add(q);
});
for (var cr = 0; cr < 8; cr++) {
    var ca = cr * Math.PI / 4;
    var sa = Math.sin(ca);
    var co = Math.cos(ca);
    var ra = [sa * 9.42, 4.22, co * 9.42];
    var rb = [sa * 5.45, 3.18, co * 5.45];
    ceilingBeam3D(ra, rb, 0.3, 0.42, trimM);
    if (cr === 3 || cr === 5) {
        var la = [ra[0], ra[1] - .18, ra[2]];
        var lb = [rb[0], rb[1] - .18, rb[2]];
        bloom(ceilingBeam3D(la, lb, 0.022, 0.045, archLED));
        bloom(ceilingBeam3D([la[0], la[1] - .025, la[2]], [lb[0], lb[1] - .025, lb[2]], 0.09, 0.025, ledGlow));
    }
}
var fixtureM = new T.MeshStandardMaterial({ color: srgbColor(0x101014), emissive: srgbColor(0xe8e4da), emissiveIntensity: 0.72, roughness: 0.28, metalness: 0.55 });
var fixture = new T.Mesh(new T.CylinderGeometry(0.48, 0.48, 0.1, 48), fixtureM);
fixture.position.y = 3.55;
roomGroup.add(fixture);
var fixtureRing = new T.Mesh(new T.TorusGeometry(0.49, 0.024, 8, 64), new T.MeshStandardMaterial({ color: srgbColor(0xd8d6d0), emissive: srgbColor(0xfff8ed), emissiveIntensity: 1.1, roughness: 0.3 }));
fixtureRing.rotation.x = Math.PI / 2;
fixtureRing.position.y = 3.495;
roomGroup.add(fixtureRing);
var beamHaze = new T.Mesh(new T.ConeGeometry(1.48, 3.28, 48, 1, true), new T.MeshBasicMaterial({ color: 0xfff7ea, transparent: true, opacity: 0.008, depthWrite: false, side: T.DoubleSide, blending: T.AdditiveBlending, toneMapped: false }));
beamHaze.position.y = 1.82;
beamHaze.renderOrder = 1;
roomGroup.add(beamHaze);
/* subtle embossed MRS.G identity panel integrated into the rear wall */
var logoTex = makeCanvasTexture(2048, 512, function (x, w, h) {
    x.clearRect(0, 0, w, h);
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.font = '700 250px ' + FONT_STACK;
    x.lineWidth = 7;
    x.strokeStyle = 'rgba(0,0,0,.88)';
    x.shadowColor = 'rgba(255,255,255,.1)';
    x.shadowBlur = 5;
    x.shadowOffsetY = -3;
    x.strokeText('MRS.G', w / 2, h / 2);
    x.fillStyle = 'rgba(25,25,30,.82)';
    x.fillText('MRS.G', w / 2, h / 2);
});
var logoPanel = new T.Mesh(new T.BoxGeometry(5.65, 1.5, 0.045), wallM2);
logoPanel.position.set(0, 2.12, -9.52);
architectureGroup.add(logoPanel);
var logoMat = new T.MeshStandardMaterial({ map: logoTex, bumpMap: logoTex, bumpScale: 0.028, transparent: true, roughness: 0.42, metalness: 0.38, envMapIntensity: 0.42, polygonOffset: true, polygonOffsetFactor: -2 });
var logoMark = new T.Mesh(new T.PlaneGeometry(5.25, 1.12), logoMat);
logoMark.position.set(0, 2.12, -9.492);
architectureGroup.add(logoMark);
/* layered V structures have real thickness and step forward from the rear wall */
function worldBeam(a, b, width, depth, mat, z) {
    var dx = b[0] - a[0];
    var dy = b[1] - a[1];
    var len = Math.hypot(dx, dy);
    var ang = Math.atan2(dy, dx);
    var o = new T.Mesh(new T.BoxGeometry(len, width, depth), mat);
    o.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, z);
    o.rotation.z = ang;
    o.castShadow = true;
    o.receiveShadow = true;
    architectureGroup.add(o);
    var e = new T.Mesh(new T.BoxGeometry(len * .985, 0.009, depth + 0.014), edgeM);
    e.position.copy(o.position);
    e.position.y += Math.cos(ang) * (width / 2 - 0.012);
    e.position.x -= Math.sin(ang) * (width / 2 - 0.012);
    e.rotation.z = ang;
    architectureGroup.add(e);
    return o;
}
function vLight(a, b, z, depth) {
    var dx = b[0] - a[0];
    var dy = b[1] - a[1];
    var len = Math.hypot(dx, dy);
    var ang = Math.atan2(dy, dx);
    var m = bloom(new T.Mesh(new T.BoxGeometry(len, 0.018, 0.05), archLED));
    m.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, z + depth / 2 + 0.028);
    m.rotation.z = ang;
    architectureGroup.add(m);
    var h = bloom(new T.Mesh(new T.BoxGeometry(len, 0.078, 0.026), ledGlow));
    h.position.copy(m.position);
    h.position.z += 0.018;
    h.rotation.z = ang;
    architectureGroup.add(h);
}
function chevron(w, apex, top, z, bw, depth, lit, mat) {
    var l = [-w / 2, top];
    var c = [0, apex];
    var r = [w / 2, top];
    worldBeam(l, c, bw, depth, mat, z);
    worldBeam(c, r, bw, depth, mat, z);
    if (lit) {
        vLight(l, c, z, depth);
        vLight(c, r, z, depth);
    }
}
chevron(10.2, 0.62, 4.7, -8.02, 0.78, 0.34, true, wallM2);
chevron(8.55, 1.12, 4.62, -8.28, 0.7, 0.4, false, wallM);
chevron(6.75, 1.72, 4.5, -8.52, 0.62, 0.46, true, wallM2);
chevron(4.85, 2.35, 4.38, -8.72, 0.54, 0.5, true, wallM);
/* premium dimensional MRS.G wall signage: sharp champagne faces, red depth and controlled backlight */
var signFaceTex = makeCanvasTexture(1536, 384, function (x, w, h) {
    x.clearRect(0, 0, w, h);
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.font = '700 238px ' + FONT_STACK;
    x.lineJoin = 'round';
    x.lineWidth = 8;
    x.strokeStyle = 'rgba(148,142,130,1)';
    x.strokeText('MRS.G', w / 2, h / 2);
    x.fillStyle = 'rgba(250,246,232,1)';
    x.fillText('MRS.G', w / 2, h / 2);
    x.lineWidth = 2;
    x.strokeStyle = 'rgba(255,253,244,.9)';
    x.strokeText('MRS.G', w / 2, h / 2 - 1);
});
var signDepthTex = makeCanvasTexture(1536, 384, function (x, w, h) {
    x.clearRect(0, 0, w, h);
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.font = '700 238px ' + FONT_STACK;
    x.lineWidth = 9;
    x.strokeStyle = 'rgba(52,3,8,1)';
    x.strokeText('MRS.G', w / 2, h / 2);
    x.fillStyle = 'rgba(116,5,16,1)';
    x.fillText('MRS.G', w / 2, h / 2);
});
var signHaloTex = makeCanvasTexture(1536, 384, function (x, w, h) {
    x.clearRect(0, 0, w, h);
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.font = '700 238px ' + FONT_STACK;
    x.shadowColor = 'rgba(214,18,34,.9)';
    x.shadowBlur = 44;
    x.fillStyle = 'rgba(200,16,30,.42)';
    x.fillText('MRS.G', w / 2, h / 2);
});
var signHalo = bloom(new T.Mesh(new T.PlaneGeometry(2.94, 0.735), new T.MeshBasicMaterial({ map: signHaloTex, transparent: true, opacity: 0.28, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false })));
signHalo.position.set(0, 2.12, -7.735);
signHalo.renderOrder = 4;
architectureGroup.add(signHalo);
var signDepthMat = new T.MeshStandardMaterial({ map: signDepthTex, transparent: true, alphaTest: 0.08, depthWrite: true, color: srgbColor(0x75101a), emissive: srgbColor(0x240006), emissiveIntensity: 0.16, roughness: 0.34, metalness: 0.42, envMapIntensity: 0.36, side: T.DoubleSide });
for (var signLayer = 0; signLayer < 9; signLayer++) {
    var signSlice = new T.Mesh(new T.PlaneGeometry(2.72, 0.68), signDepthMat);
    signSlice.position.set(0, 2.12, -7.72 + signLayer * 0.009);
    signSlice.renderOrder = 4.2 + signLayer * .02;
    architectureGroup.add(signSlice);
}
var signFaceMat = new T.MeshPhysicalMaterial({ map: signFaceTex, transparent: true, alphaTest: 0.08, depthWrite: true, color: srgbColor(0xffffff), emissive: srgbColor(0xfff4d6), emissiveIntensity: 0.88, roughness: 0.28, metalness: 0.24, clearcoat: 0.32, clearcoatRoughness: 0.22, envMapIntensity: 0.5, side: T.DoubleSide });
var signFace = new T.Mesh(new T.PlaneGeometry(2.72, 0.68), signFaceMat);
signFace.position.set(0, 2.12, -7.64);
signFace.renderOrder = 5;
architectureGroup.add(signFace);
var signBounce = new T.PointLight(BRAND_RED, 0.17, 2.35, 2);
signBounce.position.set(0, 2.1, -7.48);
architectureGroup.add(signBounce);
/* fixed red fixtures create local wall bounce at four architectural zones */
[Math.PI, Math.PI * .5, Math.PI * 1.5, 0].forEach(function (a, i) {
    var pl = new T.PointLight(BRAND_RED, i === 0 ? 0.82 : 0.5, 4.2, 2);
    pl.position.set(Math.sin(a) * 8.55, 1.65, Math.cos(a) * 8.55);
    roomGroup.add(pl);
});
/* subtle contact shadow on the top deck */
var contactShadowTex = makeCanvasTexture(256, 256, function (x, w, h) {
    var g = x.createRadialGradient(128, 128, 8, 128, 128, 128);
    g.addColorStop(0, 'rgba(0,0,0,.78)');
    g.addColorStop(0.45, 'rgba(0,0,0,.34)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, w, h);
});
var contactShadow = new T.Mesh(new T.PlaneGeometry(1.48, 1.48), new T.MeshBasicMaterial({ map: contactShadowTex, transparent: true, depthWrite: false }));
contactShadow.rotation.x = -Math.PI / 2;
contactShadow.position.y = 0.002;
showroomGroup.add(contactShadow);
machine.traverse(function (o) {
    if (o.isMesh && o.material !== glass && o.material !== visorMat) {
        o.castShadow = true;
    }
});
/* selective post-processing: only showroom emissive geometry contributes bloom */
var bloomComposer = null;
var finalComposer = null;
var bloomMaterials = {};
var darkMaterial = new T.MeshBasicMaterial({ color: 0x000000 });
function darkenNonBloomed(o) {
    if (o.isMesh && !BLOOM_LAYER.test(o.layers)) {
        bloomMaterials[o.uuid] = o.material;
        o.material = darkMaterial;
    }
}
function restoreBloomMaterial(o) {
    if (bloomMaterials[o.uuid]) {
        o.material = bloomMaterials[o.uuid];
        delete bloomMaterials[o.uuid];
    }
}
if (T.EffectComposer && T.UnrealBloomPass && T.ShaderPass) {
    var bloomPass = new T.UnrealBloomPass(new T.Vector2(1, 1), 0.86, 0.28, 0.02);
    bloomComposer = new T.EffectComposer(renderer);
    bloomComposer.renderToScreen = false;
    bloomComposer.addPass(new T.RenderPass(scene, camera));
    bloomComposer.addPass(bloomPass);
    var finalPass = new T.ShaderPass(new T.ShaderMaterial({ uniforms: { baseTexture: { value: null }, bloomTexture: { value: bloomComposer.renderTarget2.texture } }, vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}', fragmentShader: 'uniform sampler2D baseTexture;uniform sampler2D bloomTexture;varying vec2 vUv;void main(){vec4 base=texture2D(baseTexture,vUv);vec4 glow=texture2D(bloomTexture,vUv);gl_FragColor=base+glow*0.82;}' }), 'baseTexture');
    finalPass.needsSwap = true;
    finalComposer = new T.EffectComposer(renderer);
    finalComposer.addPass(new T.RenderPass(scene, camera));
    finalComposer.addPass(finalPass);
}
