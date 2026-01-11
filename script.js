/* 1. THEME TOGGLE LOGIC 
*/
const toggleBtn = document.getElementById('themeToggle');
const icon = toggleBtn.querySelector('.icon');
const html = document.documentElement;

// Check local storage or system preference on load
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

/* 2. SCROLL ANIMATION (Intersection Observer)
  This triggers the CSS animations when elements scroll into view.
*/
const observerOptions = {
  root: null,           // viewport
  threshold: 0.15,      // trigger when 15% of element is visible
  rootMargin: "0px"
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Add the class that resets opacity and transform
      entry.target.classList.add('active');
      // Stop watching once animated (optional - remove if you want re-animation)
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Grab all elements we want to animate
const revealElements = document.querySelectorAll('.reveal-left, .reveal-right, .reveal-bottom');

revealElements.forEach(el => observer.observe(el));