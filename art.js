/* ==========================================================================
   RENOCEROS ATELIER — art.js
   Style: Pure Visual Wheel (Circle, not Cylinder)
   Physics: 120 FPS Wheel Rotation with Inertial Tangential Drag & Sway
   ========================================================================== */

(function () {
  'use strict';

  // 1. DOM REFERENCES
  const html = document.documentElement;
  const stage = document.getElementById('wheelStage');
  const cards = Array.from(document.querySelectorAll('.wheel-card'));

  // Theme elements
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle ? themeToggle.querySelector('.icon') : null;

  // Modal elements
  const modal = document.getElementById('darkroomModal');
  const modalImg = document.getElementById('modalImage');
  const modalClose = document.getElementById('modalClose');

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
  const N = cards.length; // 10 original artworks
  const ANGLE_STEP = 360 / N; // 36 degrees per artwork
  let radius = 1100;

  function updateRadius() {
    radius = window.innerWidth < 768 
      ? Math.max(680, window.innerWidth * 1.05) 
      : Math.max(1050, window.innerWidth * 0.75);
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
    const targetSway = Math.max(-16, Math.min(16, -velocity * 1.5));
    sway += (targetSway - sway) * 0.12;

    const flare = Math.max(-9, Math.min(0, -Math.abs(velocity) * 0.4));

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

      // Circular arc coordinates
      const rad = (diff * Math.PI) / 180;
      const x = radius * Math.sin(rad);
      const yDrop = (1 - Math.cos(rad)) * radius;

      // Rotation along circle tangent + dynamic sway
      const totalRotation = diff + sway;

      // Apply composite-only GPU transform
      cards[i].style.transform = `translate3d(${x.toFixed(2)}px, ${yDrop.toFixed(2)}px, 0) rotate(${totalRotation.toFixed(2)}deg) perspective(1000px) rotateX(${flare.toFixed(2)}deg)`;

      // Opacity falloff as cards arc below the visible top
      if (absDiff > 78) {
        cards[i].style.opacity = '0';
        cards[i].style.pointerEvents = 'none';
      } else {
        const op = Math.max(0.15, 1 - (absDiff / 78) * 0.82);
        cards[i].style.opacity = op.toFixed(2);
        cards[i].style.pointerEvents = absDiff < 22 ? 'auto' : 'none';
        cards[i].style.zIndex = Math.round(100 - absDiff);
      }

      cards[i].classList.toggle('is-active', absDiff < 18);
    }

    activeIndex = closestIdx;

    // Soft spring-snap to nearest 36-degree card when slowing down
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

  // 5. INPUT LISTENERS

  // Wheel & Trackpad
  window.addEventListener('wheel', (e) => {
    if (modal && modal.classList.contains('active')) return;
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    targetAngle -= delta * 0.18;
    requestRender();
  }, { passive: true });

  // Touch Events (Mobile Ergonomics)
  window.addEventListener('touchstart', (e) => {
    if (modal && modal.classList.contains('active')) return;
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
    targetAngle = startTargetAngle + dx * 0.26;
    requestRender();
  }, { passive: false });

  window.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    // Fling momentum
    if (Math.abs(dragVelocity) > 0.3) {
      targetAngle += dragVelocity * 55;
    }
    requestRender();
  }, { passive: true });

  // Mouse Drag (Desktop)
  if (stage) {
    stage.addEventListener('mousedown', (e) => {
      if (e.target.closest('button, a, .darkroom-modal')) return;
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
      targetAngle = startTargetAngle + dx * 0.22;
      requestRender();
    });

    window.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      if (Math.abs(dragVelocity) > 0.3) {
        targetAngle += dragVelocity * 50;
      }
      requestRender();
    });
  }

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

    if (modal && modal.classList.contains('active')) {
      if (e.key === 'Escape') closeModal();
      return;
    }

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

  // Card click: inspect if active at apex, or rotate to apex if flanking
  cards.forEach((card, i) => {
    card.addEventListener('click', () => {
      if (Math.abs(dragVelocity) > 0.15) return;
      if (i === activeIndex) {
        openModal(i);
      } else {
        rotateToIndex(i);
      }
    });
  });

  // 6. DARKROOM LIGHTBOX MODAL
  function openModal(idx) {
    const card = cards[idx];
    if (!card) return;

    const fullSrc = card.dataset.full || card.querySelector('img').src;
    modalImg.src = fullSrc;
    modal.classList.add('active');
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    modalImg.src = '';
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('darkroom-img-wrapper')) {
        closeModal();
      }
    });
  }

  // 7. BOOT
  function init() {
    updateRadius();
    render(); // Synchronous first frame
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
