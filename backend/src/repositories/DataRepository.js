const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const config = require('../config/config');
const { logger } = require('../utils/helpers');

// Lazy-load Prisma if installed & configured
let prisma = null;
try {
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient();
} catch (e) {
  logger.warn('Prisma client not loaded, using high-performance local persistent store.');
}

/**
 * Enterprise Data Repository
 * Handles persistent atomic read/writes, transaction-like safety, and fallback storage
 */
class DataRepository {
  constructor() {
    this.storePath = config.database.localStorePath;
    this.ensureStoreExists();
  }

  /**
   * Guarantees storage directory and default seed file exist
   */
  ensureStoreExists() {
    const dir = path.dirname(this.storePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(this.storePath)) {
      const initialData = {
        settings: {
          id: 1,
          candidateName: "Kunal Tilak",
          designation: "MEMBER OF LEGISLATIVE ASSEMBLY",
          constituency: "Kasba Peth Constituency, Pune",
          partyName: "Bharatiya Janata Party",
          bjpLogo: "/_next/static/media/BJP-logo.e6dbeb2f.png",
          candidateLogo: "/_next/static/media/colorLogo.54e4cb38.png",
          votesCount: "3.31 LAKH VOTES",
          votesDescription: "Elected with immense support and trust from the citizens of Kasba Peth",
          shortBio: "Kunal Tilak serves as a dedicated leader and voice for youth, committing to social transformation, urban development, and constituent empowerment.",
          contactEmail: "office@kunaltilak.in",
          contactPhone: "+91 98765 43210",
          officeAddress: "Office of Kunal Tilak, Kasba Peth, Pune, Maharashtra",
          whatsappChannel: "https://whatsapp.com/channel/0029Va5tflV002TDPDgwyi3D",
          whatsappQrCode: "/_next/static/media/url-qr-code.7bed1177.png",
          instagramUrl: "https://instagram.com",
          facebookUrl: "https://facebook.com",
          youtubeUrl: "https://youtube.com",
          linkedinUrl: "https://linkedin.com",
          twitterUrl: "https://twitter.com",
          subpageHeaderBanner: "/assets/images/aboutDetailBanner.png",
          parliamentPageTitle: "Policy & Parliamentary Work of Kunal Tilak",
          parliamentIntroText: "Kunal Tilak has been a proactive and dedicated representative in the Assembly:",
          parliamentAttendance: "92%",
          parliamentDebates: "35",
          parliamentQuestions: "290",
          parliamentZeroHour: "12",
          projectsPageTitle: "Constituency Projects & Development in Kasba Peth",
          projectsIntroText: "Key infrastructure, healthcare, education, and accessibility projects launched in Kasba Peth:",
          blogPageTitle: "Blog, Press Releases & Media Coverage",
          blogIntroText: "Stay updated with the latest news, speeches, and initiatives from the Office of Kunal Tilak:",
          keyHighlightsHeading: "Nurturing Civilizational Roots, Building Modern Infrastructure, Empowering the Needy, Shaping Ideas for the Future",
          keyHighlightsImage: "/_next/static/media/keyHighLights1.56ca94e0.png",
          meetKunalSectionTitle: "Meet Kunal",
          meetKunalImage: "/_next/static/media/meet-kunal.81e03335.png",
          initiativesSectionTitle: "EXPLORE VARIOUS INITIATIVES BY KUNAL TILAK",
          initiativesSectionDesc: "Kunal has introduced a range of schemes, catering to diverse needs in education, healthcare and infrastructure in Kasba Peth.",
          bjymSectionTitle: "Bharatiya Janata Yuva Morcha",
          bjymMainDesc: "Kunal Tilak actively organizes youth welfare programs, employment drives, and leadership training camps to groom the next generation of public leaders.",
          bjymMainImage: "/_next/static/media/bjymTS.d44621e8.png",
          bjymCard1Title: "Youth Leadership Summits",
          bjymCard1Desc: "Organizing state-level youth conferences promoting entrepreneurship, public service, and civil service awareness.",
          bjymCard2Title: "Citizen Assistance & Teleconsultation",
          bjymCard2Desc: "Setting up citizen assistance helplines providing free medical and social support during critical times.",
          bjymCard3Title: "Karyakarta Skill Training",
          bjymCard3Desc: "Developing skill development workshops and digital learning modules for grassroots volunteers."
        },
        hero: {
          id: 1,
          headline: "Kunal Tilak: Voice for Yuva & Progressive Governance",
          subheadline: "Grassroots Dedication, Visionary Development, Constituent Welfare",
          heroBio: "Kunal Tilak serves as the dedicated leader for Kasba Peth, Pune, committing to youth empowerment, urban development, and social welfare.",
          heroPortrait: "/_next/static/media/bannerTS-removebg.75334595.png",
          heroBackground: "/_next/static/media/bannerBg.0a25a5ba.png",
          reportCardPdf: "/assets/downloads/5years-report-card.pdf",
          reportCardTitle: "5 Years Report Card"
        },
        keyHighlights: [],
        meetKunal: [],
        initiatives: [],
        parliamentItems: [],
        sectorInitiatives: [],
        constituencyProjects: [],
        organization: {
          sectionTitle: "Bharatiya Janata Yuva Morcha",
          mainHeadline: "Voice of Youth across Maharashtra & Bharat",
          mainDesc: "Kunal Tilak actively organizes youth welfare programs, employment drives, and leadership training camps.",
          mainImage: "/_next/static/media/bjymTS.d44621e8.png",
          card1Title: "Youth Leadership Summits",
          card1Desc: "Organizing state-level youth conferences promoting entrepreneurship, public service, and civil service awareness.",
          card2Title: "Citizen Assistance Helpline",
          card2Desc: "Setting up citizen assistance helplines providing free medical and social support.",
          card3Title: "Karyakarta Skill Training",
          card3Desc: "Developing skill development workshops for grassroots volunteers."
        },
        blogs: [],
        gallery: [],
        messages: [],
        adminUsers: [
          {
            id: 1,
            username: "admin",
            passwordHash: bcrypt.hashSync("admin123", 10),
            name: "Kunal Tilak Admin",
            role: "SUPER_ADMIN"
          }
        ]
      };
      this.writeStore(initialData);
    }
  }

