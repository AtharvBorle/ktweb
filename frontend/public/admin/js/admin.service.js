/**
 * Enterprise Admin API Service
 * Centralizes all admin network calls, authentication, file uploads, and dynamic asset origin resolution
 */

class AdminService {
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

  getToken() {
    try {
      return localStorage.getItem('kt_admin_token') || sessionStorage.getItem('kt_admin_token') || '';
    } catch (e) {
      return '';
    }
  }

  setToken(token) {
    try {
      if (token) {
        localStorage.setItem('kt_admin_token', token);
        sessionStorage.setItem('kt_admin_token', token);
      } else {
        this.removeToken();
      }
    } catch (e) {}
  }

  removeToken() {
    try {
      localStorage.removeItem('kt_admin_token');
      sessionStorage.removeItem('kt_admin_token');
      localStorage.removeItem('kt_admin_user');
      sessionStorage.removeItem('kt_admin_user');
    } catch (e) {}
  }

  async request(endpoint, options = {}) {
    try {
      const url = `${this.baseUrl}${endpoint}${endpoint.includes('?') ? '&' : '?'}_t=${Date.now()}`;
      const defaultHeaders = options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' };
      
      const token = this.getToken();
      const authHeaders = (token && token !== 'undefined' && token !== 'null') ? { 'Authorization': `Bearer ${token}` } : {};

      const res = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...authHeaders,
          ...(options.headers || {})
        },
        credentials: 'include'
      });

      if (res.status === 401) {
        if (!endpoint.includes('/admin/login')) {
          this.removeToken();
        }
      }

      return await res.json();
    } catch (err) {
      console.error(`Admin API Error [${endpoint}]:`, err);
      return { success: false, message: err.message };
    }
  }

  // --- Auth ---
  async checkAuth() {
    return this.request('/admin/me');
  }

  async login(username, password) {
    const res = await this.request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    if (res && res.success && res.data) {
      if (res.data.token) {
        this.setToken(res.data.token);
      }
      if (res.data.admin) {
        try {
          localStorage.setItem('kt_admin_user', JSON.stringify(res.data.admin));
        } catch (e) {}
      }
    }
    return res;
  }

  async logout() {
    try {
      return await this.request('/admin/logout', { method: 'POST' });
    } finally {
      this.removeToken();
    }
  }

  async changePassword(currentPassword, newPassword) {
    return this.request('/admin/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }

  async getSecurityStatus() {
    return this.request('/admin/security-status');
  }

  // --- Content Fetch ---
  async getContent() {
    return this.request('/content');
  }

  // --- QR Generator ---
  async generateQr(text) {
    return this.request(`/admin/generate-qr?text=${encodeURIComponent(text)}`);
  }

  // --- File Upload ---
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request('/admin/upload', {
      method: 'POST',
      body: formData
    });
  }

  // --- Settings & Static Sections ---
  async updateSettings(data) {
    return this.request('/admin/settings', { method: 'PUT', body: JSON.stringify(data) });
  }

  async updateHero(data) {
    return this.request('/admin/hero', { method: 'PUT', body: JSON.stringify(data) });
  }

  async updateOrganization(data) {
    return this.request('/admin/organization', { method: 'PUT', body: JSON.stringify(data) });
  }

  // --- Main Initiatives CRUD ---
  async saveInitiative(data) {
    return this.request('/admin/initiatives', { method: 'POST', body: JSON.stringify(data) });
  }

  async deleteInitiative(id) {
    return this.request(`/admin/initiatives/${id}`, { method: 'DELETE' });
  }

  // --- Initiative Pillars CRUD ---
  async saveInitiativePillar(data) {
    return this.request('/admin/initiative-pillars', { method: 'POST', body: JSON.stringify(data) });
  }

  async deleteInitiativePillar(id) {
    return this.request(`/admin/initiative-pillars/${id}`, { method: 'DELETE' });
  }

  // --- Key Highlights CRUD ---
  async saveKeyHighlight(data) {
    return this.request('/admin/key-highlights', { method: 'POST', body: JSON.stringify(data) });
  }

  async deleteKeyHighlight(id) {
    return this.request(`/admin/key-highlights/${id}`, { method: 'DELETE' });
  }

  // --- Meet Kunal Slides CRUD ---
  async saveMeetKunalSlide(data) {
    return this.request('/admin/meet-kunal', { method: 'POST', body: JSON.stringify(data) });
  }

  async saveMeetKunal(data) {
    return this.saveMeetKunalSlide(data);
  }

  async deleteMeetKunalSlide(id) {
    return this.request(`/admin/meet-kunal/${id}`, { method: 'DELETE' });
  }

  async deleteMeetKunal(id) {
    return this.deleteMeetKunalSlide(id);
  }

  // --- Sector Initiatives CRUD ---
  async saveSectorInitiative(data) {
    return this.request('/admin/sector-initiatives', { method: 'POST', body: JSON.stringify(data) });
  }

  async saveSectorItem(data) {
    return this.saveSectorInitiative(data);
  }

  async deleteSectorInitiative(id) {
    return this.request(`/admin/sector-initiatives/${id}`, { method: 'DELETE' });
  }

  async deleteSectorItem(id) {
    return this.deleteSectorInitiative(id);
  }

  // --- Parliament Highlights CRUD ---
  async saveParliamentItem(data) {
    return this.request('/admin/parliament-items', { method: 'POST', body: JSON.stringify(data) });
  }

  async deleteParliamentItem(id) {
    return this.request(`/admin/parliament-items/${id}`, { method: 'DELETE' });
  }

  // --- Constituency Projects CRUD ---
  async saveConstituencyProject(data) {
    return this.request('/admin/constituency-projects', { method: 'POST', body: JSON.stringify(data) });
  }

  async saveProject(data) {
    return this.saveConstituencyProject(data);
  }

  async deleteConstituencyProject(id) {
    return this.request(`/admin/constituency-projects/${id}`, { method: 'DELETE' });
  }

  async deleteProject(id) {
    return this.deleteConstituencyProject(id);
  }

  // --- Blogs & Press Coverage CRUD ---
  async saveBlog(data) {
    return this.request('/admin/blogs', { method: 'POST', body: JSON.stringify(data) });
  }

  async deleteBlog(id) {
    return this.request(`/admin/blogs/${id}`, { method: 'DELETE' });
  }

  // --- Gallery Photos & Videos CRUD ---
  async saveGalleryItem(data) {
    return this.request('/admin/gallery', { method: 'POST', body: JSON.stringify(data) });
  }

  async saveGallery(data) {
    return this.saveGalleryItem(data);
  }

  async deleteGalleryItem(id) {
    return this.request(`/admin/gallery/${id}`, { method: 'DELETE' });
  }

  async deleteGallery(id) {
    return this.deleteGalleryItem(id);
  }

  // --- Report Cards CRUD ---
  async saveReportCard(data) {
    return this.request('/admin/report-cards', { method: 'POST', body: JSON.stringify(data) });
  }

  async deleteReportCard(id) {
    return this.request(`/admin/report-cards/${id}`, { method: 'DELETE' });
  }

  // --- Contact Messages ---
  async getMessages() {
    return this.request('/admin/messages');
  }

  async deleteMessage(id) {
    return this.request(`/admin/messages/${id}`, { method: 'DELETE' });
  }

  // --- Categories CRUD ---
  async getCategories() {
    return this.request('/admin/categories');
  }

  async saveCategory(data) {
    return this.request('/admin/categories', { method: 'POST', body: JSON.stringify(data) });
  }

  async deleteCategory(id) {
    return this.request(`/admin/categories/${id}`, { method: 'DELETE' });
  }
}

// Global Singleton
window.adminService = new AdminService();
