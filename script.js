/* ==========================================================================
   RENOCEROS PORTFOLIO ENGINE — script.js
   Author: Moreno Kristovan (Renoceros)
   Architecture: Lightweight 2-Layer Noise Engine & Apple HIG Tactility
   ========================================================================== */

/* 1. THEME ENGINE & PERSISTENCE (Google Material Symbols) */
const html = document.documentElement;
const toggleBtn = document.getElementById('themeToggle');
const themeIcon = toggleBtn ? toggleBtn.querySelector('.icon') : null;

const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  if (themeIcon) {
    // Show opposite icon for next toggle state
    themeIcon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
  }
}

if (savedTheme === 'light' || (!savedTheme && !prefersDark)) {
  applyTheme('light');
} else {
  applyTheme('dark');
}

if (toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    const active = html.getAttribute('data-theme');
    applyTheme(active === 'dark' ? 'light' : 'dark');
  });
}


/* 2. SCROLL ENTRANCE REVEAL (Observer) */
const observerOptions = {
  root: null,
  threshold: 0.1,
  rootMargin: "0px"
};

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    } else {
      entry.target.classList.remove('active');
    }
  });
}, observerOptions);

document.querySelectorAll('.reveal-left, .reveal-right, .reveal-bottom').forEach(el => {
  revealObserver.observe(el);
});


/* 3. LOGO REPEL INTERACTIVE PHYSICS (Desktop Mouse & Mobile Touch) */
const logo = document.getElementById('repelLogo');

if (logo) {
  const repelMath = (clientX, clientY) => {
    const rect = logo.getBoundingClientRect();
    const x = clientX - rect.left - (rect.width / 2);
    const y = clientY - rect.top - (rect.height / 2);
    // Repel by -2.5% of mouse/touch delta
    const moveX = x * -0.025;
    const moveY = y * -0.025;
    logo.style.transform = `translate(${moveX}px, ${moveY}px)`;
  };

  logo.addEventListener('mousemove', (e) => repelMath(e.clientX, e.clientY));
  logo.addEventListener('mouseleave', () => {
    logo.style.transform = 'translate(0px, 0px)';
  });

  logo.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      repelMath(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  logo.addEventListener('touchend', () => {
    logo.style.transform = 'translate(0px, 0px)';
  });
}


/* 4. KEYBOARD COMMAND NAVIGATION */
window.addEventListener('keydown', (e) => {
  if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName) || document.activeElement?.isContentEditable) {
    return;
  }

  const key = e.key.toLowerCase();
  if (key === 't') {
    const active = html.getAttribute('data-theme');
    applyTheme(active === 'dark' ? 'light' : 'dark');
  } else if (key === 'p' || key === 'w' || key === 's') {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
  } else if (key === 'd') {
    document.getElementById('academy')?.scrollIntoView({ behavior: 'smooth' });
  } else if (key === 'i') {
    document.getElementById('invariants')?.scrollIntoView({ behavior: 'smooth' });
  } else if (key === 'a') {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  } else if (key === 'c') {
    const cvLink = document.querySelector('a[href$="Moreno_Kristovan_CV.pdf"]');
    if (cvLink) cvLink.click();
  }
});


/* 5. LIGHTWEIGHT DESKTOP CARD PARALLAX */
const isDesktop = window.matchMedia("(min-width: 992px)");

function handleCardParallax() {
  if (!isDesktop.matches) return;
  const screenCenter = window.innerHeight / 2;
  document.querySelectorAll('.project-row').forEach(row => {
    const imgWrapper = row.querySelector('.img-wrapper');
    if (!imgWrapper) return;
    const rect = row.getBoundingClientRect();
    const rowCenter = rect.top + (rect.height / 2);
    const parallaxY = (rowCenter - screenCenter) * 0.06;
    imgWrapper.style.transform = `translateY(${parallaxY}px)`;
  });
}

window.addEventListener('scroll', handleCardParallax, { passive: true });
handleCardParallax();