  /**
   * Helper to safely extract ID and clean item payload so ID is never clobbered
   */
  _extractIdAndClean(item) {
    const clean = { ...item };
    const rawId = clean.id;
    delete clean.id;
    const hasId = rawId !== undefined && rawId !== null && String(rawId).trim() !== '';
    const numericId = hasId ? (Number(rawId) || rawId) : null;
    return { clean, hasId, targetId: numericId };
  }

  /**
   * Thread-safe synchronous store read with automatic ID normalization
   */
  readStore() {
    try {
      const data = fs.readFileSync(this.storePath, 'utf8');
      const store = JSON.parse(data);
      let needsSave = false;
      const arrayKeys = [
        'keyHighlights', 'meetKunal', 'initiatives', 'initiativePillars',
        'parliamentItems', 'sectorInitiatives', 'constituencyProjects',
        'blogs', 'gallery', 'messages', 'reportCards', 'categories'
      ];
      for (const key of arrayKeys) {
        if (Array.isArray(store[key])) {
          let maxId = store[key].reduce((max, item) => {
            const num = Number(item && item.id);
            return (!isNaN(num) && num > max) ? num : max;
          }, 0);
          for (let i = 0; i < store[key].length; i++) {
            const item = store[key][i];
            if (!item) continue;
            if (item.id === '' || item.id === null || item.id === undefined) {
              maxId++;
              item.id = maxId;
              needsSave = true;
            } else if (typeof item.id === 'string' && !isNaN(Number(item.id)) && item.id.trim() !== '') {
              item.id = Number(item.id);
              needsSave = true;
            }
          }
        }
      }
      if (needsSave) {
        this.writeStore(store);
      }
      return store;
    } catch (err) {
      logger.error(`Failed to read data store: ${err.message}`);
      return {};
    }
  }

  /**
   * Atomic synchronous store write with temporary swap file
   */
  writeStore(data) {
    const tempPath = `${this.storePath}.tmp_${Date.now()}`;
    try {
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
      fs.renameSync(tempPath, this.storePath);
      return true;
    } catch (err) {
      if (fs.existsSync(tempPath)) {
        try { fs.unlinkSync(tempPath); } catch (e) {}
      }
      logger.error(`Failed to atomic write store: ${err.message}`);
      throw err;
    }
  }

