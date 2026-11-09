/* ==========================================================================
   RENOCEROS ATELIER KINETIC HORIZON ENGINE — art.js
   Author: Moreno Kristovan (Renoceros)
   Performance: Locked 120 FPS Composite-Only GPU Acceleration
   Architecture: Spring-Dampened Horizontal Filmstrip + Touch Physics + Lightbox
   ========================================================================== */

(function () {
  'use strict';

  // 1. DOM REFERENCES
  const html = document.documentElement;
  const viewport = document.getElementById('spatialViewport');
  const track = document.getElementById('filmstripTrack');
  const cards = Array.from(document.querySelectorAll('.art-card'));
  const currentFrameEl = document.getElementById('currentFrame');
  const currentTitleEl = document.getElementById('currentTitle');
  const leftPip = document.getElementById('leftTapePip');
  const rightPip = document.getElementById('rightTapePip');

  // Theme elements
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle ? themeToggle.querySelector('.icon') : null;

  // Modal elements
  const modal = document.getElementById('darkroomModal');
  const modalImg = document.getElementById('modalImage');
  const modalIdx = document.getElementById('modalIdx');
  const modalTag = document.getElementById('modalTag');
  const modalTitle = document.getElementById('modalTitle');
  const modalMedium = document.getElementById('modalMedium');
  const modalDesc = document.getElementById('modalDesc');
  const modalClose = document.getElementById('modalClose');
  const modalPrev = document.getElementById('modalPrev');
  const modalNext = document.getElementById('modalNext');

  // 2. THEME SYNC
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

  // 3. 120 FPS KINETIC HORIZON PHYSICS STATE
  let currentX = 0;
  let targetX = 0;
  let minX = 0;
  let maxX = 0;
  let isAnimating = false;
  let rafId = null;
  let lastTimestamp = 0;
  let activeCardIndex = 0;

  // Touch & Drag state
  let isDragging = false;
  let startPointerX = 0;
  let startTargetX = 0;
  let lastDragX = 0;
  let lastDragTime = 0;
  let dragVelocity = 0;

  // Recalculate track boundary bounds
  function updateBounds() {
    if (!track || cards.length === 0) return;
    const viewportWidth = window.innerWidth;
    const trackWidth = track.scrollWidth;
    
    // First card centered when currentX = 0
    // Last card centered when currentX = minX
    const firstCard = cards[0];
    const lastCard = cards[cards.length - 1];
    const firstCardCenter = firstCard.offsetLeft + firstCard.offsetWidth / 2;
    const lastCardCenter = lastCard.offsetLeft + lastCard.offsetWidth / 2;

    maxX = 0;
    minX = -(lastCardCenter - firstCardCenter);

    // Keep target within boundaries
    targetX = Math.max(minX, Math.min(maxX, targetX));
    requestRender();
  }

  window.addEventListener('resize', updateBounds);

  // 4. THE 120 FPS LERP ANIMATION LOOP
  function requestRender() {
    if (!isAnimating) {
      isAnimating = true;
      rafId = requestAnimationFrame(render);
    }
  }

  function render(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    lastTimestamp = timestamp;

    // Smooth Lerp step (0.10 dampening factor for silk deceleration)
    const prevX = currentX;
    currentX += (targetX - currentX) * 0.10;
    const velocity = currentX - prevX;

    // Apply translation to main track
    track.style.transform = `translate3d(${currentX}px, 0, 0)`;

    // Calculate individual card perspective tilt, scale & opacity
    const viewportCenter = window.innerWidth / 2;
    let closestDist = Infinity;
    let closestIndex = 0;

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const dist = cardCenter - viewportCenter;
      const absDist = Math.abs(dist);

      if (absDist < closestDist) {
        closestDist = absDist;
        closestIndex = i;
      }

      // Kinetic 3D Yaw & Shear
      const rotateY = Math.max(-12, Math.min(12, dist * -0.015 + velocity * 0.18));
      const skewX = Math.max(-3, Math.min(3, velocity * -0.04));
      const scale = Math.max(0.86, 1.05 - (absDist / 1200) * 0.2);
      const opacity = Math.max(0.55, 1.0 - (absDist / 1600) * 0.5);

      card.style.transform = `perspective(1000px) rotateY(${rotateY.toFixed(2)}deg) skewX(${skewX.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      card.style.opacity = opacity.toFixed(2);
    }

    // Update HUD indicator & margin tape pips
    if (closestIndex !== activeCardIndex) {
      activeCardIndex = closestIndex;
      const activeCard = cards[activeCardIndex];
      const idxStr = String(activeCardIndex + 1).padStart(2, '0');
      const titleStr = activeCard.dataset.title || 'UNTITLED';
      if (currentFrameEl) currentFrameEl.textContent = idxStr;
      if (currentTitleEl) currentTitleEl.textContent = titleStr.toUpperCase();
    }

    // Slide tape pips according to scroll progress
    const totalDist = Math.abs(minX) || 1;
    const progress = Math.min(1, Math.max(0, -currentX / totalDist));
    const pipOffset = (progress * 80).toFixed(1); // 0% to 80% of track height
    if (leftPip) leftPip.style.transform = `translateY(${progress * 280}px)`;
    if (rightPip) rightPip.style.transform = `translateY(${progress * 280}px)`;

    // Check if motion has settled (0% CPU on idle!)
    if (Math.abs(targetX - currentX) < 0.05 && Math.abs(velocity) < 0.02 && !isDragging) {
      currentX = targetX;
      track.style.transform = `translate3d(${currentX}px, 0, 0)`;
      isAnimating = false;
      rafId = null;
    } else {
      rafId = requestAnimationFrame(render);
    }
  }

  // 5. INPUT LISTENERS (Wheel, Trackpad, Keyboard, Touch, Drag)

  // Wheel & Trackpad
  window.addEventListener('wheel', (e) => {
    // If modal is open, ignore
    if (modal && modal.classList.contains('active')) return;

    // Use deltaX if scrolling horizontally, or deltaY if scrolling vertically
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    targetX -= delta * 1.25;
    targetX = Math.max(minX, Math.min(maxX, targetX));
    requestRender();
  }, { passive: true });

  // Touch Events (Mobile Ergonomics)
  let touchStartX = 0;
  let touchStartY = 0;
  let isHorizontalGesture = false;

  window.addEventListener('touchstart', (e) => {
    if (modal && modal.classList.contains('active')) return;
    if (!e.touches[0]) return;
    isDragging = true;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    startTargetX = targetX;
    lastDragX = touchStartX;
    lastDragTime = performance.now();
    dragVelocity = 0;
    isHorizontalGesture = false;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging || !e.touches[0]) return;
    const currentTouchX = e.touches[0].clientX;
    const currentTouchY = e.touches[0].clientY;
    const dx = currentTouchX - touchStartX;
    const dy = currentTouchY - touchStartY;

    if (!isHorizontalGesture) {
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
        isHorizontalGesture = Math.abs(dx) >= Math.abs(dy);
      }
    }

    if (isHorizontalGesture) {
      if (e.cancelable) e.preventDefault();
      const now = performance.now();
      const dt = now - lastDragTime;
      if (dt > 0) {
        dragVelocity = (currentTouchX - lastDragX) / dt;
      }
      lastDragX = currentTouchX;
      lastDragTime = now;

      targetX = startTargetX + dx * 1.35;
      targetX = Math.max(minX - 60, Math.min(maxX + 60, targetX)); // Rubberband overshoot
      requestRender();
    }
  }, { passive: false });

  window.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    // Apply fling momentum
    if (Math.abs(dragVelocity) > 0.25) {
      targetX += dragVelocity * 280;
    }
    // Snap within bounds
    targetX = Math.max(minX, Math.min(maxX, targetX));
    requestRender();
  }, { passive: true });

  // Mouse Drag Scrubbing (Desktop)
  if (viewport) {
    viewport.addEventListener('mousedown', (e) => {
      // Don't drag if clicking buttons or interactive links
      if (e.target.closest('button, a, .darkroom-modal')) return;
      isDragging = true;
      startPointerX = e.clientX;
      startTargetX = targetX;
      lastDragX = startPointerX;
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

      const dx = e.clientX - startPointerX;
      targetX = startTargetX + dx * 1.3;
      targetX = Math.max(minX - 50, Math.min(maxX + 50, targetX));
      requestRender();
    });

    window.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      if (Math.abs(dragVelocity) > 0.25) {
        targetX += dragVelocity * 260;
      }
      targetX = Math.max(minX, Math.min(maxX, targetX));
      requestRender();
    });
  }

  // Keyboard Navigation (Arrow Keys)
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
      navigateToCard(activeCardIndex + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      navigateToCard(activeCardIndex - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      navigateToCard(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      navigateToCard(cards.length - 1);
    } else if (e.key.toLowerCase() === 't') {
      const active = html.getAttribute('data-theme');
      applyTheme(active === 'dark' ? 'light' : 'dark');
    }
  });

  function navigateToCard(index) {
    const targetIdx = Math.max(0, Math.min(cards.length - 1, index));
    const firstCard = cards[0];
    const targetCard = cards[targetIdx];
    const firstCenter = firstCard.offsetLeft + firstCard.offsetWidth / 2;
    const targetCenter = targetCard.offsetLeft + targetCard.offsetWidth / 2;

    targetX = -(targetCenter - firstCenter);
    targetX = Math.max(minX, Math.min(maxX, targetX));
    requestRender();
  }

  // 6. DARKROOM LIGHTBOX MODAL
  let currentModalIdx = 0;

  function openModal(index) {
    currentModalIdx = index;
    const card = cards[index];
    if (!card) return;

    const fullSrc = card.dataset.full || card.querySelector('img').src;
    const idx = card.dataset.idx || `0${index + 1}`;
    const tag = card.dataset.tag || 'ARTIFACT';
    const title = card.dataset.title || 'Untitled';
    const medium = card.dataset.medium || '';
    const desc = card.dataset.desc || '';

    modalImg.src = fullSrc;
    modalIdx.textContent = `[ ${idx} // EXHIBITION ]`;
    modalTag.textContent = tag;
    modalTitle.textContent = title;
    modalMedium.textContent = medium;
    modalDesc.textContent = desc;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    modalImg.src = '';
  }

  function showPrevModal() {
    const prev = (currentModalIdx - 1 + cards.length) % cards.length;
    openModal(prev);
  }

  function showNextModal() {
    const next = (currentModalIdx + 1) % cards.length;
    openModal(next);
  }

  cards.forEach((card, i) => {
    card.addEventListener('click', () => {
      // If we were dragging significantly, don't trigger modal click
      if (Math.abs(dragVelocity) > 0.1) return;
      openModal(i);
    });
  });

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalPrev) modalPrev.addEventListener('click', showPrevModal);
  if (modalNext) modalNext.addEventListener('click', showNextModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // 7. INITIALIZATION
  window.addEventListener('DOMContentLoaded', () => {
    updateBounds();
    requestRender();
  });

  // Re-run bounds after images load
  window.addEventListener('load', () => {
    updateBounds();
    requestRender();
  });

})();
