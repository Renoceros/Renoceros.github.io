/* ==========================================================================
   RENOCEROS ATELIER — art.js
   Physics: 120 FPS 3D Revolver Cylinder with Velocity Sway & Centrifugal Inertia
   Style: Creative Coding / Minimalist Fine Art Gallery
   ========================================================================== */

(function () {
  'use strict';

  // 1. DOM REFERENCES
  const html = document.documentElement;
  const stage = document.getElementById('revolverStage');
  const drum = document.getElementById('revolverDrum');
  const cards = Array.from(document.querySelectorAll('.revolver-card'));
  const dots = Array.from(document.querySelectorAll('.gallery-dot'));
  const captionTitle = document.getElementById('captionTitle');
  const captionMedium = document.getElementById('captionMedium');

  // Theme elements
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle ? themeToggle.querySelector('.icon') : null;

  // Modal elements
  const modal = document.getElementById('darkroomModal');
  const modalImg = document.getElementById('modalImage');
  const modalTitle = document.getElementById('modalTitle');
  const modalMedium = document.getElementById('modalMedium');
  const modalDesc = document.getElementById('modalDesc');
  const modalClose = document.getElementById('modalClose');
  const modalPrev = document.getElementById('modalPrev');
  const modalNext = document.getElementById('modalNext');

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

  // 3. REVOLVER CYLINDER GEOMETRY & PHYSICS
  const N = cards.length; // 8 authentic artworks
  const ANGLE_STEP = 360 / N; // 45 degrees per item
  let radius = 680;

  function updateRadius() {
    radius = window.innerWidth < 768 ? 400 : 680;
    // Position each card at fixed radial angle
    for (let i = 0; i < N; i++) {
      const cardAngle = i * ANGLE_STEP;
      cards[i].style.transform = `rotateY(${cardAngle}deg) translateZ(${radius}px)`;
    }
    requestRender();
  }

  window.addEventListener('resize', updateRadius);

  // Motion physics state
  let currentAngle = 0;
  let targetAngle = 0;
  let swayZ = 0;
  let swayX = 0;
  let isAnimating = false;
  let rafId = null;
  let activeIndex = 0;

  // Pointer drag state
  let isDragging = false;
  let startX = 0;
  let startTargetAngle = 0;
  let lastDragX = 0;
  let lastDragTime = 0;
  let dragVelocity = 0;

  function requestRender() {
    if (!isAnimating) {
      isAnimating = true;
      rafId = requestAnimationFrame(render);
    }
  }

  // 4. 120 FPS LERP RENDERING LOOP
  function render() {
    const prevAngle = currentAngle;
    currentAngle += (targetAngle - currentAngle) * 0.085;
    const velocity = currentAngle - prevAngle; // degrees per frame

    // Dynamic centrifugal banking sway
    const targetSwayZ = Math.max(-13, Math.min(13, velocity * 1.8));
    const targetSwayX = Math.max(-7, Math.min(0, Math.abs(velocity) * -0.4));
    swayZ += (targetSwayZ - swayZ) * 0.12;
    swayX += (targetSwayX - swayX) * 0.12;

    // Apply 3D matrix to revolver drum
    drum.style.transform = `translateZ(-${radius}px) rotateY(${currentAngle.toFixed(3)}deg) rotateZ(${swayZ.toFixed(2)}deg) rotateX(${swayX.toFixed(2)}deg)`;

    // Calculate facing angles & opacity falloff
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

      // Smooth opacity falloff as card arcs around radius
      if (absDiff > 96) {
        cards[i].style.opacity = '0';
        cards[i].style.pointerEvents = 'none';
      } else {
        const op = Math.max(0.12, 1 - (absDiff / 96) * 0.82);
        cards[i].style.opacity = op.toFixed(2);
        cards[i].style.pointerEvents = absDiff < 32 ? 'auto' : 'none';
      }

      cards[i].classList.toggle('is-active', absDiff < 22);
    }

    // Update active index, caption & dots
    if (closestIdx !== activeIndex) {
      activeIndex = closestIdx;
      updateCaption(activeIndex);
    }

    // Spring snap to nearest 45-degree angle when slowing down
    if (!isDragging) {
      const snapTarget = Math.round(targetAngle / ANGLE_STEP) * ANGLE_STEP;
      if (Math.abs(velocity) < 0.15) {
        targetAngle += (snapTarget - targetAngle) * 0.08;
      }
    }

    // Idle sleep check — 0% CPU overhead
    if (
      !isDragging &&
      Math.abs(targetAngle - currentAngle) < 0.01 &&
      Math.abs(velocity) < 0.01 &&
      Math.abs(swayZ) < 0.05
    ) {
      currentAngle = targetAngle;
      drum.style.transform = `translateZ(-${radius}px) rotateY(${currentAngle.toFixed(3)}deg)`;
      isAnimating = false;
      rafId = null;
    } else {
      rafId = requestAnimationFrame(render);
    }
  }

  function updateCaption(idx) {
    const activeCard = cards[idx];
    if (!activeCard) return;

    if (captionTitle) captionTitle.textContent = activeCard.dataset.title || '';
    if (captionMedium) captionMedium.textContent = activeCard.dataset.medium || '';

    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === idx);
    });
  }

  // 5. INPUT LISTENERS

  // Wheel & Trackpad
  window.addEventListener('wheel', (e) => {
    if (modal && modal.classList.contains('active')) return;
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    targetAngle -= delta * 0.22;
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
    targetAngle = startTargetAngle + dx * 0.32;
    requestRender();
  }, { passive: false });

  window.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    // Add momentum flick
    if (Math.abs(dragVelocity) > 0.3) {
      targetAngle += dragVelocity * 65;
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
      targetAngle = startTargetAngle + dx * 0.28;
      requestRender();
    });

    window.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      if (Math.abs(dragVelocity) > 0.3) {
        targetAngle += dragVelocity * 60;
      }
      requestRender();
    });
  }

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

    if (modal && modal.classList.contains('active')) {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') showPrevModal();
      if (e.key === 'ArrowRight') showNextModal();
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

  // Card click: inspect if active, or spin to center if flanking
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

  // Dots click
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      rotateToIndex(i);
    });
  });

  // 6. DARKROOM LIGHTBOX MODAL
  let currentModalIdx = 0;

  function openModal(idx) {
    currentModalIdx = idx;
    const card = cards[idx];
    if (!card) return;

    const fullSrc = card.dataset.full || card.querySelector('img').src;
    modalImg.src = fullSrc;
    if (modalTitle) modalTitle.textContent = card.dataset.title || '';
    if (modalMedium) modalMedium.textContent = card.dataset.medium || '';
    if (modalDesc) modalDesc.textContent = card.dataset.desc || '';

    modal.classList.add('active');
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    modalImg.src = '';
  }

  function showPrevModal() {
    const prev = (currentModalIdx - 1 + N) % N;
    openModal(prev);
  }

  function showNextModal() {
    const next = (currentModalIdx + 1) % N;
    openModal(next);
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalPrev) modalPrev.addEventListener('click', showPrevModal);
  if (modalNext) modalNext.addEventListener('click', showNextModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // 7. BOOT
  updateRadius();
  updateCaption(0);
  requestRender();
})();