  // --- Aggregate Queries ---

  isStorageHealthy() {
    try {
      if (!fs.existsSync(this.storePath)) {
        return false;
      }
      fs.accessSync(this.storePath, fs.constants.R_OK | fs.constants.W_OK);
      return true;
    } catch (e) {
      return false;
    }
  }

  getFullContent() {
    return this.readStore();
  }

  // --- Settings ---

  getSettings() {
    const store = this.readStore();
    return store.settings || {};
  }

  updateSettings(newSettings) {
    const store = this.readStore();
    store.settings = { ...store.settings, ...newSettings };
    this.writeStore(store);
    return store.settings;
  }

  // --- Hero Section ---

  getHero() {
    const store = this.readStore();
    return store.hero || {};
  }

  updateHero(newHero) {
    const store = this.readStore();
    store.hero = { ...store.hero, ...newHero };
    this.writeStore(store);
    return store.hero;
  }

  // --- Organization / BJYM ---

  getOrganization() {
    const store = this.readStore();
    return store.organization || {};
  }

  updateOrganization(newOrg) {
    const store = this.readStore();
    store.organization = { ...store.organization, ...newOrg };
    this.writeStore(store);
    return store.organization;
  }

  // --- Main Initiatives ---

  getInitiatives() {
    const store = this.readStore();
    return store.initiatives || [];
  }

  saveInitiative(item) {
    const store = this.readStore();
    store.initiatives = store.initiatives || [];
    const { clean, hasId, targetId } = this._extractIdAndClean(item);

    if (hasId) {
      const idx = store.initiatives.findIndex(i => String(i.id) === String(targetId));
      if (idx !== -1) {
        store.initiatives[idx] = { ...store.initiatives[idx], ...clean, id: targetId };
      } else {
        store.initiatives.push({ ...clean, id: targetId });
      }
    } else {
      const newId = store.initiatives.length ? Math.max(...store.initiatives.map(i => Number(i.id) || 0)) + 1 : 1;
      store.initiatives.push({ createdAt: new Date().toISOString(), ...clean, id: newId });
    }
    this.writeStore(store);
    return store.initiatives;
  }

  deleteInitiative(id) {
    const store = this.readStore();
    store.initiatives = (store.initiatives || []).filter(i => String(i.id) !== String(id));
    this.writeStore(store);
    return true;
  }

  // --- Initiative Pillars (The 8 Primary Sectors: Education, Health, Transport, Sports, etc.) ---

  getInitiativePillars() {
    const store = this.readStore();
    return store.initiativePillars || [];
  }

  saveInitiativePillar(item) {
    const store = this.readStore();
    store.initiativePillars = store.initiativePillars || [];
    const { clean, hasId, targetId } = this._extractIdAndClean(item);

    if (hasId) {
      const idx = store.initiativePillars.findIndex(p => String(p.id) === String(targetId));
      if (idx !== -1) {
        store.initiativePillars[idx] = { ...store.initiativePillars[idx], ...clean, id: targetId };
      } else {
        store.initiativePillars.push({ ...clean, id: targetId });
      }
    } else {
      const newId = store.initiativePillars.length ? Math.max(...store.initiativePillars.map(p => Number(p.id) || 0)) + 1 : 1;
      store.initiativePillars.push({ ...clean, id: newId });
    }
    this.writeStore(store);
    return store.initiativePillars;
  }

  deleteInitiativePillar(id) {
    const store = this.readStore();
    store.initiativePillars = (store.initiativePillars || []).filter(p => String(p.id) !== String(id));
    this.writeStore(store);
    return true;
  }

  // --- Key Highlights ---

  getKeyHighlights() {
    const store = this.readStore();
    return store.keyHighlights || [];
  }

  saveKeyHighlight(item) {
    const store = this.readStore();
    store.keyHighlights = store.keyHighlights || [];
    const { clean, hasId, targetId } = this._extractIdAndClean(item);

    if (hasId) {
      const idx = store.keyHighlights.findIndex(k => String(k.id) === String(targetId));
      if (idx !== -1) {
        store.keyHighlights[idx] = { ...store.keyHighlights[idx], ...clean, id: targetId };
      } else {
        store.keyHighlights.push({ ...clean, id: targetId });
      }
    } else {
      const newId = store.keyHighlights.length ? Math.max(...store.keyHighlights.map(k => Number(k.id) || 0)) + 1 : 1;
      store.keyHighlights.push({ ...clean, id: newId });
    }
    this.writeStore(store);
    return store.keyHighlights;
  }

