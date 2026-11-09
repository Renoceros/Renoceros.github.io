/* ==========================================================================
   RENOCEROS DATAMOSH TRANSITION ENGINE — datamosh.js
   Author: Moreno Kristovan (Renoceros)
   Performance: Hardware-accelerated 120 FPS | Zero Idle CPU/GPU
   Architecture: Ephemeral Canvas Macroblock Tearing + Staged De-quantization
   ========================================================================== */

(function () {
  'use strict';

  // 1. STATE & ENVIRONMENT DETECTION
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TRANSITION_KEY = 'renoceros_mosh_transit';
  const EXIT_DURATION_MS = 380;
  const ENTRY_DURATION_MS = 220;

  // 2. ENTRY DE-QUANTIZATION (When arriving from a mosh transition)
  function checkEntryMosh() {
    try {
      const transit = sessionStorage.getItem(TRANSITION_KEY);
      if (!transit) return;
      sessionStorage.removeItem(TRANSITION_KEY);

      if (isReducedMotion) return;

      runEntryDequantize();
    } catch (e) {
      // Storage access gracefully degraded
    }
  }

  function runEntryDequantize() {
    const canvas = document.createElement('canvas');
    canvas.id = 'datamosh-entry-canvas';
    canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:9998;pointer-events:none;image-rendering:pixelated;';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) {
      canvas.remove();
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = (canvas.width = Math.floor(window.innerWidth * dpr));
    let height = (canvas.height = Math.floor(window.innerHeight * dpr));

    const startTime = performance.now();
    const blockSize = Math.floor(28 * dpr);
    const cols = Math.ceil(width / blockSize);
    const rows = Math.ceil(height / blockSize);

    // Initial random displacement vectors for blocks
    const blocks = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (Math.random() > 0.45) {
          blocks.push({
            x: c * blockSize,
            y: r * blockSize,
            dx: (Math.random() - 0.5) * 40 * dpr,
            dy: (Math.random() - 0.5) * 8 * dpr,
            hue: Math.random() > 0.5 ? 160 : 340, // Emerald vs Neon Magenta
            size: blockSize,
            alpha: 0.7 + Math.random() * 0.3
          });
        }
      }
    }

    function renderEntry(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / ENTRY_DURATION_MS, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);

      ctx.clearRect(0, 0, width, height);

      // Draw settling macroblocks with fading opacity
      for (let i = 0; i < blocks.length; i++) {
        const b = blocks[i];
        const settleX = b.x + b.dx * (1 - easeOut);
        const settleY = b.y + b.dy * (1 - easeOut);
        const currentAlpha = b.alpha * (1 - easeOut);

        if (currentAlpha <= 0.01) continue;

        // Subtle chromatic split on snap
        ctx.fillStyle = `hsla(${b.hue}, 85%, 60%, ${currentAlpha * 0.4})`;
        ctx.fillRect(settleX - 2 * dpr, settleY, b.size, b.size);

        ctx.fillStyle = `hsla(${b.hue === 160 ? 340 : 160}, 85%, 60%, ${currentAlpha * 0.3})`;
        ctx.fillRect(settleX + 2 * dpr, settleY, b.size, b.size);
      }

      if (progress < 1) {
        requestAnimationFrame(renderEntry);
      } else {
        // Complete cleanup — 0% CPU/GPU idle
        ctx.clearRect(0, 0, width, height);
        canvas.remove();
      }
    }

    requestAnimationFrame(renderEntry);
  }

  // 3. EXIT MOSH SEQUENCE (Triggered on Portal Button click or 'V' / 'M' key)
  function triggerDatamoshTransition(targetUrl) {
    if (isReducedMotion) {
      window.location.href = targetUrl;
      return;
    }

    try {
      sessionStorage.setItem(TRANSITION_KEY, '1');
    } catch (e) {}

    // Add glitch state to DOM (navbar items & stage jitter, but .mode-portal-pill is immune)
    document.body.classList.add('mosh-active');

    const toggle = document.getElementById('modeToggle');
    if (toggle) {
      toggle.classList.add('mosh-firing');
    }

    const canvas = document.createElement('canvas');
    canvas.id = 'datamosh-exit-canvas';
    canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:9998;pointer-events:none;image-rendering:pixelated;';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) {
      window.location.href = targetUrl;
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = (canvas.width = Math.floor(window.innerWidth * dpr));
    let height = (canvas.height = Math.floor(window.innerHeight * dpr));

    const startTime = performance.now();
    const blockSize = Math.floor(24 * dpr);
    const cols = Math.ceil(width / blockSize);
    const rows = Math.ceil(height / blockSize);

    function renderExit(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / EXIT_DURATION_MS, 1);

      ctx.clearRect(0, 0, width, height);

      // Phase 1: Keyframe slice displacement (0 - 140ms)
      const numSlices = 14;
      const sliceH = Math.floor(height / numSlices);
      for (let s = 0; s < numSlices; s++) {
        if (Math.random() > 0.4) {
          const shift = (Math.random() - 0.5) * 60 * dpr * progress;
          ctx.fillStyle = Math.random() > 0.5 ? 'rgba(34, 70, 30, 0.45)' : 'rgba(0, 0, 0, 0.5)';
          ctx.fillRect(shift, s * sliceH, width, sliceH);
        }
      }

      // Phase 2: Macroblock tearing & RGB Channel Dislocation (100 - 380ms)
      const activeBlocks = Math.floor(cols * rows * (0.2 + progress * 0.6));
      for (let i = 0; i < activeBlocks; i++) {
        const c = Math.floor(Math.random() * cols);
        const r = Math.floor(Math.random() * rows);
        const bx = c * blockSize;
        const by = r * blockSize;
        const jitterX = (Math.random() - 0.5) * 80 * dpr * progress;

        // Red/Magenta Channel Dislocation (Negative X Shift)
        ctx.fillStyle = `rgba(255, 0, 85, ${0.45 * progress})`;
        ctx.fillRect(bx + jitterX - 12 * dpr, by, blockSize, blockSize);

        // Blue/Cyan Channel Dislocation (Positive X Shift)
        ctx.fillStyle = `rgba(0, 240, 255, ${0.45 * progress})`;
        ctx.fillRect(bx + jitterX + 12 * dpr, by, blockSize, blockSize);

        // Green / Tactical Luma Block (Zero Shift)
        ctx.fillStyle = `rgba(34, 70, 30, ${0.5 * progress})`;
        ctx.fillRect(bx + jitterX, by, blockSize, blockSize);
      }

      // Scanline & Codec Drop simulation
      ctx.fillStyle = `rgba(255, 255, 255, ${0.12 * Math.random()})`;
      ctx.fillRect(0, Math.random() * height, width, 2 * dpr);

      if (progress < 1) {
        requestAnimationFrame(renderExit);
      } else {
        // Navigate
        window.location.href = targetUrl;
      }
    }

    requestAnimationFrame(renderExit);
  }

  // 4. BINDINGS & LISTENERS
  function initDatamosh() {
    checkEntryMosh();

    const modeToggle = document.getElementById('modeToggle');
    if (modeToggle) {
      modeToggle.addEventListener('click', function (e) {
        e.preventDefault();
        const target = this.getAttribute('href') || (location.pathname.includes('art.html') ? 'index.html' : 'art.html');
        triggerDatamoshTransition(target);
      });
    }

    // Keyboard Hotkey 'V' (Visuals / Atelier) or 'M' (Mode)
    window.addEventListener('keydown', function (e) {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName) || document.activeElement?.isContentEditable) {
        return;
      }
      const key = e.key.toLowerCase();
      if (key === 'v' || key === 'm') {
        const toggle = document.getElementById('modeToggle');
        if (toggle) {
          e.preventDefault();
          toggle.click();
        }
      }
    });

    // Cleanup on browser Back/Forward cache restore
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) {
        document.body.classList.remove('mosh-active');
        const exitCanvas = document.getElementById('datamosh-exit-canvas');
        if (exitCanvas) exitCanvas.remove();
        const entryCanvas = document.getElementById('datamosh-entry-canvas');
        if (entryCanvas) entryCanvas.remove();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDatamosh);
  } else {
    initDatamosh();
  }

  // Expose transition trigger for programmatic calls if needed
  window.triggerDatamosh = triggerDatamoshTransition;
})();
