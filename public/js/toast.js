// public/js/toast.js - Modern Interactive Toast & Confirm Dialog System
// CS3911 Startup Practicum 3 - Deep Ranjan Paul & Yuvrat Mittal

window.CampusCartToast = {
  container: null,

  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },

  show(type = 'info', title = '', message = '', duration = 4000) {
    this.init();

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || 'ℹ'}</div>
      <div class="toast-content">
        ${title ? `<div class="toast-title">${escapeHtml(title)}</div>` : ''}
        <div class="toast-message">${escapeHtml(message)}</div>
      </div>
      <button class="toast-close" aria-label="Close notification">&times;</button>
      <div class="toast-progress">
        <div class="toast-progress-bar" style="animation-duration: ${duration}ms"></div>
      </div>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.onclick = () => this.dismiss(toast);

    this.container.appendChild(toast);

    // Auto dismiss after duration
    const timer = setTimeout(() => {
      this.dismiss(toast);
    }, duration);

    toast._timer = timer;
    return toast;
  },

  dismiss(toast) {
    if (!toast || toast.classList.contains('dismissing')) return;
    toast.classList.add('dismissing');
    clearTimeout(toast._timer);
    setTimeout(() => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
    }, 250);
  },

  success(title, message, duration) {
    return this.show('success', title, message, duration);
  },

  error(title, message, duration) {
    return this.show('error', title, message, duration);
  },

  info(title, message, duration) {
    return this.show('info', title, message, duration);
  },

  warning(title, message, duration) {
    return this.show('warning', title, message, duration);
  }
};

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', () => {
  window.CampusCartToast.init();
});