  deleteKeyHighlight(id) {
    const store = this.readStore();
    store.keyHighlights = (store.keyHighlights || []).filter(k => String(k.id) !== String(id));
    this.writeStore(store);
    return true;
  }

  // --- Meet Kunal Slides ---

  getMeetKunal() {
    const store = this.readStore();
    return store.meetKunal || [];
  }

  saveMeetKunalSlide(item) {
    const store = this.readStore();
    store.meetKunal = store.meetKunal || [];
    const { clean, hasId, targetId } = this._extractIdAndClean(item);

    if (hasId) {
      const idx = store.meetKunal.findIndex(m => String(m.id) === String(targetId));
      if (idx !== -1) {
        store.meetKunal[idx] = { ...store.meetKunal[idx], ...clean, id: targetId };
      } else {
        store.meetKunal.push({ ...clean, id: targetId });
      }
    } else {
      const newId = store.meetKunal.length ? Math.max(...store.meetKunal.map(m => Number(m.id) || 0)) + 1 : 1;
      store.meetKunal.push({ ...clean, id: newId });
    }
    this.writeStore(store);
    return store.meetKunal;
  }

  deleteMeetKunalSlide(id) {
    const store = this.readStore();
    store.meetKunal = (store.meetKunal || []).filter(m => String(m.id) !== String(id));
    this.writeStore(store);
    return true;
  }

  // --- Parliament Items ---

  getParliamentItems() {
    const store = this.readStore();
    return store.parliamentItems || [];
  }

  saveParliamentItem(item) {
    const store = this.readStore();
    store.parliamentItems = store.parliamentItems || [];
    const { clean, hasId, targetId } = this._extractIdAndClean(item);

    if (hasId) {
      const idx = store.parliamentItems.findIndex(p => String(p.id) === String(targetId));
      if (idx !== -1) {
        store.parliamentItems[idx] = { ...store.parliamentItems[idx], ...clean, id: targetId };
      } else {
        store.parliamentItems.push({ ...clean, id: targetId });
      }
    } else {
      const newId = store.parliamentItems.length ? Math.max(...store.parliamentItems.map(p => Number(p.id) || 0)) + 1 : 1;
      store.parliamentItems.push({ ...clean, id: newId });
    }
    this.writeStore(store);
    return store.parliamentItems;
  }

  deleteParliamentItem(id) {
    const store = this.readStore();
    store.parliamentItems = (store.parliamentItems || []).filter(p => String(p.id) !== String(id));
    this.writeStore(store);
    return true;
  }

  // --- Sector Initiatives ---

  getSectorItems(sector = null) {
    const store = this.readStore();
    const items = store.sectorInitiatives || [];
    return sector ? items.filter(i => i.sector === sector) : items;
  }

  saveSectorItem(item) {
    const store = this.readStore();
    store.sectorInitiatives = store.sectorInitiatives || [];
    const { clean, hasId, targetId } = this._extractIdAndClean(item);

    if (hasId) {
      const idx = store.sectorInitiatives.findIndex(s => String(s.id) === String(targetId));
      if (idx !== -1) {
        store.sectorInitiatives[idx] = { ...store.sectorInitiatives[idx], ...clean, id: targetId };
      } else {
        store.sectorInitiatives.push({ ...clean, id: targetId });
      }
    } else {
      const newId = store.sectorInitiatives.length ? Math.max(...store.sectorInitiatives.map(s => Number(s.id) || 0)) + 1 : 1;
      store.sectorInitiatives.push({ ...clean, id: newId });
    }
    this.writeStore(store);
    return store.sectorInitiatives;
  }

  deleteSectorItem(id) {
    const store = this.readStore();
    store.sectorInitiatives = (store.sectorInitiatives || []).filter(s => String(s.id) !== String(id));
    this.writeStore(store);
    return true;
  }

  // --- Constituency Projects ---

  getConstituencyProjects() {
    const store = this.readStore();
    return store.constituencyProjects || [];
  }

