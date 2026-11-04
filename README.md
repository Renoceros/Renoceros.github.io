# Renoceros.github.io

Official personal portfolio and technical showcase of **Moreno Kristovan** (Renoceros) — Apple Developer Academy Graduate, Systems Engineer & Technical Product Architect.

Live Site: [https://renoceros.github.io](https://renoceros.github.io)

---

## 1. Architectural Philosophy

> *"Crafting systems, tools, and tactile experiences — where rigorous engineering meets thoughtful product design."*

This repository is engineered with zero-bloat web craftsmanship:
- **Zero-Bloat Front-End:** Native vanilla JavaScript, Bootstrap 5 grid primitives, custom Apple Human Interface Guidelines (HIG) CSS design tokens.
- **Dedicated Apple Developer Academy Section:** Highlights 10 months of Challenge-Based Learning (CBL), multicultural 6-developer squad leadership, and fieldwork sprints in Bali.
- **Interactive Project Carousels:** Multi-image carousels embedded inside each technical project card showcasing live UI, fieldwork photos, and architectural studies.
- **High Contrast Accessibility:** High-contrast `--text-muted` tokens exceeding WCAG 2.1 AA specifications (6.2:1 contrast ratio in dark mode).
- **Google Material Symbols:** Vector symbols for theme toggling (`light_mode` / `dark_mode`), section identifiers, and navigation actions.
- **Keyboard Shortcuts:**
  - `T`: Toggle light / dark theme
  - `P` / `W` / `S`: Jump to Systems
  - `D`: Jump to Apple Developer Academy
  - `I`: Jump to Invariants
  - `A`: Jump to Profile & Terminal
  - `C`: Download Executive CV

---

## 2. Featured Systems & In-Card Carousels

1. **StereoPose 6D**: Continuous 6DoF spatial object pose estimation from stereo camera pairs via $SO(3)$ manifold projection. Includes thesis defense & architecture review slides.
2. **BetterGitGraph**: Published VS Code extension rendering Git commit DAGs with hash-deterministic branch coloring and Bézier layouts. Includes interactive graph and ref search filter slides.
3. **AI-TL**: End-to-end multimodal localization pipeline coordinating text detection, inpainting, and cross-panel LLM dialogue disambiguation.
4. **Hapticle**: Physical force simulation engine on 120Hz `CADisplayLink` coordinating CoreHaptics transients with procedural sound synthesis. Includes transient waveforms and physical safe dial mechanical study slides.
5. **Reefora**: 2.5D tactile marine restoration sandbox built for Living Seas Bali, backed by a pure Swift `EcoEngine` domain package and 38 immutable ADRs. Includes 2.5D sandbox model, Apple Academy Demo Day showcase, and Bali Living Seas sprint slides.

---

## 3. Directory Structure

```
Renoceros.github.io/
├── index.html            # Clean single-page application structure
├── style.css             # Apple HIG design system, glass tokens & 2-layer noise engine
├── script.js             # 2-layer noise engine, repel physics, shortcuts & theme engine
├── icon.svg              # Brandmark vector asset (interactive repel)
├── robots.txt            # Search crawler directives
├── sitemap.xml           # Search engine sitemap
├── ASSET_CHECKLIST.md    # High-resolution asset drop specification
└── assets/
    ├── Moreno_Kristovan_CV.pdf       # Executive curriculum vitae
    ├── bettergitgraph-preview.jpeg   # BetterGitGraph VS Code Extension screenshot
    ├── bettergitgraph-search.jpeg    # BetterGitGraph search & ref filter view
    ├── stereopose-preview.png        # StereoPose 6D preview [PLACE HOLDER]
    ├── exhibition-03.png             # Architecture Clinic preview [PLACE HOLDER]
    ├── translate-preview.png         # AI-TL Localization Pipeline preview [PLACE HOLDER]
    ├── hapticle-preview.png          # Hapticle Tactile Engine preview [PLACE HOLDER]
    ├── hapticle-dial.jpeg            # Hapticle Safe Dial mechanical study
    ├── reefora-preview.png           # Reefora 2.5D Marine Sandbox preview [PLACE HOLDER]
    ├── exhibition-01.png             # Apple Academy Demo Day preview [PLACE HOLDER]
    └── exhibition-02.png             # Living Seas Bali Fieldwork preview [PLACE HOLDER]
```

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
