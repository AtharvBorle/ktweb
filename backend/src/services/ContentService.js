const QRCode = require('qrcode');
const dataRepo = require('../repositories/DataRepository');
const { BadRequestError, sanitizer } = require('../utils/helpers');

/**
 * Enterprise Content Service
 * Handles business logic, data sanitization, and content aggregation
 */
class ContentService {
  /**
   * Retrieves full aggregated site content for public display
   */
  async getFullContent() {
    return dataRepo.getFullContent();
  }

  // --- Settings ---
  async getSettings() {
    return dataRepo.getSettings();
  }

  async updateSettings(settingsData) {
    const sanitized = sanitizer.sanitizeObject(settingsData);
    return dataRepo.updateSettings(sanitized);
  }

  // --- Hero Section ---
  async getHero() {
    return dataRepo.getHero();
  }

  async updateHero(heroData) {
    const sanitized = sanitizer.sanitizeObject(heroData);
    return dataRepo.updateHero(sanitized);
  }

  // --- Organization / BJYM ---
  async getOrganization() {
    return dataRepo.getOrganization();
  }

  async updateOrganization(orgData) {
    const sanitized = sanitizer.sanitizeObject(orgData);
    return dataRepo.updateOrganization(sanitized);
  }

  // --- Main Initiatives ---
  async getInitiatives() {
    return dataRepo.getInitiatives();
  }

  async saveInitiative(initiativeData) {
    if (!initiativeData.title) {
      throw new BadRequestError('Initiative title is required.');
    }
    const sanitized = sanitizer.sanitizeObject(initiativeData);
    return dataRepo.saveInitiative(sanitized);
  }

  async deleteInitiative(id) {
    return dataRepo.deleteInitiative(id);
  }

  // --- Initiative Pillars (8 Core Pillars) ---
  async getInitiativePillars() {
    return dataRepo.getInitiativePillars();
  }

  async saveInitiativePillar(pillarData) {
    if (!pillarData.title) {
      throw new BadRequestError('Pillar title is required.');
    }
    const t = (pillarData.title || '').trim().toLowerCase();
    if (!pillarData.link || pillarData.link.trim() === '' || pillarData.link === '/a/index.html' || pillarData.link.endsWith('.html')) {
      if (t === 'education' || t.startsWith('edu') || t.includes('school') || t.includes('student')) {
        pillarData.link = '/initiatives/education';
        pillarData.key = 'education';
      } else if (t === 'health' || t.startsWith('health') || t.includes('medic') || t.includes('hospital')) {
        pillarData.link = '/initiatives/health';
        pillarData.key = 'health';
      } else if (t.includes('infra') || t.includes('transport') || t.includes('mobility') || t.includes('road') || t.includes('metro')) {
        pillarData.link = '/initiatives/infrastructure-transport-mobility';
        pillarData.key = 'infrastructure';
      } else if (t === 'sports' || t.startsWith('sport') || t.includes('game') || t.includes('fit')) {
        pillarData.link = '/initiatives/sports';
        pillarData.key = 'sports';
      } else if (t.includes('parliament') || t.includes('policy') || t.includes('amrit')) {
        pillarData.link = '/initiatives/policy-and-parliamentary-work';
        pillarData.key = 'policy';
      } else if (t.includes('constituency') || t.includes('project') || t.includes('swamih')) {
        pillarData.link = '/initiatives/constituency-projects';
        pillarData.key = 'projects';
      } else if (t.includes('secur') || t.includes('police') || t.includes('defense') || t.includes('law')) {
        pillarData.link = '/initiatives/security';
        pillarData.key = 'security';
      } else if (t.includes('labour') || t.includes('labor') || t.includes('worker') || t.includes('gig')) {
        pillarData.link = '/initiatives/labour';
        pillarData.key = 'labour';
      } else {
        const slug = t.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        pillarData.link = `/initiatives/${slug || 'initiative'}`;
        pillarData.key = slug || 'initiative';
      }
    }
    const sanitized = sanitizer.sanitizeObject(pillarData);
    return dataRepo.saveInitiativePillar(sanitized);
  }

  async deleteInitiativePillar(id) {
    return dataRepo.deleteInitiativePillar(id);
  }

  // --- Key Highlights ---
  async getKeyHighlights() {
    return dataRepo.getKeyHighlights();
  }

  async saveKeyHighlight(highlightData) {
    if (!highlightData.title) {
      throw new BadRequestError('Key highlight title is required.');
    }
    const sanitized = sanitizer.sanitizeObject(highlightData);
    return dataRepo.saveKeyHighlight(sanitized);
  }

  async deleteKeyHighlight(id) {
    return dataRepo.deleteKeyHighlight(id);
  }

  // --- Meet Kunal Slides ---
  async getMeetKunal() {
    return dataRepo.getMeetKunal();
  }