  saveConstituencyProject(item) {
    const store = this.readStore();
    store.constituencyProjects = store.constituencyProjects || [];
    const { clean, hasId, targetId } = this._extractIdAndClean(item);

    if (hasId) {
      const idx = store.constituencyProjects.findIndex(c => String(c.id) === String(targetId));
      if (idx !== -1) {
        store.constituencyProjects[idx] = { ...store.constituencyProjects[idx], ...clean, id: targetId };
      } else {
        store.constituencyProjects.push({ ...clean, id: targetId });
      }
    } else {
      const newId = store.constituencyProjects.length ? Math.max(...store.constituencyProjects.map(c => Number(c.id) || 0)) + 1 : 1;
      store.constituencyProjects.push({ ...clean, id: newId });
    }
    this.writeStore(store);
    return store.constituencyProjects;
  }

  deleteConstituencyProject(id) {
    const store = this.readStore();
    store.constituencyProjects = (store.constituencyProjects || []).filter(c => String(c.id) !== String(id));
    this.writeStore(store);
    return true;
  }

  // --- Blogs ---

  getBlogs() {
    const store = this.readStore();
    return store.blogs || [];
  }

  saveBlogPost(post) {
    const store = this.readStore();
    store.blogs = store.blogs || [];
    const { clean, hasId, targetId } = this._extractIdAndClean(post);

    if (hasId) {
      const idx = store.blogs.findIndex(b => String(b.id) === String(targetId));
      if (idx !== -1) {
        store.blogs[idx] = { ...store.blogs[idx], ...clean, id: targetId };
      } else {
        store.blogs.push({ ...clean, id: targetId });
      }
    } else {
      const newId = store.blogs.length ? Math.max(...store.blogs.map(b => Number(b.id) || 0)) + 1 : 1;
      const slug = clean.slug || (clean.title ? clean.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 'post');
      store.blogs.unshift({
        slug,
        isPublished: true,
        publishedAt: new Date().toISOString(),
        ...clean,
        id: newId
      });
    }
    this.writeStore(store);
    return store.blogs;
  }

  deleteBlogPost(id) {
    const store = this.readStore();
    store.blogs = (store.blogs || []).filter(b => String(b.id) !== String(id));
    this.writeStore(store);
    return true;
  }

  // --- Gallery ---

  getGallery() {
    const store = this.readStore();
    return store.gallery || [];
  }

  saveGalleryItem(item) {
    const store = this.readStore();
    store.gallery = store.gallery || [];
    const { clean, hasId, targetId } = this._extractIdAndClean(item);

    if (hasId) {
      const idx = store.gallery.findIndex(g => String(g.id) === String(targetId));
      if (idx !== -1) {
        store.gallery[idx] = { ...store.gallery[idx], ...clean, id: targetId };
      } else {
        store.gallery.push({ ...clean, id: targetId });
      }
    } else {
      const newId = store.gallery.length ? Math.max(...store.gallery.map(g => Number(g.id) || 0)) + 1 : 1;
      store.gallery.push({ ...clean, id: newId });
    }
    this.writeStore(store);
    return store.gallery;
  }

  deleteGalleryItem(id) {
    const store = this.readStore();
    store.gallery = (store.gallery || []).filter(g => String(g.id) !== String(id));
    this.writeStore(store);
    return true;
  }

  // --- Contact Messages ---

  getContactMessages() {
    const store = this.readStore();
    return store.messages || [];
  }

  saveContactMessage(message) {
    const store = this.readStore();
    store.messages = store.messages || [];
    const newId = store.messages.length ? Math.max(...store.messages.map(m => Number(m.id) || 0)) + 1 : 1;
    const newMsg = {
      id: newId,
      name: message.name,
      email: message.email || '',
      phone: message.phone || '',
      subject: message.subject || 'General Inquiry',
      message: message.message,
      createdAt: new Date().toISOString()
    };
    store.messages.unshift(newMsg);
    this.writeStore(store);
    return newMsg;
  }

  deleteContactMessage(id) {
    const store = this.readStore();
    store.messages = (store.messages || []).filter(m => String(m.id) !== String(id));
    this.writeStore(store);
    return true;
  }

  // --- Report Cards ---

