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


/* 3. THE RENDER LOOP (Background Position Animation) */
const bgLayer1 = document.querySelector('.layer-1');
const layer2 = document.querySelector('.layer-2-bg');

const isDesktop = window.matchMedia("(min-width: 992px)");

let autoScrollX = 0;
const speed = 0.1; // Speed of horizontal auto-scroll

function renderLoop() {
  const scrollPos = window.scrollY;
  
  // 1. Calculate Global Position
  autoScrollX -= speed;
  const totalX = autoScrollX + (scrollPos * -0.5);

  // 2. LAYER 1 (Vertical Parallax)
  if(bgLayer1) {
    bgLayer1.style.transform = `translateY(${scrollPos * -0.1}px)`;
  }

  // 3. LAYER 2 (Background Position Animation - Seamless)
  if(layer2) {
    // Animate background-position which naturally tiles
    layer2.style.backgroundPosition = `${totalX}px 0px`;
  }

  // 4. PROJECT PARALLAX
  if (isDesktop.matches) {
    const projects = document.querySelectorAll('.project-row');
    const screenCenter = window.innerHeight / 2;

    projects.forEach(row => {
      const imgWrapper = row.querySelector('.img-wrapper');
      if (!imgWrapper) return;
      const rect = row.getBoundingClientRect();
      const rowCenter = rect.top + (rect.height / 2);
      const distanceFromCenter = rowCenter - screenCenter;
      const parallaxY = distanceFromCenter * 0.15;
      imgWrapper.style.transform = `translateY(${parallaxY}px)`;
    });
  }

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