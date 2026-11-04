/*
 * helmet.js - Helmet: lofted shell geometry, baked shell texture, visor, padding, hardware and vents.
 * Classic script: shares the page's global scope with the other files in js/.
 * Load order matters; see the <script> tags at the bottom of index.html.
 */

/* helmet: lofted-deformed shell, graphics baked per-direction so stripes continue on every side */
var cleaning = false;
var HELMET_SCALE = 1;
function smoothStep(a, b, v) {
    var t = Math.min(1, Math.max(0, (v - a) / (b - a)));
    return t * t * (3 - 2 * t);
}
function clamp01(v) {
    return Math.min(1, Math.max(0, v));
}
function helmetSurfacePoint(x, y, z, s) {
    var w = 1 + 0.16 * smoothStep(-0.1, 0.8, -y) - 0.06 * smoothStep(0.3, 1, y);
    var t = z > 0 ? smoothStep(0.1, 0.95, -y) : 0;
    var f = Math.max(0, z);
    var X = x * 0.118 * w * (1 - 0.2 * t);
    var Y = y * 0.135 + (y > 0 ? 0.012 * y * (1 - Math.abs(z)) : 0);
    var Z = z * 0.155 * (1 + 0.03 * smoothStep(-0.2, 0.8, -y)) + 0.055 * t * f;
    if (z < 0) {
        Z -= 0.025 * smoothStep(0.3, 0.9, -y) * (-z) + 0.012 * Math.sin(Math.PI * smoothStep(-0.3, 0.3, y)) * (-z);
    }
    if (z > 0.2 && y < -0.35) {
        Y -= 0.01 * t * f;
    }
    return new T.Vector3(X * s, Y * s, Z * s);
}
/* helmet lower opening: rim height, rim radius, and vertical centre of the window ellipse */
var OPENING_Y = Math.cos(39 * Math.PI / 48);
var OPENING_RADIUS = Math.sin(39 * Math.PI / 48);
var WINDOW_CENTER_Y = -0.165;
function superEllipse(x, y, ax, hy) {
    return Math.pow(Math.abs(x / ax), 4) + Math.pow(Math.abs((y - WINDOW_CENTER_Y) / hy), 4);
}
function isInWindow(a) {
    return a.z > 0.3 && superEllipse(a.x, a.y, 0.64, 0.435) < 1;
}
function isInVisor(a) {
    return a.z > 0.25 && superEllipse(a.x, a.y, 0.72, 0.47) < 1;
}
function buildShellGeometry(vis, s) {
    var W = 96;
    var H = 64;
    var g = new T.SphereGeometry(1, W, H);
    g.rotateY(-Math.PI / 2);
    var p = g.attributes.position;
    var ix = g.index.array;
    var out = [];
    var a = new T.Vector3();
    for (var i = 0; i < ix.length; i += 3) {
        var cx = 0;
        var cy = 0;
        var cz = 0;
        for (var j = 0; j < 3; j++) {
            cx += p.getX(ix[i + j]);
            cy += p.getY(ix[i + j]);
            cz += p.getZ(ix[i + j]);
        }
        a.set(cx, cy, cz).normalize();
        if (vis ? isInVisor(a) : (cy / 3 > OPENING_Y && !isInWindow(a))) {
            out.push(ix[i], ix[i + 1], ix[i + 2]);
        }
    }
    var pos = new Float32Array(p.count * 3);
    for (var v = 0; v < p.count; v++) {
        var q = helmetSurfacePoint(p.getX(v), p.getY(v), p.getZ(v), s);
        pos[v * 3] = q.x;
        pos[v * 3 + 1] = q.y;
        pos[v * 3 + 2] = q.z;
    }
    var G = new T.BufferGeometry();
    G.setAttribute('position', new T.BufferAttribute(pos, 3));
    G.setAttribute('uv', g.attributes.uv);
    G.setIndex(out);
    G.computeVertexNormals();
    if (!vis) {
        var nm = G.attributes.normal;
        var t = new T.Vector3();
        var u = new T.Vector3();
        for (var r = 0; r <= H; r++) {
            var A = r * (W + 1);
            var B = A + W;
            t.fromBufferAttribute(nm, A);
            u.fromBufferAttribute(nm, B);
            t.add(u).normalize();
            nm.setXYZ(A, t.x, t.y, t.z);
            nm.setXYZ(B, t.x, t.y, t.z);
        }
        for (var c = 0; c <= W; c++) {
            nm.setXYZ(c, 0, 1, 0);
        }
    }
    return G;
}
function buildShellTexture() {
    var W = 1536;
    var Hh = 768;
    var c = document.createElement('canvas');
    c.width = W;
    c.height = Hh;
    var x = c.getContext('2d');
    var im = x.createImageData(W, Hh);
    var d = im.data;
    var B = [[0.62, 0.05, -0.1, 0.9], [0.38, 0.035, 0.1, 0.8], [0.12, 0.06, -0.2, 1.0], [-0.2, 0.04, 0.2, 0.7]];
    for (var py = 0; py < Hh; py++) {
        var th = (py + 0.5) / Hh * Math.PI;
        var Y = Math.cos(th);
        var st = Math.sin(th);
        for (var px = 0; px < W; px++) {
            var ph = (px + 0.5) / W * 6.2832;
            var X = -Math.sin(ph) * st;
            var Z = -Math.cos(ph) * st;
            var ax = Math.abs(X);
            var sv = 0;
            var side = smoothStep(0.25, 0.45, ax);
            if (side > 0) {
                var cc = Y + 0.8 * Z;
                var q = Z - 0.8 * Y;
                for (var b = 0; b < 4; b++) {
                    var wd = B[b][1] * Math.max(0, 1 - Math.abs(q - B[b][2]) / B[b][3]);
                    sv = Math.max(sv, clamp01((wd - Math.abs(cc - B[b][0])) / 0.006) * side);
                }
            }
            if (Y > 0.45) {
                var tw = 0.065 * Math.max(0, 1 - Math.abs(Z - 0.05) / 0.95) * smoothStep(0.45, 0.6, Y);
                sv = Math.max(sv, clamp01((tw - Math.abs(ax - 0.38)) / 0.006));
            }
            if (Z > 0.45 && Y < -0.5 && ax > 0.25 && ax < 0.55) {
                sv = Math.max(sv, clamp01((0.04 - Math.abs((ax - 0.4) + (Y + 0.7) * 0.8)) / 0.006));
            }
            if (Z < -0.55 && Y > -0.48 && Y < 0.14) {
                sv = Math.max(sv, clamp01(Math.min(Y + 0.48, 0.14 - Y) / 0.01) * smoothStep(-0.55, -0.7, Z));
                if (Z < -0.8 && ax < 0.25 && Y > -0.3 && Y < 0) {
                    sv = 0;
                }
            }
            var o = (py * W + px) * 4;
            d[o] = 5 + 174 * sv;
            d[o + 1] = 5 - 5 * sv;
            d[o + 2] = 6 + 12 * sv;
            d[o + 3] = 255;
        }
    }
    x.putImageData(im, 0, 0);
    x.fillStyle = '#fff';
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.font = 'bold 54px ' + FONT_STACK;
    x.fillText('MRS.G', W * 0.5, 252);
    x.font = 'bold 96px ' + FONT_STACK;
    x.fillText('MRS.G', 0, 435);
    x.fillText('MRS.G', W, 435);
    var t = new T.CanvasTexture(c);
    t.encoding = T.sRGBEncoding;
    t.anisotropy = 8;
    return t;
}
var fabricTex = makeCanvasTexture(128, 128, function (x, w, h) {
    x.fillStyle = '#121214';
    x.fillRect(0, 0, w, h);
    x.fillStyle = '#232327';
    for (var i = 0; i < 16; i++) {
        for (var j = 0; j < 16; j++) {
            x.beginPath();
            x.arc(4 + i * 8 + (j % 2) * 4, 4 + j * 8, 2, 0, 6.283);
            x.fill();
        }
    }
});
fabricTex.wrapS = fabricTex.wrapT = T.RepeatWrapping;
fabricTex.repeat.set(10, 6);
var helmetGroup = new T.Group();
machine.add(helmetGroup);
var shellMat = new T.MeshPhysicalMaterial({ map: buildShellTexture(), color: 0xffffff, roughness: 0.13, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.4 });
var visorMat = new T.MeshPhysicalMaterial({ color: srgbColor(0x0d1014), roughness: 0.04, metalness: 0.1, transparent: true, opacity: 0.5, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 2, side: T.DoubleSide, depthWrite: false });
var lipMat = new T.MeshPhysicalMaterial({ color: 0xcfd8dc, transparent: true, opacity: 0.6, roughness: 0.05, clearcoat: 1, depthWrite: false });
var ventMat = new T.MeshStandardMaterial({ color: srgbColor(0x1b1b1e), roughness: 0.5, metalness: 0.3 });
var ventDarkMat = new T.MeshStandardMaterial({ color: srgbColor(0x050506), roughness: 0.6 });
var rubberMat = new T.MeshStandardMaterial({ color: srgbColor(0x0b0b0c), roughness: 0.55 });
var fabricMat = new T.MeshStandardMaterial({ color: srgbColor(0x2a2a2e), map: fabricTex, bumpMap: fabricTex, bumpScale: 1.2, roughness: 0.95 });
var fabricInnerMat = fabricMat.clone();
fabricInnerMat.side = T.BackSide;
var hardwareMat = new T.MeshStandardMaterial({ color: srgbColor(0x2c2c30), metalness: 0.8, roughness: 0.3 });
var hardwareLightMat = new T.MeshStandardMaterial({ color: srgbColor(0x75757d), metalness: 1, roughness: 0.3 });
helmetGroup.add(new T.Mesh(buildShellGeometry(false, HELMET_SCALE), shellMat));
helmetGroup.add(new T.Mesh(buildShellGeometry(false, 0.94), fabricInnerMat));
var VISOR_PIVOT = new T.Vector3(0, 0.004, 0.035);
var visorGroup = new T.Group();
visorGroup.position.copy(VISOR_PIVOT);
helmetGroup.add(visorGroup);
[1.085, 1.0735].forEach(function (vs) {
    var vg = buildShellGeometry(true, vs);
    vg.translate(-VISOR_PIVOT.x, -VISOR_PIVOT.y, -VISOR_PIVOT.z);
    visorGroup.add(new T.Mesh(vg, visorMat));
});
function tube(pts, r, m, cl_, par) {
    var o = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts, cl_), pts.length * 3, r, 8, cl_), m);
    (par || helmetGroup).add(o);
    return o;
}
function signedSqrt(v) {
    return Math.sign(v) * Math.sqrt(Math.abs(v));
}
var windowRimPoints = [];
var visorRimPoints = [];
for (var wi = 0; wi < 72; wi++) {
    var wa = wi / 72 * 6.2832;
    var wc = Math.cos(wa);
    var ws = Math.sin(wa);
    [[0.64, 0.435, windowRimPoints, 1.002], [0.72, 0.47, visorRimPoints, 1.085]].forEach(function (e) {
        var n = new T.Vector3(e[0] * signedSqrt(wc), WINDOW_CENTER_Y + e[1] * signedSqrt(ws), 0);
        n.z = Math.sqrt(Math.max(0.01, 1 - n.x * n.x - n.y * n.y));
        n.normalize();
        e[2].push(helmetSurfacePoint(n.x, n.y, n.z, e[3]));
    });
}
tube(windowRimPoints, 0.0055, rubberMat, true);
var visorRimLocalPoints = visorRimPoints.map(function (v) {
    return v.clone().sub(VISOR_PIVOT);
});
tube(visorRimLocalPoints.slice(36), 0.0035, lipMat, false, visorGroup);
tube(visorRimLocalPoints.slice(0, 37), 0.0035, lipMat, false, visorGroup);
var openingRingPoints = [];
var openingRingMinY = 9;
for (var ri = 0; ri < 64; ri++) {
    var ra = ri / 64 * 6.2832;
    var pt = helmetSurfacePoint(OPENING_RADIUS * Math.cos(ra), OPENING_Y, OPENING_RADIUS * Math.sin(ra), HELMET_SCALE);
    openingRingPoints.push(pt);
    openingRingMinY = Math.min(openingRingMinY, pt.y);
}
tube(openingRingPoints, 0.007, rubberMat, true);
helmetGroup.position.set(0, 0.96 - openingRingMinY + 0.007, -0.04);
var chinVentPoints = [];
for (var si = -10; si <= 10; si++) {
    var sa = si / 10 * 1.0;
    var n2 = new T.Vector3(Math.sin(sa) * 0.9, -0.35, -Math.cos(sa) * 0.9).normalize();
    chinVentPoints.push(helmetSurfacePoint(n2.x, n2.y, n2.z, 1.015));
}
tube(chinVentPoints, 0.008, ventMat, false);
function vent(d, w, h, m, sc) {
    var n = new T.Vector3(d[0], d[1], d[2]).normalize();
    var q = helmetSurfacePoint(n.x, n.y, n.z, sc || 1.004);
    var o = new T.Mesh(new T.BoxGeometry(w, h, 0.007), m || ventMat);
    o.position.copy(q);
    o.lookAt(q.clone().add(n));
    helmetGroup.add(o);
}
vent([0, -0.72, 0.7], 0.085, 0.032, ventDarkMat);
[-0.03, 0, 0.03].forEach(function (o) {
    vent([0, -0.72 + o, 0.7 - o * 0.8], 0.07, 0.004, ventMat, 1.009);
});
vent([0, 0.9, 0.42], 0.055, 0.09, ventDarkMat);
vent([0, 0.99, 0.06], 0.045, 0.07, ventDarkMat);
vent([0, 0.62, -0.78], 0.09, 0.03, ventDarkMat);
[-1, 1].forEach(function (sd) {
    vent([sd * 0.3, 0.1, -0.95], 0.02, 0.05, ventDarkMat);
    vent([sd * 0.55, -0.5, 0.65], 0.012, 0.04, ventDarkMat);
    var n = new T.Vector3(sd, 0.02, 0.2).normalize();
    var q = helmetSurfacePoint(n.x, n.y, n.z, 1.0);
    var g = new T.Group();
    g.position.copy(q);
    g.lookAt(q.clone().add(new T.Vector3(sd, 0, 0)));
    function cy2(r, hh, m, z) {
        var o = new T.Mesh(new T.CylinderGeometry(r, r, hh, 32), m);
        o.rotation.x = Math.PI / 2;
        o.position.z = z;
        g.add(o);
    }
    cy2(0.008, 0.004, hardwareLightMat, 0);
    helmetGroup.add(g);
    var lug = new T.Mesh(new T.BoxGeometry(0.034, 0.004, 0.05), hardwareMat);
    lug.position.set(sd * 0.103, -0.004, 0.03);
    visorGroup.add(lug);
    var sh = new T.Shape();
    sh.moveTo(0.02, 0);
    sh.lineTo(0.045, 0);
    sh.quadraticCurveTo(0.065, 0, 0.065, 0.03);
    sh.lineTo(0.065, 0.09);
    sh.quadraticCurveTo(0.065, 0.115, 0.045, 0.115);
    sh.lineTo(0.02, 0.115);
    sh.quadraticCurveTo(0, 0.115, 0, 0.09);
    sh.lineTo(0, 0.03);
    sh.quadraticCurveTo(0, 0, 0.02, 0);
    var pg = new T.ExtrudeGeometry(sh, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 4, curveSegments: 8 });
    pg.translate(-0.0325, -0.0575, 0);
    var pad = new T.Mesh(pg, fabricMat);
    pad.position.set(sd * 0.097, -0.03, 0.05);
    pad.rotation.y = -sd * Math.PI / 2;
    helmetGroup.add(pad);
    var sb = new T.Mesh(new T.BoxGeometry(0.014, 0.085, 0.004), rubberMat);
    sb.position.set(sd * 0.05, -0.085, 0.045);
    sb.rotation.z = sd * 0.5;
    helmetGroup.add(sb);
});
visorGroup.rotation.x = -1.52;
var collarPoints = [];
for (var ci = -5; ci <= 5; ci++) {
    var cn = new T.Vector3(ci * 0.12, -0.62, 0.72).normalize();
    collarPoints.push(helmetSurfacePoint(cn.x, cn.y, cn.z, 0.9));
}
tube(collarPoints, 0.016, fabricMat, false);
var buckle = new T.Mesh(new T.BoxGeometry(0.03, 0.022, 0.01), hardwareLightMat);
buckle.position.set(0, -0.105, 0.05);
helmetGroup.add(buckle);
var buckleButton = new T.Mesh(new T.BoxGeometry(0.014, 0.012, 0.012), new T.MeshStandardMaterial({ color: srgbColor(0xb2000f), roughness: 0.4 }));
buckleButton.position.set(0, -0.105, 0.057);
helmetGroup.add(buckleButton);
