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


/* 6. IDLE SPECULATIVE PRELOADER FOR ART ATELIER
   Guarantees 0% contention with index.html loading & interaction:
   - Defers execution until window 'load' + 1500ms safety buffer + requestIdleCallback
   - Respects Save-Data and 2G mobile connection constraints
   - Streams art.html, art.css, art.js, and low-res thumbnails sequentially into HTTP/image cache
   - Supports early trigger on portal button hover / focus
*/
(function setupArtPreloader() {
  if (navigator.connection && (navigator.connection.saveData || /2g/.test(navigator.connection.effectiveType))) {
    return;
  }

  const artAssets = [
    { url: 'art.html', as: 'document' },
    { url: 'art.css', as: 'style' },
    { url: 'art.js', as: 'script' },
    { url: 'assets/artwork/thumbs/3waydeadlock.png', as: 'image' },
    { url: 'assets/artwork/thumbs/Dutch_Lion.png', as: 'image' },
    { url: 'assets/artwork/thumbs/IMG_4189.jpg', as: 'image' },
    { url: 'assets/artwork/thumbs/IMG_4225.jpg', as: 'image' },
    { url: 'assets/artwork/thumbs/IMG_4237.jpg', as: 'image' },
    { url: 'assets/artwork/thumbs/IMG_5208.jpg', as: 'image' },
    { url: 'assets/artwork/thumbs/IMG_6180.jpg', as: 'image' },
    { url: 'assets/artwork/thumbs/IMG_6185.jpg', as: 'image' },
    { url: 'assets/artwork/thumbs/MadMax.png', as: 'image' },
    { url: 'assets/artwork/thumbs/Untitled_Artwork 8.png', as: 'image' }
  ];

  let preloaded = false;

  function runIdlePreload() {
    if (preloaded) return;
    preloaded = true;

    let index = 0;
    function loadNext() {
      if (index >= artAssets.length) return;
      const asset = artAssets[index++];

      if (asset.as === 'image') {
        const img = new Image();
        img.decoding = 'async';
        img.src = asset.url;
      } else if ('fetch' in window) {
        fetch(asset.url, { priority: 'low' }).catch(() => {});
      } else {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = asset.url;
        if (asset.as) link.as = asset.as;
        document.head.appendChild(link);
      }

      // 120ms staggered interval keeps network pipelines completely clear
      setTimeout(loadNext, 120);
    }

    loadNext();
  }

  // Defer strictly until index.html has 100% completed loading
  window.addEventListener('load', () => {
    const schedule = () => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(runIdlePreload, { timeout: 4000 });
      } else {
        setTimeout(runIdlePreload, 1500);
      }
    };
    setTimeout(schedule, 1200);
  });

  // Early trigger if user gestures towards the portal button
  const portalBtn = document.getElementById('modeToggle');
  if (portalBtn) {
    portalBtn.addEventListener('pointerenter', runIdlePreload, { once: true });
    portalBtn.addEventListener('focus', runIdlePreload, { once: true });
  }
})();
