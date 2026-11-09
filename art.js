/* ==========================================================================
   RENOCEROS ATELIER — art.js
   Style: Pure Visual Wheel (Circle, not Cylinder)
   Physics: 120 FPS Wheel Rotation with Inertial Tangential Drag & Sway
   Features: Native Aspect Ratios, Expanded Radius, Auto-Discovery of New Artwork
   ========================================================================== */

(function () {
  'use strict';

  // 1. DOM REFERENCES
  const html = document.documentElement;
  const stage = document.getElementById('wheelStage');
  const apex = document.getElementById('wheelApex');
  let cards = Array.from(document.querySelectorAll('.wheel-card'));

  // Theme elements
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle ? themeToggle.querySelector('.icon') : null;

  // 2. THEME PERSISTENCE
  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if (themeIcon) {
      themeIcon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
    }
  }

  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (savedTheme === 'light' || (!savedTheme && !prefersDark)) {
    applyTheme('light');
  } else {
    applyTheme('dark');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const active = html.getAttribute('data-theme');
      applyTheme(active === 'dark' ? 'light' : 'dark');
    });
  }

  // 3. CIRCULAR WHEEL KINEMATICS & PHYSICS
  let N = cards.length || 10;
  let ANGLE_STEP = 360 / N;
  let radius = 1800;

  function updateRadius() {
    radius = window.innerWidth < 768 
      ? Math.max(1100, window.innerWidth * 1.5) 
      : Math.max(1750, window.innerWidth * 1.15);
    requestRender();
  }

  window.addEventListener('resize', updateRadius);

  // Motion physics state
  let currentAngle = 0;
  let targetAngle = 0;
  let sway = 0;
  let isAnimating = false;
  let rafId = null;
  let fallbackTimer = null;
  let activeIndex = 0;

  // Pointer drag state
  let isDragging = false;
  let startX = 0;
  let startTargetAngle = 0;
  let lastDragX = 0;
  let lastDragTime = 0;
  let dragVelocity = 0;

  function scheduleNextFrame() {
    if (!isAnimating) return;
    cancelAnimationFrame(rafId);
    clearTimeout(fallbackTimer);
    rafId = requestAnimationFrame((now) => {
      clearTimeout(fallbackTimer);
      render(now);
    });
    fallbackTimer = setTimeout(() => {
      render(performance.now());
    }, 16);
  }

  function requestRender() {
    if (!isAnimating) {
      isAnimating = true;
      scheduleNextFrame();
    }
  }

  // 4. 120 FPS LERP RENDERING LOOP
  function render(now) {
    const prevAngle = currentAngle;
    currentAngle += (targetAngle - currentAngle) * 0.085;
    const velocity = currentAngle - prevAngle; // degrees per frame

    // Dynamic tangential sway (lagging inertia)
    const targetSway = Math.max(-18, Math.min(18, -velocity * 1.6));
    sway += (targetSway - sway) * 0.12;

    const flare = Math.max(-10, Math.min(0, -Math.abs(velocity) * 0.45));

    let closestAbs = Infinity;
    let closestIdx = 0;

    for (let i = 0; i < N; i++) {
      let diff = (i * ANGLE_STEP + currentAngle) % 360;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      const absDiff = Math.abs(diff);

      if (absDiff < closestAbs) {
        closestAbs = absDiff;
        closestIdx = i;
      }

      // Circular arc coordinates along the increased wheel radius
      const rad = (diff * Math.PI) / 180;
      const x = radius * Math.sin(rad);
      const yDrop = (1 - Math.cos(rad)) * radius;

      // Rotation along circle tangent + dynamic inertia sway
      const totalRotation = diff + sway;

      // Apply composite-only GPU transform with native aspect centering
      cards[i].style.transform = `translate3d(${x.toFixed(2)}px, ${yDrop.toFixed(2)}px, 0) translate(-50%, -50%) rotate(${totalRotation.toFixed(2)}deg) perspective(1000px) rotateX(${flare.toFixed(2)}deg)`;

      // Opacity falloff as cards arc below the visible top
      if (absDiff > 75) {
        cards[i].style.opacity = '0';
        cards[i].style.pointerEvents = 'none';
      } else {
        const op = Math.max(0.12, 1 - (absDiff / 75) * 0.84);
        cards[i].style.opacity = op.toFixed(2);
        cards[i].style.pointerEvents = 'none'; // No clicking
        cards[i].style.zIndex = Math.round(100 - absDiff);
      }

      cards[i].classList.toggle('is-active', absDiff < 18);
    }

    activeIndex = closestIdx;

    // Soft spring-snap to nearest card when slowing down
    if (!isDragging && Math.abs(velocity) < 0.16) {
      const snapTarget = Math.round(targetAngle / ANGLE_STEP) * ANGLE_STEP;
      targetAngle += (snapTarget - targetAngle) * 0.08;
    }

    // 0% CPU idle check
    if (
      !isDragging &&
      Math.abs(targetAngle - currentAngle) < 0.01 &&
      Math.abs(velocity) < 0.01 &&
      Math.abs(sway) < 0.05
    ) {
      currentAngle = Math.round(currentAngle / ANGLE_STEP) * ANGLE_STEP;
      isAnimating = false;
      cancelAnimationFrame(rafId);
      clearTimeout(fallbackTimer);
      rafId = null;
    } else {
      scheduleNextFrame();
    }
  }

  // 5. INPUT LISTENERS (Wheel, Drag, Keyboard)

  // Wheel & Trackpad
  window.addEventListener('wheel', (e) => {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    targetAngle -= delta * 0.16;
    requestRender();
  }, { passive: true });

  // Touch Events (Mobile Ergonomics)
  window.addEventListener('touchstart', (e) => {
    if (!e.touches[0]) return;
    isDragging = true;
    startX = e.touches[0].clientX;
    startTargetAngle = targetAngle;
    lastDragX = startX;
    lastDragTime = performance.now();
    dragVelocity = 0;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging || !e.touches[0]) return;
    if (e.cancelable) e.preventDefault();

    const currentX = e.touches[0].clientX;
    const now = performance.now();
    const dt = now - lastDragTime;
    if (dt > 0) {
      dragVelocity = (currentX - lastDragX) / dt;
    }
    lastDragX = currentX;
    lastDragTime = now;

    const dx = currentX - startX;
    targetAngle = startTargetAngle + dx * 0.22;
    requestRender();
  }, { passive: false });

  window.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    // Fling momentum
    if (Math.abs(dragVelocity) > 0.3) {
      targetAngle += dragVelocity * 50;
    }
    requestRender();
  }, { passive: true });

  // Mouse Drag (Desktop)
  if (stage) {
    stage.addEventListener('mousedown', (e) => {
      if (e.target.closest('button, a')) return;
      isDragging = true;
      startX = e.clientX;
      startTargetAngle = targetAngle;
      lastDragX = startX;
      lastDragTime = performance.now();
      dragVelocity = 0;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const now = performance.now();
      const dt = now - lastDragTime;
      if (dt > 0) {
        dragVelocity = (e.clientX - lastDragX) / dt;
      }
      lastDragX = e.clientX;
      lastDragTime = now;

      const dx = e.clientX - startX;
      targetAngle = startTargetAngle + dx * 0.20;
      requestRender();
    });

    window.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      if (Math.abs(dragVelocity) > 0.3) {
        targetAngle += dragVelocity * 45;
      }
      requestRender();
    });
  }

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      e.preventDefault();
      rotateToIndex(activeIndex + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      rotateToIndex(activeIndex - 1);
    } else if (e.key.toLowerCase() === 't') {
      const active = html.getAttribute('data-theme');
      applyTheme(active === 'dark' ? 'light' : 'dark');
    }
  });

  function rotateToIndex(idx) {
    const normalized = (idx % N + N) % N;
    targetAngle = -normalized * ANGLE_STEP;
    requestRender();
  }

  // 6. DYNAMIC ARTWORK FOLDER AUTO-DISCOVERY
  async function syncArtworkFolder() {
    let fileList = [];

    // Strategy A: Dev server directory listing parse (when dumping files into /artwork/)
    try {
      const res = await fetch('assets/artwork/?t=' + Date.now());
      if (res.ok) {
        const text = await res.text();
        const matches = text.match(/href=["']([^"']+\.(?:png|jpe?g|webp|gif|svg|avif))["']/gi);
        if (matches && matches.length > 0) {
          const set = new Set();
          matches.forEach(m => {
            const raw = m.replace(/href=["']|["']/gi, '');
            const filename = raw.split('/').pop().split('?')[0];
            if (filename && !filename.startsWith('.')) set.add(filename);
          });
          fileList = Array.from(set).sort();
        }
      }
    } catch (e) {}

    // Strategy B: manifest.json fallback
    if (fileList.length === 0) {
      try {
        const res = await fetch('assets/artwork/manifest.json?t=' + Date.now());
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list) && list.length > 0) fileList = list;
        }
      } catch (e) {}
    }

    // Strategy C: GitHub API when on GitHub Pages
    if (fileList.length === 0 && location.hostname.includes('github.io')) {
      try {
        const res = await fetch('https://api.github.com/repos/Renoceros/renoceros.github.io/contents/assets/artwork');
        if (res.ok) {
          const items = await res.json();
          const validExts = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif'];
          fileList = items
            .filter(item => validExts.some(ext => item.name.toLowerCase().endsWith(ext)))
            .map(item => item.name);
        }
      } catch (e) {}
    }

    if (fileList.length > 0) {
      const currentSources = cards.map(c => c.getAttribute('data-src') || c.querySelector('img')?.getAttribute('src') || '');
      const newSources = fileList.map(f => `assets/artwork/${f}`);

      // Check if file list differs from existing DOM
      const isDifferent = newSources.length !== currentSources.length || newSources.some((s, i) => s !== currentSources[i]);

      if (isDifferent && apex) {
        // Rebuild cards dynamically
        apex.innerHTML = '';
        newSources.forEach((src, idx) => {
          const article = document.createElement('article');
          article.className = 'wheel-card';
          article.setAttribute('data-src', src);
          const img = document.createElement('img');
          img.src = src;
          img.alt = 'Artwork';
          img.loading = idx === 0 ? 'eager' : 'lazy';
          img.decoding = 'async';
          article.appendChild(img);
          apex.appendChild(article);
        });

        cards = Array.from(document.querySelectorAll('.wheel-card'));
        N = cards.length;
        ANGLE_STEP = 360 / N;
        requestRender();
      }
    }
  }

  // 7. BOOT
  function init() {
    updateRadius();
    render(performance.now());
    syncArtworkFolder();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
