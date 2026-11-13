// public/js/auth.js - Client Authentication & Global Session Manager
// CS3911 Startup Practicum 3 - Deep Ranjan Paul & Yuvrat Mittal

window.CampusCartAuth = {
  TOKEN_KEY: 'campuscart_token',
  USER_KEY: 'campuscart_user',

  getToken() {
    return localStorage.getItem(this.TOKEN_KEY) || null;
  },

  getUser() {
    const raw = localStorage.getItem(this.USER_KEY);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  },

  setSession(token, user) {
    if (token) localStorage.setItem(this.TOKEN_KEY, token);
    if (user) localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.updateNavbar();
  },

  clearSession() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.updateNavbar();
  },

  async logout() {
    try {
      if (window.CampusCartAPI) {
        await window.CampusCartAPI.post('/auth/logout').catch(() => {});
      }
    } finally {
      this.clearSession();
      window.location.href = '/login.html';
    }
  },

  handleUnauthorized() {
    this.clearSession();
  },

  async syncUserProfile() {
    if (!this.isAuthenticated()) return null;
    try {
      const res = await window.CampusCartAPI.get('/auth/me');
      if (res && res.data) {
        this.setSession(this.getToken(), res.data);
        return res.data;
      }
    } catch (err) {
      if (err.status === 401) {
        this.clearSession();
      }
    }
    return null;
  },

  requireAuth(redirectUrl = window.location.pathname) {
    if (!this.isAuthenticated()) {
      window.location.href = `/login.html?redirect=${encodeURIComponent(redirectUrl)}`;
      return false;
    }
    return true;
  },

  /**
   * Dynamically renders user menu in navbar across all pages
   */
  updateNavbar() {
    const navActions = document.querySelector('.site-header .nav-actions');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const isAuthed = this.isAuthenticated();
    const user = this.getUser();

    // 1. Desktop Nav Actions
    if (navActions) {
      if (isAuthed && user) {
        const initials = user.name
          ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
          : 'ST';

        navActions.innerHTML = `
          <a href="/dashboard.html?tab=saved" class="btn btn-ghost btn-sm" title="Saved Items" style="display:inline-flex; align-items:center; padding: 0.4rem 0.6rem;">
            <span>❤️</span>
            <span class="wishlist-badge-count" style="display:none;">0</span>
          </a>
          <button class="theme-toggle-btn" aria-label="Toggle Theme">🌙</button>
          <a href="/sell.html" class="btn btn-primary btn-sm action-sell-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>Sell Item</span>
          </a>
          <a href="/dashboard.html" class="user-pill-btn" title="View Dashboard" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.35rem 0.75rem; background: var(--bg-subtle); border: 1px solid var(--border); border-radius: var(--radius-full); font-size: 0.85rem; font-weight: 600; color: var(--secondary);">
            <div style="width: 26px; height: 26px; border-radius: 50%; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700;">
              ${initials}
            </div>
            <span>${escapeHtml(user.name.split(' ')[0])}</span>
          </a>
          <button class="btn btn-ghost btn-sm" id="nav-logout-btn" title="Sign Out">Sign Out</button>
          <button class="mobile-nav-toggle" id="mobile-nav-toggle" aria-label="Open Navigation Menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="4" y1="6" x2="20" y2="6"/>
              <line x1="4" y1="12" x2="20" y2="12"/>
              <line x1="4" y1="18" x2="20" y2="18"/>
            </svg>
          </button>
        `;

        const logoutBtn = document.getElementById('nav-logout-btn');
        if (logoutBtn) {
          logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
          });
        }
      } else {
        navActions.innerHTML = `
          <a href="/dashboard.html?tab=saved" class="btn btn-ghost btn-sm" title="Saved Items" style="display:inline-flex; align-items:center; padding: 0.4rem 0.6rem;">
            <span>❤️</span>
            <span class="wishlist-badge-count" style="display:none;">0</span>
          </a>
          <button class="theme-toggle-btn" aria-label="Toggle Theme">🌙</button>
          <a href="/login.html" class="btn btn-ghost action-login-btn">Sign In</a>
          <a href="/sell.html" class="btn btn-primary action-sell-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>Sell an Item</span>
          </a>
          <button class="mobile-nav-toggle" id="mobile-nav-toggle" aria-label="Open Navigation Menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="4" y1="6" x2="20" y2="6"/>
              <line x1="4" y1="12" x2="20" y2="12"/>
              <line x1="4" y1="18" x2="20" y2="18"/>
            </svg>
          </button>
        `;
      }
    }

    // 2. Mobile Drawer Actions
    if (mobileDrawer) {
      const drawerLinks = mobileDrawer.querySelector('.drawer-links');
      const drawerActions = mobileDrawer.querySelector('.drawer-actions') || mobileDrawer.querySelector('div[style*="margin-top: auto"]');

      if (drawerLinks && isAuthed && user) {
        drawerLinks.innerHTML = `
          <li><a href="/explore.html">Browse Marketplace</a></li>
          <li><a href="/dashboard.html">My Dashboard & Listings</a></li>
          <li><a href="/sell.html">+ Post a New Listing</a></li>
          <li><a href="/#how-it-works">How It Works</a></li>
          <li><a href="/#trust">Campus Safety</a></li>
        `;
      }

      if (drawerActions) {
        if (isAuthed && user) {
          drawerActions.innerHTML = `
            <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">Signed in as <strong>${escapeHtml(user.name)}</strong></div>
            <a href="/dashboard.html" class="btn btn-secondary" style="width:100%; text-align: center;">My Dashboard</a>
            <button class="btn btn-ghost" id="drawer-logout-btn" style="width:100%; color: var(--danger);">Sign Out</button>
          `;
          const drawerLogout = document.getElementById('drawer-logout-btn');
          if (drawerLogout) {
            drawerLogout.addEventListener('click', (e) => {
              e.preventDefault();
              this.logout();
            });
          }
        } else {
          drawerActions.innerHTML = `
            <a href="/login.html" class="btn btn-secondary" style="width:100%; text-align: center;">Sign In</a>
            <a href="/register.html" class="btn btn-primary" style="width:100%; text-align: center;">Register Student Account</a>
          `;
        }
      }
    }

    // Reattach mobile toggle handler
    const mobileToggle = document.getElementById('mobile-nav-toggle');
    const closeDrawerBtn = document.getElementById('close-drawer-btn');
    if (mobileToggle && mobileDrawer && closeDrawerBtn) {
      mobileToggle.onclick = () => mobileDrawer.classList.add('open');
      closeDrawerBtn.onclick = () => mobileDrawer.classList.remove('open');
    }

    // Attach theme toggle
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.onclick = () => {
        if (window.CampusCartTheme) {
          window.CampusCartTheme.toggle();
        }
      };
    });

    // Update wishlist badge
    if (window.CampusCartWishlist) {
      window.CampusCartWishlist.updateBadges();
    }
  }
};

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', () => {
  window.CampusCartAuth.updateNavbar();
});