  getReportCards() {
    const store = this.readStore();
    return store.reportCards || [];
  }

  saveReportCard(card) {
    const store = this.readStore();
    store.reportCards = store.reportCards || [];
    const { clean, hasId, targetId } = this._extractIdAndClean(card);

    if (hasId) {
      const idx = store.reportCards.findIndex(c => String(c.id) === String(targetId));
      if (idx !== -1) {
        store.reportCards[idx] = { ...store.reportCards[idx], ...clean, id: targetId };
      } else {
        store.reportCards.push({ ...clean, id: targetId });
      }
    } else {
      const newId = store.reportCards.length ? Math.max(...store.reportCards.map(c => Number(c.id) || 0)) + 1 : 1;
      store.reportCards.push({ ...clean, id: newId });
    }
    this.writeStore(store);
    return store.reportCards;
  }

  deleteReportCard(id) {
    const store = this.readStore();
    store.reportCards = (store.reportCards || []).filter(c => String(c.id) !== String(id));
    this.writeStore(store);
    return true;
  }

  // --- Categories ---

  getCategories() {
    const store = this.readStore();
    if (!store.categories || !store.categories.length) {
      const defaultCategories = [
        { id: 1, name: "Education" },
        { id: 2, name: "Health" },
        { id: 3, name: "Infrastructure - Transport & Mobility" },
        { id: 4, name: "Labour" },
        { id: 5, name: "Sports" },
        { id: 6, name: "Policy and Parliamentary work" },
        { id: 7, name: "Constituency Projects" },
        { id: 8, name: "Security" },
        { id: 9, name: "Press Coverage" }
      ];
      store.categories = defaultCategories;
      this.writeStore(store);
    }
    return store.categories;
  }

  saveCategory(cat) {
    const store = this.readStore();
    store.categories = store.categories || [];
    const { clean, hasId, targetId } = this._extractIdAndClean(cat);

    if (hasId) {
      const idx = store.categories.findIndex(c => String(c.id) === String(targetId));
      if (idx !== -1) {
        store.categories[idx] = { ...store.categories[idx], name: clean.name, id: targetId };
      } else {
        store.categories.push({ name: clean.name, id: targetId });
      }
    } else {
      const newId = store.categories.length ? Math.max(...store.categories.map(c => Number(c.id) || 0)) + 1 : 1;
      store.categories.push({ name: clean.name, id: newId });
    }
    this.writeStore(store);
    return store.categories;
  }

  deleteCategory(id) {
    const store = this.readStore();
    store.categories = (store.categories || []).filter(c => String(c.id) !== String(id));
    this.writeStore(store);
    return true;
  }

  // --- Admin Authentication ---

  authenticateAdmin(username, password) {
    const store = this.readStore();
    const admin = (store.adminUsers || []).find(u => u.username === username);
    if (!admin) return null;

    const isMatch = bcrypt.compareSync(password, admin.passwordHash);
    if (!isMatch) return null;

    const { passwordHash, ...safeAdmin } = admin;
    return safeAdmin;
  }

  getAdminById(id) {
    const store = this.readStore();
    const admin = (store.adminUsers || []).find(u => u.id === Number(id));
    if (!admin) return null;
    const { passwordHash, ...safeAdmin } = admin;
    return safeAdmin;
  }

  changeAdminPassword(adminId, currentPassword, newPassword) {
    const store = this.readStore();
    store.adminUsers = store.adminUsers || [];
    const admin = store.adminUsers.find(u => u.id === Number(adminId));
    if (!admin) {
      throw new Error('Admin user not found.');
    }

    const isMatch = bcrypt.compareSync(currentPassword, admin.passwordHash);
    if (!isMatch) {
      throw new Error('Incorrect current password.');
    }

    if (!newPassword || newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long.');
    }
    if (!/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword)) {
      throw new Error('New password must contain at least one number or special character.');
    }

    admin.passwordHash = bcrypt.hashSync(newPassword, 10);
    this.writeStore(store);
    return true;
  }

  isDefaultPasswordActive(adminId) {
    const store = this.readStore();
    const admin = (store.adminUsers || []).find(u => u.id === Number(adminId));
    if (!admin) return false;
    return bcrypt.compareSync('admin123', admin.passwordHash);
  }
}

module.exports = new DataRepository();
