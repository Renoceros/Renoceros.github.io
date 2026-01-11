/* 1. THEME TOGGLE LOGIC */
const toggleBtn = document.getElementById('themeToggle');
const icon = toggleBtn.querySelector('.icon');
const html = document.documentElement;

const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
  html.setAttribute('data-theme', 'dark');
  icon.textContent = '🌜';
} else {
  html.setAttribute('data-theme', 'light');
  icon.textContent = '🌞';
}

toggleBtn.addEventListener('click', () => {
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', newTheme);
  icon.textContent = newTheme === 'light' ? '🌞' : '🌜';
  localStorage.setItem('theme', newTheme);
});


/* 2. ENTRANCE ANIMATIONS (Observer) */
const observerOptions = {
  root: null,
  threshold: 0.15,
  rootMargin: "0px"
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    } else {
      entry.target.classList.remove('active'); 
    }
  });
}, observerOptions);

const revealElements = document.querySelectorAll('.reveal-left, .reveal-right, .reveal-bottom');
revealElements.forEach(el => observer.observe(el));


/* 3. THE RENDER LOOP (The "Game Loop") */
/* We switched from an event listener to a continuous loop.
   This allows the background to move even when you aren't scrolling.
*/

const bgLayer1 = document.querySelector('.layer-1');
const bgLayer2 = document.querySelector('.layer-2');
const isDesktop = window.matchMedia("(min-width: 992px)");

// Variables to track our constant movement
let autoScrollX = 0;
const speed = 0.15; // Speed of the automatic drift (0.15px per frame)

function renderLoop() {
  const scrollPos = window.scrollY;

  // 1. UPDATE AUTOMATIC SCROLL
  // We keep subtracting speed to move LEFT forever
  autoScrollX -= speed;

  // 2. ANIMATE BACKGROUND LAYERS
  
  // Layer 1: Vertical drift based ONLY on scroll (Parallax)
  if(bgLayer1) {
    bgLayer1.style.transform = `translateY(${scrollPos * -0.1}px)`;
  }
  
  // Layer 2: The Complex One
  // It uses autoScrollX (constant movement) PLUS scrollPos (user interaction)
  // When you scroll DOWN, it moves FASTER to the left.
  if(bgLayer2) {
    const totalX = autoScrollX + (scrollPos * -0.5);
    bgLayer2.style.transform = `translateX(${totalX}px)`;
  }


  // 3. PARALLAX PROJECT IMAGES (Desktop Only)
  // PARALLAX PROJECT IMAGES (Desktop Only)
  // Apply a subtle vertical parallax to project images based on their
  // distance from the vertical center of the viewport.
  if (isDesktop.matches) {
    // Grab all project rows to process each one
    const projects = document.querySelectorAll('.project-row');

    // Vertical center of the visible screen (used as the parallax origin)
    const screenCenter = window.innerHeight / 2;

    projects.forEach(row => {
      // Each row is expected to contain an .img-wrapper we want to move
      const imgWrapper = row.querySelector('.img-wrapper');
      if (!imgWrapper) return; // skip rows without an image wrapper

      // Get the row's position & size relative to the viewport
      const rect = row.getBoundingClientRect();

      // Compute the vertical center of the row (in viewport coordinates)
      const rowCenter = rect.top + (rect.height / 2);

      // Distance from the row center to the screen center.
      // Positive = row is below center, Negative = above center.
      const distanceFromCenter = rowCenter - screenCenter;

      // Scale the distance to create a subtle parallax effect.
      // 0.15 means the image moves 15% of the distance, keeping motion gentle.
      const parallaxY = distanceFromCenter * 0.15;

      // Apply a translateY to the image wrapper.
      // This overrides any previous transform on the element.
      imgWrapper.style.transform = `translateY(${parallaxY}px)`;
    });
  }

  // 4. LOOP
  // Call this function again on the next frame (60fps)
  requestAnimationFrame(renderLoop);
}

/* 4. LOGO REPEL EFFECT */
const logo = document.getElementById('repelLogo');

if (logo) {
  logo.addEventListener('mousemove', (e) => {
    // 1. Get the dimensions of the image
    const rect = logo.getBoundingClientRect();
    
    // 2. Calculate mouse position relative to the image's center
    // (0,0) becomes the center of the image
    const x = e.clientX - rect.left - (rect.width / 2);
    const y = e.clientY - rect.top - (rect.height / 2);

    // 3. The "Repel" Math
    // We multiply by a negative number to move in the opposite direction.
    // -0.025 means "Move 2.5% of the distance away from the mouse"
    const moveX = x * -0.025;
    const moveY = y * -0.025;

    // 4. Apply the transform
    logo.style.transform = `translate(${moveX}px, ${moveY}px)`;
  });

  // 5. Reset when mouse leaves
  logo.addEventListener('mouseleave', () => {
    logo.style.transform = 'translate(0px, 0px)';
  });
}

// Start the engine
renderLoop();