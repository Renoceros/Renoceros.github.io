# Renoceros.github.io

Official personal portfolio and technical showcase of **Moreno Kristovan** (Renoceros) — Apple Developer Academy Graduate, CEO & Technical Product Architect.

Live Site: [https://renoceros.github.io](https://renoceros.github.io)

---

## 1. Architectural Philosophy

> *"I Build Tools. Not websites."*

This repository is engineered to mirror the precision of macOS native system software:
- **Zero-Bloat Front-End:** Native vanilla JavaScript, Bootstrap 5 grid primitives, custom Apple Human Interface Guidelines (HIG) CSS design tokens.
- **WebGL SDF Liquid Glass Engine:** Real-time signed distance field (SDF) refraction shader simulating frosted optical glass and chromatic aberration mapped to DOM element bounding boxes.
- **Battery-Saving Telemetry:** WebGL rendering loop pauses automatically via `visibilitychange` when tabs are backgrounded.
- **Retina Crispness:** Viewport resolution scales dynamically up to 2.0x DPR with device-pixel matching.
- **Keyboard Power Shortcuts:**
  - `T`: Toggle light / dark theme
  - `W`: Jump to Work / Projects
  - `E`: Jump to Exhibitions & Labs
  - `A`: Jump to About & Contact
  - `C`: Download Executive CV
  - `H` or `?`: Inspect System HUD Telemetry

---

## 2. Directory Structure

```
Renoceros.github.io/
├── index.html            # Core single-page application & modals
├── style.css             # Apple HIG design system, glassmorphism tokens & typography
├── script.js             # WebGL SDF engine, repel physics, shortcuts & theme engine
├── icon.svg              # Brandmark vector asset (interactive repel)
├── robots.txt            # Search crawler directives
├── sitemap.xml           # Search engine sitemap
├── ASSET_CHECKLIST.md    # High-resolution asset drop specification
└── assets/
    ├── profile.jpg             # Moreno Kristovan executive headshot
    ├── Moreno_Kristovan_CV.pdf # Executive curriculum vitae
    ├── wedge-preview.svg       # Flagship macOS Studio Wedge placeholder
    ├── penpal-preview.svg      # Penpal iPad canvas placeholder
    ├── reefora-preview.svg     # Reefora 3D coral simulation placeholder
    ├── stereopose-preview.svg  # StereoPose 6D CV thesis placeholder
    ├── exhibition-01.svg       # Apple Academy Demo Day placeholder
    ├── exhibition-02.svg       # Studio Lab & Bali Sprints placeholder
    └── exhibition-03.svg       # Architecture Critiques placeholder
```

---

## 3. Asset Replacement Workflow

All image slots are currently populated with SVG blueprints or executive documents. To drop real screenshots or high-res photos:
1. Refer to [ASSET_CHECKLIST.md](file:///Users/moreno_m5/Projects/Personal%20PR%20and%20Branding/Renoceros.github.io/ASSET_CHECKLIST.md).
2. Save your PNG/JPG into `assets/` matching the required filename and aspect ratio.
3. Commit and push to `main` branch. GitHub Pages deploys automatically.

---

## 4. Local Development

Serve the repository with any local static HTTP server:

```bash
# Using Python 3
python3 -m http.server 8000

# Using Node / npx
npx serve .
```

Open `http://localhost:8000` in Safari or Brave.
