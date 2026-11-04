/*
 * machine.js - MRS.G machine: body, chamber, fans, hinged door, control-face decal, touchscreen and front panel graphics.
 * Classic script: shares the page's global scope with the other files in js/.
 * Load order matters; see the <script> tags at the bottom of index.html.
 */

/* sections (metres): feet 0.05, lower 0.05-0.887, chamber 0.887-1.484, top 1.484-1.92 */
addBox(MACHINE_WIDTH, 0.836, MACHINE_DEPTH, black, 0, 0.469, 0);
addBox(0.548, 0.835, 0.01, red, 0, 0.4695, 0.305);
addBox(MACHINE_WIDTH, 0.436, MACHINE_DEPTH, black, 0, 1.702, 0);
[0.887, 1.484].forEach(function (y) {
    addBox(MACHINE_WIDTH + 0.004, 0.005, 0.004, new T.MeshBasicMaterial({ color: 0x000000 }), 0, y, 0.3);
});
[[-0.265, -0.265], [0.265, -0.265], [-0.265, 0.265], [0.265, 0.265]].forEach(function (p) {
    addCylinder(0.024, 0.05, plastic, p[0], 0.025, p[1]);
    addCylinder(0.034, 0.012, plastic, p[0], 0.056, p[1]);
});
/* chamber shell */
addBox(0.085, 0.597, 0.55, black, -0.2575, 1.1855, -0.025);
addBox(0.085, 0.597, 0.55, black, 0.2575, 1.1855, -0.025);
addBox(0.43, 0.06, 0.55, black, 0, 1.454, -0.025);
addBox(0.43, 0.042, 0.55, black, 0, 0.908, -0.025);
addBox(MACHINE_WIDTH, 0.597, 0.05, black, 0, 1.1855, -0.275);
var chamberInner = new T.Mesh(new T.BoxGeometry(0.426, 0.491, 0.496), lining);
chamberInner.position.set(0, 1.1765, 0);
machine.add(chamberInner);
var chamberLightUpper = new T.PointLight(0xff3a2a, 1.5, 1.7, 1.2);
chamberLightUpper.position.set(0, 1.38, 0.08);
machine.add(chamberLightUpper);
var chamberLightLower = new T.PointLight(0xff5a48, 0.7, 1.5, 1.2);
chamberLightLower.position.set(0, 1.0, 0.12);
machine.add(chamberLightLower);
addBox(0.26, 0.008, 0.012, chamberLedMat, 0, 1.418, -0.12);
[-1, 1].forEach(function (s) {
    var o = addBox(0.012, 0.008, 0.17, chamberLedMat, s * 0.19, 1.418, 0.1);
    o.rotation.y = s * 0.35;
});
/* helmet platform */
addCylinder(0.15, 0.03, plastic, 0, 0.945, -0.04);
/* fans */
var fanTex = makeCanvasTexture(256, 256, function (x) {
    x.translate(128, 128);
    x.strokeStyle = '#5a5a62';
    x.lineWidth = 7;
    x.beginPath();
    x.arc(0, 0, 116, 0, 6.283);
    x.stroke();
    x.lineWidth = 4;
    for (var r = 30; r < 112; r += 22) {
        x.beginPath();
        x.arc(0, 0, r, 0, 6.283);
        x.stroke();
    }
    for (var a = 0; a < 12; a++) {
        x.save();
        x.rotate(a * Math.PI / 6);
        x.beginPath();
        x.moveTo(0, 0);
        x.lineTo(112, 0);
        x.stroke();
        x.restore();
    }
    x.fillStyle = '#222226';
    x.beginPath();
    x.arc(0, 0, 24, 0, 6.283);
    x.fill();
});
var fanM = new T.MeshStandardMaterial({ map: fanTex, transparent: true, roughness: 0.5, metalness: 0.5 });
var bladeTex = makeCanvasTexture(256, 256, function (x) {
    x.translate(128, 128);
    x.fillStyle = '#0d0d10';
    x.beginPath();
    x.arc(0, 0, 120, 0, 6.283);
    x.fill();
    x.fillStyle = '#43434a';
    for (var a = 0; a < 7; a++) {
        x.save();
        x.rotate(a * 6.283 / 7);
        x.beginPath();
        x.moveTo(8, 0);
        x.quadraticCurveTo(60, -48, 108, -14);
        x.lineTo(108, 14);
        x.quadraticCurveTo(55, -8, 8, 22);
        x.fill();
        x.restore();
    }
    x.fillStyle = '#222226';
    x.beginPath();
    x.arc(0, 0, 26, 0, 6.283);
    x.fill();
});
var bladeM = new T.MeshStandardMaterial({ map: bladeTex, roughness: 0.6, metalness: 0.4 });
var fans = [];
function addFan(d, x, y, z, ry) {
    var g = new T.Group();
    g.position.set(x, y, z);
    g.rotation.y = ry;
    var b = new T.Mesh(new T.PlaneGeometry(d, d), bladeM);
    b.position.z = -0.004;
    g.add(b);
    g.add(new T.Mesh(new T.PlaneGeometry(d, d), fanM));
    fans.push(b);
    machine.add(g);
}
addFan(0.11, -0.1, 1.29, -0.246, 0);
addFan(0.11, 0.1, 1.29, -0.246, 0);
[-1, 1].forEach(function (s) {
    addFan(0.05, s * 0.2115, 1.33, -0.12, -s * Math.PI / 2);
    addFan(0.06, s * 0.2115, 1.1, -0.12, -s * Math.PI / 2);
    addFan(0.06, s * 0.2115, 0.99, -0.12, -s * Math.PI / 2);
});
/* door (hinged on left) */
var door = new T.Group();
door.position.set(-0.3, 1.1855, 0.3);
machine.add(door);
addBox(MACHINE_WIDTH, 0.06, 0.05, black, 0.3, 0.2685, -0.025, door);
addBox(MACHINE_WIDTH, 0.042, 0.05, black, 0.3, -0.2775, -0.025, door);
addBox(0.085, 0.597, 0.05, black, 0.0425, 0, -0.025, door);
addBox(0.085, 0.597, 0.05, black, 0.5575, 0, -0.025, door);
var gl = new T.Mesh(new T.PlaneGeometry(0.43, 0.495), glass);
gl.position.set(0.3, -0.009, -0.027);
door.add(gl);
addCylinder(0.011, 0.28, steel, 0.554, 0, 0.042, door);
[-0.12, 0.12].forEach(function (y) {
    addCylinder(0.008, 0.042, steel, 0.554, y, 0.02, door, Math.PI / 2);
});
addCylinder(0.009, 0.006, steel, -0.245, 1.53, 0.302, null, Math.PI / 2);
/* control face decal */
var FACE_SCALE = 2.286;
var faceX = function (v) {
    return (v - 250) * FACE_SCALE;
};
var faceY = function (v) {
    return (v - 18) * FACE_SCALE;
};
var controlFaceTex = makeCanvasTexture(1200, 872, function (x) {
    x.fillStyle = '#0a0a0b';
    x.beginPath();
    x.rect(faceX(646), faceY(116), faceX(724) - faceX(646), faceY(260) - faceY(116));
    x.fill();
    x.fillStyle = '#17181b';
    x.fillRect(faceX(649), faceY(120), faceX(720) - faceX(649), faceY(185) - faceY(120));
    x.strokeStyle = '#e8e8ea';
    x.lineWidth = 3;
    for (var r = 10; r <= 26; r += 8) {
        x.beginPath();
        x.arc(faceX(685), faceY(160), r * 1.4, -0.9, 0.9);
        x.stroke();
    }
    x.fillStyle = '#0d0d0f';
    x.fillRect(faceX(649), faceY(195), faceX(720) - faceX(649), faceY(257) - faceY(195));
    x.fillStyle = '#d9d9dc';
    x.fillRect(faceX(657), faceY(205), faceX(712) - faceX(657), 12);
    x.fillStyle = '#050506';
    x.fillRect(faceX(662), faceY(228), faceX(706) - faceX(662), 10);
    x.fillStyle = '#050506';
    x.strokeStyle = '#2a2b2f';
    x.lineWidth = 4;
    x.beginPath();
    x.rect(453, 158, 324, 498);
    x.fill();
    x.stroke();
    x.globalCompositeOperation = 'destination-out';
    x.fillRect(481, 188, 268, 440);
    x.globalCompositeOperation = 'source-over';
    var tp = [91, 150, 205, 262];
    var bt = [140, 193, 246, 305];
    var tx = [['KASKINI', 'YERLEŞTİR'], ['ÖDEMENİ YAP'], ['TEMİZLİK', 'BAŞLASIN'], ['TEMİZ', 'KASKINI AL']];
    x.textAlign = 'left';
    x.textBaseline = 'middle';
    for (var i = 0; i < 4; i++) {
        var y0 = faceY(tp[i]);
        var y1 = faceY(bt[i]);
        var m = (y0 + y1) / 2;
        x.fillStyle = i ? '#2b2c30' : '#c8101e';
        x.fillRect(98, y0, 217, y1 - y0);
        x.strokeStyle = '#e6e6e8';
        x.lineWidth = 3;
        x.beginPath();
        x.arc(144, m, 22, 0, 6.283);
        x.stroke();
        x.beginPath();
        x.arc(144, m, 10, 0, 6.283);
        x.stroke();
        x.fillStyle = '#fff';
        x.font = 'bold 17px ' + FONT_STACK;
        fillTextLines(x, tx[i], 194, m - (tx[i].length - 1) * 10, 22);
    }
    x.fillStyle = '#17181b';
    x.beginPath();
    x.arc(120, faceY(325), 15, 0, 6.283);
    x.fill();
    x.fillStyle = '#050506';
    x.beginPath();
    x.arc(120, faceY(325), 6, 0, 6.283);
    x.fill();
});
decal(controlFaceTex, MACHINE_WIDTH, 0.436, 0, 1.702, 0.3005);
var screenTex = makeCanvasTexture(540, 884, function (x, w, h) {
    x.fillStyle = '#0b0b0e';
    x.fillRect(0, 0, w, h);
    drawHelmetLogo(x, 270, 200, 62, '#0b0b0e');
    x.textAlign = 'center';
    x.fillStyle = '#fff';
    x.font = 'bold 76px ' + FONT_STACK;
    x.fillText('MRS.G', 270, 345);
    x.fillStyle = '#cfcfd2';
    x.font = '600 16px ' + FONT_STACK;
    x.fillText('HELMET CLEANING SYSTEMS', 270, 384);
    x.fillStyle = '#c8101e';
    x.fillRect(100, 560, 340, 62);
    x.fillStyle = '#fff';
    x.font = 'bold 26px ' + FONT_STACK;
    x.fillText('BAŞLAT', 270, 600);
    x.fillStyle = '#8c8c92';
    x.font = '600 22px ' + FONT_STACK;
    x.fillText('TR        EN        AR', 270, 790);
});
decal(screenTex, 0.135, 0.221, 0.0075, 1.716, 0.3012, true);
/* red front decal */
/* lower red panel: separate high-res vector-drawn layers (mm units, origin = panel top-centre), unlit pure white */
var maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
function addFrontPanelLayer(top, hmm, fn) {
    var k = 2048 / 550;
    var c = document.createElement('canvas');
    c.width = 2048;
    c.height = Math.round(hmm * k);
    var x = c.getContext('2d');
    x.scale(k, k);
    x.translate(275, -top);
    x.fillStyle = '#fff';
    x.strokeStyle = '#fff';
    x.textAlign = 'center';
    x.textBaseline = 'alphabetic';
    x.lineCap = 'round';
    x.lineJoin = 'round';
    fn(x);
    var t = new T.CanvasTexture(c);
    t.encoding = T.sRGBEncoding;
    t.anisotropy = maxAnisotropy;
    t.minFilter = T.LinearMipmapLinearFilter;
    var o = new T.Mesh(new T.PlaneGeometry(0.55, hmm / 1000), new T.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    o.position.set(0, 0.887 - (top + hmm / 2) / 1000, 0.3108);
    machine.add(o);
}
function setLetterSpacing(x, v) {
    if ('letterSpacing' in x) {
        x.letterSpacing = v;
    }
}
addFrontPanelLayer(0, 245, function (x) {
    drawHelmetLogo(x, -0.5, 102.5, 66, 'clear');
    x.fillStyle = '#fff';
    x.font = 'bold 100px ' + FONT_STACK;
    var f = 100 * 199 / x.measureText('MRS.G').width;
    x.font = 'bold ' + f + 'px ' + FONT_STACK;
    x.fillText('MRS.G', 0, 217.5);
    x.font = 'bold 16.4px ' + FONT_STACK;
    setLetterSpacing(x, '0.6px');
    x.fillText('HELMET CLEANING SYSTEMS', 0, 231);
});
addFrontPanelLayer(245, 255, function (x) {
    setLetterSpacing(x, '1.5px');
    x.font = 'bold 100px ' + FONT_STACK;
    var fs = 100 * 403.5 / x.measureText('TEMİZLEME').width;
    x.font = 'bold ' + fs + 'px ' + FONT_STACK;
    x.fillText('KASK', 0, 330);
    x.fillText('TEMİZLEME', 0, 401.5);
    x.fillText('MAKİNESİ', 0, 473);
});
addFrontPanelLayer(500, 200, function (x) {
    var cx = [-200.5, -65.5, 69, 200.5];
    var L = [['HİJYENİK', 'TEMİZLİK'], ['KÖTÜ KOKU', 'GİDERME'], ['HIZLI', 'KURUTMA'], ['KASKINIZ', 'GÜVENDE']];
    L.forEach(function (l, i) {
        var c = cx[i];
        x.lineWidth = 2.1;
        x.beginPath();
        x.arc(c, 571.5, 32, 0, 6.283);
        x.stroke();
        x.save();
        x.translate(c, 571.5);
        x.scale(0.535, 0.535);
        x.lineWidth = 5;
        x.beginPath();
        var u = 0;
        var cy = 0;
        if (i == 0) {
            x.moveTo(u - 22, cy + 16);
            x.quadraticCurveTo(u - 22, cy - 24, u + 20, cy - 20);
            x.quadraticCurveTo(u + 22, cy + 20, u - 22, cy + 16);
            x.moveTo(u - 24, cy + 24);
            x.lineTo(u, cy - 2);
        }
        if (i == 1) {
            for (var j = -1; j <= 1; j++) {
                x.moveTo(u - 28, cy + j * 15);
                x.quadraticCurveTo(u + 8, cy + j * 15 - 8, u + 24, cy + j * 15 - (j ? 0 : 6));
            }
        }
        if (i == 2) {
            x.arc(u, cy, 13, 0, 6.283);
            for (var a = 0; a < 8; a++) {
                var t = a * Math.PI / 4;
                x.moveTo(u + Math.cos(t) * 19, cy + Math.sin(t) * 19);
                x.lineTo(u + Math.cos(t) * 27, cy + Math.sin(t) * 27);
            }
        }
        if (i == 3) {
            x.moveTo(u, cy - 28);
            x.lineTo(u + 22, cy - 18);
            x.lineTo(u + 22, cy + 4);
            x.quadraticCurveTo(u + 20, cy + 22, u, cy + 30);
            x.quadraticCurveTo(u - 20, cy + 22, u - 22, cy + 4);
            x.lineTo(u - 22, cy - 18);
            x.closePath();
            x.moveTo(u - 9, cy + 1);
            x.lineTo(u - 2, cy + 9);
            x.lineTo(u + 11, cy - 7);
        }
        x.stroke();
        x.restore();
        setLetterSpacing(x, '0.3px');
        x.font = 'bold 17.5px ' + FONT_STACK;
        x.fillText(l[0], c, 627.5);
        x.fillText(l[1], c, 648);
    });
});
