/**
 * Enterprise Frontend API Service
 * Centralizes all network requests, base URL detection, and dynamic asset origin resolution
 */

class ApiService {
  constructor() {
    this.baseUrl = this.detectApiBaseUrl();
  }

  detectApiBaseUrl() {
    if (typeof window !== 'undefined') {
      if (window.API_URL) return window.API_URL;
      if (window.VITE_API_URL) return window.VITE_API_URL;

      const hostname = window.location.hostname;
      const port = window.location.port;

      // 1. Localhost development
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        if (port === '5000' || port === '5001') {
          return '/api'; // Same-origin Express server
        }
        return 'http://localhost:5000/api'; // Decoupled frontend server (e.g. port 3000)
      }

      // 2. Development CloudPanel / Nginx domain
      if (hostname === 'dev.kunaltilak.com') {
        return 'https://dev.api.kunaltilak.com/api';
      }
      if (hostname === 'dev.office.kunaltilak.com') {
        return 'https://dev.api.office.kunaltilak.com/api';
      }
      if (hostname.startsWith('dev.')) {
        return 'https://dev.api.kunaltilak.com/api';
      }

      // 3. Office subdomains
      if (hostname === 'office.kunaltilak.com') {
        return 'https://api.office.kunaltilak.com/api';
      }

      // 4. Production CloudPanel / Nginx domain
      if (hostname === 'kunaltilak.com' || hostname === 'www.kunaltilak.com' || hostname.endsWith('kunaltilak.com') || hostname.endsWith('kunaltilak.in')) {
        return 'https://api.kunaltilak.com/api';
      }
    }
    return '/api';
  }

  getBackendOrigin() {
    if (typeof window !== 'undefined') {
      if (window.BACKEND_ORIGIN) return window.BACKEND_ORIGIN;

      const hostname = window.location.hostname;
      const port = window.location.port;

      // 1. Localhost development
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        if (port === '5000' || port === '5001') {
          return ''; // Same-origin
        }
        return 'http://localhost:5000';
      }

      // 2. Development CloudPanel / Nginx domain
      if (hostname === 'dev.kunaltilak.com') {
        return 'https://dev.api.kunaltilak.com';
      }
      if (hostname === 'dev.office.kunaltilak.com') {
        return 'https://dev.api.office.kunaltilak.com';
      }
      if (hostname.startsWith('dev.')) {
        return 'https://dev.api.kunaltilak.com';
      }

      // 3. Office subdomains
      if (hostname === 'office.kunaltilak.com') {
        return 'https://api.office.kunaltilak.com';
      }

      // 4. Production CloudPanel / Nginx domain
      if (hostname === 'kunaltilak.com' || hostname === 'www.kunaltilak.com' || hostname.endsWith('kunaltilak.com') || hostname.endsWith('kunaltilak.in')) {
        return 'https://api.kunaltilak.com';
      }
    }
    return '';
  }

  bustingUrl(url) {
    if (!url) return '';
    if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) return url;

    let finalUrl = url;
    const origin = this.getBackendOrigin();
    
    // Prefix backend origin only for dynamic uploaded files
    if (origin) {
      if (url.startsWith('/uploads') || url.startsWith('uploads/')) {
        const clean = url.startsWith('/') ? url : '/' + url;
        finalUrl = origin + clean;
      }
    }

    return finalUrl.includes('?') ? finalUrl : `${finalUrl}?_t=${Date.now()}`;
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  async get(endpoint) {
    try {
      const url = `${this.baseUrl}${endpoint}${endpoint.includes('?') ? '&' : '?'}_t=${Date.now()}`;
      const res = await fetch(url, {
        method: 'GET',
        cache: 'no-store',
        credentials: 'include'
      });
      return await res.json();
    } catch (err) {
      console.error(`API GET Error [${endpoint}]:`, err);
      return { success: false, message: err.message };
    }
  }

  async getContent() {
    return this.get('/content');
  }

  async submitContact(data) {
    try {
      const res = await fetch(`${this.baseUrl}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err) {
      console.error('API Contact Error:', err);
      return { success: false, message: err.message };
    }
  }
}

// Global Singleton
window.apiService = new ApiService();