  async saveMeetKunalSlide(slideData) {
    if (!slideData.title) {
      throw new BadRequestError('Slide title is required.');
    }
    const sanitized = sanitizer.sanitizeObject(slideData);
    return dataRepo.saveMeetKunalSlide(sanitized);
  }

  async deleteMeetKunalSlide(id) {
    return dataRepo.deleteMeetKunalSlide(id);
  }

  // --- Parliament Items ---
  async getParliamentItems() {
    return dataRepo.getParliamentItems();
  }

  async saveParliamentItem(itemData) {
    if (!itemData.title) {
      throw new BadRequestError('Parliament item title is required.');
    }
    const sanitized = sanitizer.sanitizeObject(itemData);
    return dataRepo.saveParliamentItem(sanitized);
  }

  async deleteParliamentItem(id) {
    return dataRepo.deleteParliamentItem(id);
  }

  // --- Sector Initiatives ---
  async getSectorItems(sector = null) {
    return dataRepo.getSectorItems(sector);
  }

  async saveSectorItem(sectorData) {
    if (!sectorData.title || !sectorData.sector) {
      throw new BadRequestError('Sector name and title are required.');
    }
    const sanitized = sanitizer.sanitizeObject(sectorData);
    return dataRepo.saveSectorItem(sanitized);
  }

  async deleteSectorItem(id) {
    return dataRepo.deleteSectorItem(id);
  }

  // --- Constituency Projects ---
  async getConstituencyProjects() {
    return dataRepo.getConstituencyProjects();
  }

  async saveConstituencyProject(projectData) {
    if (!projectData.title) {
      throw new BadRequestError('Project title is required.');
    }
    const sanitized = sanitizer.sanitizeObject(projectData);
    return dataRepo.saveConstituencyProject(sanitized);
  }

  async deleteConstituencyProject(id) {
    return dataRepo.deleteConstituencyProject(id);
  }

  // --- Blogs ---
  async getBlogs() {
    return dataRepo.getBlogs();
  }

  async saveBlogPost(blogData) {
    if (!blogData.title) {
      throw new BadRequestError('Blog title is required.');
    }
    const sanitized = sanitizer.sanitizeObject(blogData);
    return dataRepo.saveBlogPost(sanitized);
  }

  async deleteBlogPost(id) {
    return dataRepo.deleteBlogPost(id);
  }

  // --- Gallery ---
  async getGallery() {
    return dataRepo.getGallery();
  }

  async saveGalleryItem(galleryData) {
    if (!galleryData.title) {
      throw new BadRequestError('Gallery item title is required.');
    }
    const sanitized = sanitizer.sanitizeObject(galleryData);
    return dataRepo.saveGalleryItem(sanitized);
  }

  async deleteGalleryItem(id) {
    return dataRepo.deleteGalleryItem(id);
  }

  // --- Contact Inquiries ---
  async submitContactMessage(contactData) {
    const { name, email, phone, subject, message } = contactData;
    if (!name || (!email && !phone) || !message) {
      throw new BadRequestError('Please provide your name, a contact method (email or phone), and a message.');
    }
    const sanitized = sanitizer.sanitizeObject({ name, email, phone, subject, message });
    return dataRepo.saveContactMessage(sanitized);
  }

  async getContactMessages() {
    return dataRepo.getContactMessages();
  }

  async deleteContactMessage(id) {
    return dataRepo.deleteContactMessage(id);
  }

  // --- Report Cards ---
  async getReportCards() {
    return dataRepo.getReportCards();
  }

  async saveReportCard(cardData) {
    if (!cardData.title) {
      throw new BadRequestError('Report Card title is required.');
    }
    const sanitized = sanitizer.sanitizeObject(cardData);
    return dataRepo.saveReportCard(sanitized);
  }

  async deleteReportCard(id) {
    return dataRepo.deleteReportCard(id);
  }

  // --- Categories ---
  async getCategories() {
    return dataRepo.getCategories();
  }

  async saveCategory(catData) {
    if (!catData.name) {
      throw new BadRequestError('Category name is required.');
    }
    const sanitized = sanitizer.sanitizeObject(catData);
    return dataRepo.saveCategory(sanitized);
  }

  async deleteCategory(id) {
    return dataRepo.deleteCategory(id);
  }

  // --- QR Code Generator ---
  async generateCleanQrCode(rawText) {
    let text = (rawText || '').trim();
    if (text.includes('\\')) text = text.replace(/\\/g, '/');
    if (text.includes('data=')) {
      try {
        const parsedUrl = new URL(text);
        if (parsedUrl.searchParams.get('data')) {
          text = parsedUrl.searchParams.get('data');
        }
      } catch (e) {}
    }
    if (!text.startsWith('http://') && !text.startsWith('https://')) {
      text = 'https://' + text;
    }

    const qrDataUrl = await QRCode.toDataURL(text, {
      width: 300,
      margin: 2,
      errorCorrectionLevel: 'M'
    });

    return { qrUrl: qrDataUrl, cleanLink: text };
  }
}

module.exports = new ContentService();
