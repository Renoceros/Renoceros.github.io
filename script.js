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
const speed = 0.25; // Speed of the automatic drift (0.5px per frame)

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
  if (isDesktop.matches) {
    const projects = document.querySelectorAll('.project-row');
    const screenCenter = window.innerHeight / 2;

    projects.forEach(row => {
      const imgWrapper = row.querySelector('.img-wrapper');
      if(!imgWrapper) return;

      const rect = row.getBoundingClientRect();
      const rowCenter = rect.top + (rect.height / 2);
      const distanceFromCenter = rowCenter - screenCenter;

      const parallaxY = distanceFromCenter * 0.15;
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
    // -0.05 means "Move 5% of the distance away from the mouse"
    const moveX = x * -0.05;
    const moveY = y * -0.05;

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