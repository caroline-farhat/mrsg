# MRS.G Helmet Cleaning Machine – 3D Website

Interactive 3D preview of the MRS.G helmet cleaning machine (Three.js r128): machine, helmet, opening door,
showroom, camera views and a compressed cleaning demonstration.

## Run it in Visual Studio Code

1. Install the **Live Server** extension (Ritwick Dey) in VS Code.
2. Open this folder: **File → Open Folder… → `MRS-G-Website`**.
3. Right-click `index.html` and choose **Open with Live Server** (or click **Go Live** in the status bar).
4. The site opens at `http://127.0.0.1:5500`.

An internet connection is required: Three.js and its add-ons load from a CDN, and the Manrope font from Google Fonts.
Opening `index.html` by double-clicking also works, but a local server is recommended.

## Project structure

```
MRS-G-Website/
├── index.html          Page markup and <script> tags (in load order)
├── css/style.css       All styling
└── js/
    ├── main.js         Scene bootstrap: renderer, scene, lights, drawing helpers, shared materials
    ├── machine.js      Machine body, chamber, fans, hinged door, touchscreen and front graphics
    ├── helmet.js       Helmet shell, visor, padding, hardware and vents
    ├── animations.js   Disinfectant mist particle system
    ├── showroom.js     Stage, LED rings, walls, ceiling, wall logo/signage, contact shadow, bloom
    └── controls.js     Orbit camera, buttons, cleaning sequence, resize and the render loop
```

## Important: script load order

The JavaScript files are plain (non-module) scripts that **share one global scope**, exactly like the original
single-file page. They must stay in the order listed in `index.html`
(`main → machine → helmet → animations → showroom → controls`) because each file uses variables created by the
files before it. The code was split in its original order without any changes to values or logic, so do not
reorder the `<script>` tags. `controls.js` is last because it starts the render loop.

## Editing tips

- Machine dimensions, colours and materials: `js/main.js` (materials) and `js/machine.js`.
- Door, view buttons and cleaning timing: `js/controls.js`.
- Showroom look, LEDs, ceiling and signage: `js/showroom.js`.
- No build step, framework or package install is needed.
