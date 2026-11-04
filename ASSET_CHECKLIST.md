# Website Asset Checklist & Image Drop Guide

**Target Directory:** `Renoceros.github.io/assets/`  
**Live Site:** `https://renoceros.github.io/`

This checklist outlines all the visual assets used by your personal portfolio website. 

High-tech SVG placeholders are currently live on the site, so the portfolio is immediately functional. As you gather your photos and screenshots, drop the real files into `assets/` matching the filenames below to replace the placeholders.

---

## 1. Profile & Identity Assets

| Status | Filename | Description | Recommended Specs | Where It Appears |
| :---: | :--- | :--- | :--- | :--- |
| [x] | `profile.jpg` | Professional portrait / headshot | 800x800px square, JPG/PNG | About Section & CV |
| [x] | `Moreno_Kristovan_CV.pdf` | Direct printable executive CV | PDF (A4 / Letter, 2 pages) | Navbar & Header "View CV" |
| [ ] | `logo.svg` *(Optional)* | Your custom brand mark / glyph | Vector SVG / transparent | Navbar & Floating Hero |

---

## 2. Selected Project Previews (16:10 or 16:9 Landscape)

Drop screenshots, UI captures, or short silent `.mp4` video loops here:

| Status | Filename | Project | Description | Recommended Specs |
| :---: | :--- | :--- | :--- | :--- |
| [ ] | `wedge-preview.png` | **Native macOS Wedge** | Screenshot or UI capture of the flagship macOS desktop application | 1600x1000px (16:10), PNG or WebP |
| [ ] | `penpal-preview.png` | **Penpal** | Apple Pencil / Canvas interaction showing tactile drawing or UI | 1600x1000px (16:10), PNG or WebP |
| [ ] | `reefora-preview.png` | **Reefora** | 3D interactive coral reef simulation or macOS/iOS interface | 1600x1000px (16:10), PNG or WebP |
| [ ] | `stereopose-preview.png` | **StereoPose 6D** | Thesis visualization showing 3D bounding boxes / ConvNeXt output | 1600x1000px (16:10), PNG or WebP |

> **Pro-Tip on Videos:** If you have 5-second muted `.mp4` screen recordings showing micro-interactions or smooth 120Hz ProMotion physics, you can name them `wedge-preview.mp4` or `penpal-preview.mp4`—the HTML is configured with responsive `<video>` tags that fall back to images!

---

## 3. Exhibitions, Studio Lab & Team Showcase (4:3 or 16:9)

Drop photos from your Apple Developer Academy exhibitions, team work sessions, and mentor critiques:

| Status | Filename | Caption / Context | Recommended Specs |
| :---: | :--- | :--- | :--- |
| [ ] | `exhibition-01.jpg` | **Apple Academy Demo Day / Exhibition** (Booth display, live iPad/Mac testing with attendees) | 1200x900px (4:3), JPG |
| [ ] | `exhibition-02.jpg` | **Multicultural Squad in Action** (Team working together in Bali / sprint planning) | 1200x900px (4:3), JPG |
| [ ] | `exhibition-03.jpg` | **Hardware Labs & Critiques** (Testing Apple Silicon, Apple Pencil, or mentor feedback) | 1200x900px (4:3), JPG |
| [ ] | `exhibition-04.jpg` *(Bonus)* | **Stage Keynote / Pitch** (Presenting to mentors or audience) | 1200x900px (4:3), JPG |

---

## 4. How to Update Once Files Are Ready

1. Simply copy your photo into `Renoceros.github.io/assets/` using the exact filename above.
2. If using `.png` instead of `.svg`, the `index.html` file automatically falls back or you can update the `src` attribute.
3. Test locally in your browser by opening `Renoceros.github.io/index.html`.
4. Commit and push:
   ```bash
   cd Renoceros.github.io
   git add assets/ index.html
   git commit -m "feat: update project previews and exhibition photography"
   git push origin main
   ```
5. GitHub Pages will deploy live in ~60 seconds!
