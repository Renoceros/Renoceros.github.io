/* Loader Logic (jQuery) */
$(window).on('load', function() {
  $("#loader-wrapper").fadeOut(700);
});

/* Theme Toggle Logic */
const toggle = document.getElementById("themeToggle");

function applyTheme(mode) {
  const elems = document.querySelectorAll("p, h1, h2, h3, h4, h5, h6");

  if (mode === "dark") {
    document.body.classList.remove("light-mode");
    document.body.classList.add("dark-mode");
    if (toggle) {
      toggle.classList.remove("light");
      toggle.classList.add("dark");
      toggle.textContent = "🌜";
    }

    elems.forEach(el => {
      el.classList.remove("light-mode");
      el.classList.add("dark-mode");
    });
  } else {
    document.body.classList.remove("dark-mode");
    document.body.classList.add("light-mode");
    if (toggle) {
      toggle.classList.remove("dark");
      toggle.classList.add("light");
      toggle.textContent = "🌞";
    }

    elems.forEach(el => {
      el.classList.remove("dark-mode");
      el.classList.add("light-mode");
    });
  }
}

// If user previously chose theme, use that
const savedTheme = localStorage.getItem("theme");

if (savedTheme) {
  applyTheme(savedTheme);
} else {
  // Otherwise detect system preference
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(prefersDark ? "dark" : "light");
}

if (toggle) {
  toggle.addEventListener("click", () => {
    const current = document.body.classList.contains("dark-mode") ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    localStorage.setItem("theme", next);
    applyTheme(next);
  });
}