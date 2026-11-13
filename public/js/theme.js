// public/js/theme.js - Dark/Light Theme Controller
// CS3911 Startup Practicum 3 - Deep Ranjan Paul & Yuvrat Mittal

window.CampusCartTheme = {
  KEY: 'campuscart_theme',

  init() {
    const saved = localStorage.getItem(this.KEY);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    this.applyTheme(theme, false);
  },

  applyTheme(theme, save = true) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    if (save) {
      localStorage.setItem(this.KEY, theme);
    }
    this.updateToggleIcons(theme);
  },

  toggle() {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    this.applyTheme(next, true);
    if (window.CampusCartToast) {
      window.CampusCartToast.info(next === 'dark' ? 'Dark Mode Enabled' : 'Light Mode Enabled', '', 1500);
    }
    return next;
  },

  updateToggleIcons(theme) {
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
      btn.setAttribute('title', theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    });
  }
};

CampusCartTheme.init();
