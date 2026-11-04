# Renoceros.github.io

Official personal portfolio and technical showcase of **Moreno Kristovan** (Renoceros) — Apple Developer Academy Graduate, Technical Product Architect & Systems Engineer.

Live Site: [https://renoceros.github.io](https://renoceros.github.io)

---

## 1. Architectural Philosophy

> *"I Build Tools. Not websites."*

This repository is engineered with zero-bloat web craftsmanship:
- **Zero-Bloat Front-End:** Native vanilla JavaScript, Bootstrap 5 grid primitives, custom Apple Human Interface Guidelines (HIG) CSS design tokens.
- **WebGL SDF Liquid Glass Engine:** Real-time signed distance field (SDF) refraction shader simulating frosted optical glass and chromatic aberration mapped to DOM element bounding boxes.
- **Battery-Saving Telemetry:** WebGL rendering loop pauses automatically via `visibilitychange` when tabs are backgrounded.
- **Retina Crispness:** Viewport resolution scales dynamically up to 2.0x DPR with device-pixel matching.
- **Keyboard Shortcuts:**
  - `T`: Toggle light / dark theme
  - `P` or `W`: Jump to Projects
  - `E`: Jump to Exhibitions
  - `I`: Jump to Invariants
  - `A`: Jump to About & Terminal
  - `C`: Download Executive CV

---

## 2. Directory Structure

```
Renoceros.github.io/
├── index.html            # Clean single-page application structure
├── style.css             # Apple HIG design system, glass tokens & typography
├── script.js             # WebGL SDF engine, repel physics, shortcuts & theme engine
├── icon.svg              # Brandmark vector asset (interactive repel)
├── robots.txt            # Search crawler directives
├── sitemap.xml           # Search engine sitemap
├── ASSET_CHECKLIST.md    # High-resolution asset drop specification
└── assets/
    ├── Moreno_Kristovan_CV.pdf # Executive curriculum vitae
    ├── f1-preview.svg          # F1 Telemetry Analyzer vector preview
    ├── stereopose-preview.svg  # StereoPose 6D CV thesis vector preview
    ├── translate-preview.svg   # MTL Translation Pipeline vector preview
    ├── penpal-preview.svg      # Penpal iPad canvas vector preview
    ├── reefora-preview.svg     # Reefora 3D coral simulation vector preview
    ├── exhibition-01.svg       # Apple Academy Demo Day vector preview
    ├── exhibition-02.svg       # Studio Lab & Bali Sprints vector preview
    └── exhibition-03.svg       # Architecture Critiques vector preview
```

---

## 3. Asset Replacement Workflow

All image slots are currently populated with clean vector SVGs or executive documents. To drop real screenshots or high-res photos:
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

Open `http://localhost:8000` in your browser.
