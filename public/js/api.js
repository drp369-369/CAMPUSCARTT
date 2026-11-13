// public/js/api.js - Unified Client API Fetch Wrapper
// CS3911 Startup Practicum 3 - Deep Ranjan Paul & Yuvrat Mittal

const API_BASE = '/api';

window.CampusCartAPI = {
  /**
   * Helper to retrieve auth token
   */
  getToken() {
    return localStorage.getItem('campuscart_token') || null;
  },

  /**
   * Standardized fetch wrapper with automatic JWT headers and JSON parsing
   */
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers || {})
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      method: options.method || 'GET',
      headers,
      ...(options.body ? { body: typeof options.body === 'object' ? JSON.stringify(options.body) : options.body } : {})
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        // If 401 Unauthorized, notify auth state to clear stale session
        if (response.status === 401 && window.CampusCartAuth) {
          window.CampusCartAuth.handleUnauthorized();
        }

        const error = new Error(data && data.error ? data.error : `HTTP Error ${response.status}`);
        error.status = response.status;
        error.details = data && data.details ? data.details : null;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      console.warn(`[API Request Error] ${options.method || 'GET'} ${url}:`, err.message);
      throw err;
    }
  },

  // HTTP Verb Shortcuts
  get(endpoint, params = null) {
    let url = endpoint;
    if (params) {
      const query = new URLSearchParams();
      Object.keys(params).forEach(k => {
        if (params[k] !== undefined && params[k] !== null && params[k] !== '') {
          query.append(k, params[k]);
        }
      });
      const qStr = query.toString();
      if (qStr) url += (url.includes('?') ? '&' : '?') + qStr;
    }
    return this.request(url, { method: 'GET' });
  },

  post(endpoint, body = {}) {
    return this.request(endpoint, { method: 'POST', body });
  },

  put(endpoint, body = {}) {
    return this.request(endpoint, { method: 'PUT', body });
  },

  delete(endpoint, params = null) {
    let url = endpoint;
    if (params) {
      const query = new URLSearchParams(params);
      url += (url.includes('?') ? '&' : '?') + query.toString();
    }
    return this.request(url, { method: 'DELETE' });
  }
};
