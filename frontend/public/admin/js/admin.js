/**
 * Enterprise Admin Application Coordinator
 * Connects AdminService with AdminUIManager and manages event delegation
 */

function loadAdminScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    if (!window.adminService) await loadAdminScript('js/admin.service.js');
    if (!window.adminUI) await loadAdminScript('js/admin.ui.js');
    await initializeAdminApp();
  } catch (err) {
    console.error('Failed to initialize admin app:', err);
  }
});

async function initializeAdminApp() {
  window.adminUI.setupTabNavigation();
  window.adminUI.setupUploadHandlers();
  setupAuthHandlers();
  setupFormSubmissions();
  setupTableEventDelegation();
  setupQrGenerator();

  // Check login state
  const authRes = await window.adminService.checkAuth();
  if (authRes.success && authRes.data && authRes.data.admin) {
    window.adminUI.showAdminApp(authRes.data.admin);
    await refreshAdminData();
  } else {
    window.adminUI.showLoginScreen();
  }
}

async function refreshAdminData() {
  const res = await window.adminService.getContent();
  if (res.success && res.data) {
    window.adminUI.populateForms(res.data);
    window.adminUI.populateTables(res.data);

    // Update stats
    const setStat = (id, count) => {
      const el = document.getElementById(id);
      if (el) el.innerText = count;
    };
    setStat('statInitiatives', res.data.initiatives ? res.data.initiatives.length : 0);
    setStat('statBlogs', res.data.blogs ? res.data.blogs.length : 0);
    setStat('statGallery', res.data.gallery ? res.data.gallery.length : 0);
  }

  // Load Contact Messages
  const msgRes = await window.adminService.getMessages();
  if (msgRes.success && msgRes.data) {
    const el = document.getElementById('statMessages');
    if (el) el.innerText = msgRes.data.length;
    window.adminUI.renderMessagesTable(msgRes.data);
  }

  // Load Categories
  const catRes = await window.adminService.getCategories();
  if (catRes.success && catRes.data) {
    window.adminUI.currentCategories = catRes.data;
    window.adminUI.populateCategoryDropdowns(catRes.data);
    window.adminUI.renderCategoriesTable(catRes.data);
  }

  // Check Security Status (Default Password Active Alert)
  try {
    const secRes = await window.adminService.getSecurityStatus();
    const banner = document.getElementById('securityAlertBanner');
    if (banner) {
      if (secRes.success && secRes.data && secRes.data.isDefaultPassword) {
        banner.style.display = 'flex';
      } else {
        banner.style.display = 'none';
      }
    }
  } catch (err) {
    console.warn('Could not fetch security status:', err);
  }
}

// 1. Auth & Security Handlers
function setupAuthHandlers() {
  const loginForm = document.getElementById('adminLoginForm') || document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = window.adminUI.getVal('loginUsername');
      const password = window.adminUI.getVal('loginPassword');

      const submitBtn = loginForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      const res = await window.adminService.login(username, password);
      if (submitBtn) submitBtn.disabled = false;

      if (res.success && res.data && res.data.admin) {
        window.adminUI.showAdminApp(res.data.admin);
        await refreshAdminData();
      } else {
        alert(res.message || 'Invalid username or password.');
      }
    });
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await window.adminService.logout();
      window.adminUI.showLoginScreen();
    });
  }

  // Change Password Modal Controls
  const pwdModal = document.getElementById('changePasswordModal');
  const openPwdBtn = document.getElementById('btnOpenChangePassword');
  const bannerPwdBtn = document.getElementById('btnBannerChangePassword');
  const closePwdBtn = document.getElementById('btnCloseChangePasswordModal');
  const cancelPwdBtn = document.getElementById('btnCancelChangePassword');
  const pwdForm = document.getElementById('changePasswordForm');

  const openModal = () => {
    if (pwdModal) pwdModal.style.display = 'flex';
    if (pwdForm) pwdForm.reset();
  };

  const closeModal = () => {
    if (pwdModal) pwdModal.style.display = 'none';
  };

  if (openPwdBtn) openPwdBtn.addEventListener('click', openModal);
  if (bannerPwdBtn) bannerPwdBtn.addEventListener('click', openModal);
  if (closePwdBtn) closePwdBtn.addEventListener('click', closeModal);
  if (cancelPwdBtn) cancelPwdBtn.addEventListener('click', closeModal);

  if (pwdModal) {
    pwdModal.addEventListener('click', (e) => {
      if (e.target === pwdModal) closeModal();
    });
  }

  if (pwdForm) {
    pwdForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const currentPassword = window.adminUI.getVal('currentAdminPassword');
      const newPassword = window.adminUI.getVal('newAdminPassword');
      const confirmPassword = window.adminUI.getVal('confirmAdminPassword');

      if (newPassword !== confirmPassword) {
        alert('New passwords do not match. Please verify and try again.');
        return;
      }

      if (newPassword.length < 8) {
        alert('New password must be at least 8 characters long.');
        return;
      }

      const res = await window.adminService.changePassword(currentPassword, newPassword);
      if (res.success) {
        alert('Password changed successfully! Please keep your new password safe.');
        closeModal();
        pwdForm.reset();
        await refreshAdminData();
      } else {
        alert(res.message || 'Error updating password.');
      }
    });
  }
}

// 2. Settings & Entity Form Submissions
function setupFormSubmissions() {
  // Visibility Form
  const saveVisHandler = async () => {
    const sectionVisibility = {
      hero: window.adminUI.getCheckbox('visHero'),
      keyHighlights: window.adminUI.getCheckbox('visKeyHighlights'),
      meetKunal: window.adminUI.getCheckbox('visMeetKunal'),
      initiatives: window.adminUI.getCheckbox('visInitiatives'),
      bjym: window.adminUI.getCheckbox('visBjym'),
      gallery: window.adminUI.getCheckbox('visGallery'),
      sectorLinks: window.adminUI.getCheckbox('visSectorLinks'),
      reportCard: window.adminUI.getCheckbox('visReportCard'),
      contact: window.adminUI.getCheckbox('visContact'),
      footer: window.adminUI.getCheckbox('visFooter')
    };

    const res = await window.adminService.updateSettings({ sectionVisibility });
    if (res.success) {
      alert('Section visibility updated! Deactivated sections are now hidden on the live website.');
      await refreshAdminData();
    } else {
      alert(res.message || 'Failed to update section visibility');
    }
  };

  const btnSaveVis = document.getElementById('btnSaveVisibility');
  if (btnSaveVis) btnSaveVis.addEventListener('click', saveVisHandler);

  const visForm = document.getElementById('visibilityForm');
  if (visForm) visForm.addEventListener('submit', (e) => { e.preventDefault(); saveVisHandler(); });

  // Settings Form
  const settingsForm = document.getElementById('settingsForm');
  if (settingsForm) {
    settingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        candidateName: window.adminUI.getVal('settingCandidateName'),
        designation: window.adminUI.getVal('settingDesignation'),
        constituency: window.adminUI.getVal('settingConstituency'),
        votesCount: window.adminUI.getVal('settingVotesCount'),
        votesDescription: window.adminUI.getVal('settingVotesDescription'),
        shortBio: window.adminUI.getVal('settingShortBio'),
        contactEmail: window.adminUI.getVal('settingContactEmail'),
        contactPhone: window.adminUI.getVal('settingContactPhone'),
        officeAddress: window.adminUI.getVal('settingOfficeAddress'),
        whatsappChannel: window.adminUI.getVal('settingWhatsappChannel'),
        bjpLogo: window.adminUI.getVal('settingBjpLogoPath'),
        candidateLogo: window.adminUI.getVal('settingCandLogoPath'),
        whatsappQrCode: window.adminUI.getVal('settingWhatsappQrPath'),
        subpageHeaderBanner: window.adminUI.getVal('settingSubpageBannerPath'),
        instagramUrl: window.adminUI.getVal('settingInstagramUrl'),
        facebookUrl: window.adminUI.getVal('settingFacebookUrl'),
        youtubeUrl: window.adminUI.getVal('settingYoutubeUrl'),
        linkedinUrl: window.adminUI.getVal('settingLinkedinUrl'),
        twitterUrl: window.adminUI.getVal('settingTwitterUrl')
      };

      const res = await window.adminService.updateSettings(payload);
      if (res.success) {
        alert('Header & Branding settings updated successfully!');
        await refreshAdminData();
      } else {
        alert(res.message || 'Failed to update settings');
      }
    });
  }

  // Hero Form
  const heroForm = document.getElementById('heroForm');
  if (heroForm) {
    heroForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        headline: window.adminUI.getVal('heroHeadlineInput'),
        subheadline: window.adminUI.getVal('heroSubheadlineInput'),
        heroBio: window.adminUI.getVal('heroBioInput'),
        heroPortrait: window.adminUI.getVal('heroPortraitPath'),
        heroBackground: window.adminUI.getVal('heroBgPath'),
        reportCardPdf: window.adminUI.getVal('reportCardPdfPath')
      };

      const res = await window.adminService.updateHero(payload);
      if (res.success) {
        alert('Hero banner saved successfully!');
        await refreshAdminData();
      } else {
        alert(res.message || 'Failed to update hero section');
      }
    });
  }

  // Highlights Section Header Form
  const hlSecForm = document.getElementById('highlightSectionForm');
  if (hlSecForm) {
    hlSecForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        keyHighlightsHeading: window.adminUI.getVal('hlSectionHeadingInput'),
        keyHighlightsImage: window.adminUI.getVal('hlSectionImgPath')
      };
      const res = await window.adminService.updateSettings(payload);
      if (res.success) {
        alert('Key Highlights Section header updated!');
        await refreshAdminData();
      } else {
        alert(res.message || 'Error saving highlights section header');
      }
    });
  }

  // Highlights Card Form
  const hlForm = document.getElementById('highlightForm');
  if (hlForm) {
    hlForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        id: window.adminUI.getVal('highlightId'),
        title: window.adminUI.getVal('highlightTitle'),
        issue: window.adminUI.getVal('highlightIssue'),
        description: window.adminUI.getVal('highlightDesc'),
        donateUrl: window.adminUI.getVal('highlightDonateUrl')
      };
      const res = await window.adminService.saveKeyHighlight(payload);
      if (res.success) {
        alert('Highlight card saved!');
        hlForm.reset();
        window.adminUI.setVal('highlightId', '');
        await refreshAdminData();
      } else {
        alert(res.message || 'Error saving highlight card');
      }
    });
  }

  // Meet Kunal Section Header Form
  const meetSecForm = document.getElementById('meetSectionForm');
  if (meetSecForm) {
    meetSecForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        meetKunalSectionTitle: window.adminUI.getVal('meetSectionTitleInput'),
        meetKunalImage: window.adminUI.getVal('meetLeaderImgPath')
      };
      const res = await window.adminService.updateSettings(payload);
      if (res.success) {
        alert('Meet Kunal section header updated!');
        await refreshAdminData();
      } else {
        alert(res.message || 'Error saving meet section header');
      }
    });
  }

  // Meet Kunal Slide Form
  const meetForm = document.getElementById('meetForm');
  if (meetForm) {
    meetForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        id: window.adminUI.getVal('meetId'),
        title: window.adminUI.getVal('meetTitle'),
        content: window.adminUI.getVal('meetContent')
      };
      const res = await window.adminService.saveMeetKunal(payload);
      if (res.success) {
        alert('Meet slide saved!');
        meetForm.reset();
        window.adminUI.setVal('meetId', '');
        await refreshAdminData();
      } else {
        alert(res.message || 'Error saving meet slide');
      }
    });
  }

  // Initiatives Section Header Form
  const initSecForm = document.getElementById('initiativesSectionForm');
  if (initSecForm) {
    initSecForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        initiativesSectionTitle: window.adminUI.getVal('initSectionTitleInput'),
        initiativesSectionDesc: window.adminUI.getVal('initSectionDescInput')
      };
      const res = await window.adminService.updateSettings(payload);
      if (res.success) {
        alert('Initiatives section header updated!');
        await refreshAdminData();
      } else {
        alert(res.message || 'Error saving initiatives header');
      }
    });
  }

  // Initiative Card Form
  const initForm = document.getElementById('initiativeForm');
  if (initForm) {
    initForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        id: window.adminUI.getVal('initiativeId'),
        title: window.adminUI.getVal('initiativeTitle'),
        shortDesc: window.adminUI.getVal('initiativeShortDesc'),
        fullDesc: window.adminUI.getVal('initiativeFullDesc'),
        image: window.adminUI.getVal('initiativeImagePath')
      };
      const res = await window.adminService.saveInitiative(payload);
      if (res.success) {
        alert('Initiative card saved!');
        initForm.reset();
        window.adminUI.setVal('initiativeId', '');
        window.removeUploadedImage('initiativeImagePath', 'initiativeImagePreview', 'initiativeImageFile');
        await refreshAdminData();
      } else {
        alert(res.message || 'Error saving initiative card');
      }
    });
  }

  // URL helper: auto-generates clean /initiatives/:slug route from Title every time
  function computePillarUrl(title) {
    const t = (title || '').trim().toLowerCase();
    if (!t) return '/initiatives/...';

    // Standard canonical routes for primary sectors
    if (t === 'education' || t.startsWith('edu') || t.includes('school') || t.includes('student')) {
      return '/initiatives/education';
    }
    if (t === 'health' || t.startsWith('health') || t.includes('medic') || t.includes('doctor') || t.includes('hospital')) {
      return '/initiatives/health';
    }
    if (t.includes('infra') || t.includes('transport') || t.includes('mobility')) {
      return '/initiatives/infrastructure-transport-mobility';
    }
    if (t === 'sports' || t.startsWith('sport') || t.includes('game') || t.includes('fit')) {
      return '/initiatives/sports';
    }
    if (t.includes('parliament') || t.includes('policy')) {
      return '/initiatives/policy-and-parliamentary-work';
    }
    if (t.includes('constituency') || t.includes('project')) {
      return '/initiatives/constituency-projects';
    }
    if (t.includes('secur') || t.includes('police')) {
      return '/initiatives/security';
    }
    if (t.includes('labour') || t.includes('labor') || t.includes('worker') || t.includes('gig')) {
      return '/initiatives/labour';
    }

    // Dynamic clean slug for any custom title
    const slug = t.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return `/initiatives/${slug || 'initiative'}`;
  }

  // Primary Sector Initiatives Form
  const pillarForm = document.getElementById('initiativePillarForm');
  const btnCancelPillar = document.getElementById('btnCancelPillar');
  const pillarTitleInput = document.getElementById('pillarTitle');
  const pillarAutoUrlBadge = document.getElementById('pillarAutoUrlBadge');

  if (pillarTitleInput && pillarAutoUrlBadge) {
    pillarTitleInput.addEventListener('input', () => {
      const url = computePillarUrl(pillarTitleInput.value);
      pillarAutoUrlBadge.innerText = url;
      window.adminUI.setVal('pillarLink', url);
    });
  }

  if (pillarForm) {
    pillarForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = window.adminUI.getVal('pillarTitle');
      const targetUrl = computePillarUrl(title);

      const payload = {
        id: window.adminUI.getVal('pillarId'),
        title: title,
        link: targetUrl,
        intro: window.adminUI.getVal('pillarIntro')
      };

      const res = await window.adminService.saveInitiativePillar(payload);
      if (res.success) {
        alert(`Initiative saved successfully! Route: ${targetUrl}`);
        pillarForm.reset();
        window.adminUI.setVal('pillarId', '');
        window.adminUI.setVal('pillarLink', '');
        if (pillarAutoUrlBadge) pillarAutoUrlBadge.innerText = '/initiatives/...';
        if (btnCancelPillar) btnCancelPillar.style.display = 'none';
        await refreshAdminData();
      } else {
        alert(res.message || 'Error saving initiative');
      }
    });
  }

  if (btnCancelPillar) {
    btnCancelPillar.addEventListener('click', () => {
      if (pillarForm) pillarForm.reset();
      window.adminUI.setVal('pillarId', '');
      window.adminUI.setVal('pillarLink', '');
      if (pillarAutoUrlBadge) pillarAutoUrlBadge.innerText = '/initiatives/...';
      btnCancelPillar.style.display = 'none';
    });
  }

  // Organization / BJYM Form
  const orgForm = document.getElementById('orgForm');
  if (orgForm) {
    orgForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        sectionTitle: window.adminUI.getVal('orgSectionTitle'),
        mainDesc: window.adminUI.getVal('orgMainDesc'),
        mainImage: window.adminUI.getVal('orgMainImgPath'),
        card1Title: window.adminUI.getVal('orgCard1Title'),
        card1Desc: window.adminUI.getVal('orgCard1Desc'),
        card2Title: window.adminUI.getVal('orgCard2Title'),
        card2Desc: window.adminUI.getVal('orgCard2Desc'),
        card3Title: window.adminUI.getVal('orgCard3Title'),
        card3Desc: window.adminUI.getVal('orgCard3Desc')
      };

      const res = await window.adminService.updateOrganization(payload);
      if (res.success) {
        alert('BJYM section saved successfully!');
        await refreshAdminData();
      } else {
        alert(res.message || 'Failed to save BJYM section');
      }
    });
  }

  // Blogs Form
  const blogForm = document.getElementById('blogForm');
  if (blogForm) {
    blogForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        id: window.adminUI.getVal('blogId'),
        title: window.adminUI.getVal('blogTitle'),
        category: window.adminUI.getVal('blogCategory'),
        excerpt: window.adminUI.getVal('blogExcerpt'),
        content: window.adminUI.getVal('blogContent'),
        image: window.adminUI.getVal('blogImagePath')
      };

      const res = await window.adminService.saveBlog(payload);
      if (res.success) {
        alert('Blog post published!');
        blogForm.reset();
        window.adminUI.setVal('blogId', '');
        window.removeUploadedImage('blogImagePath', 'blogImagePreview', 'blogImageFile');
        await refreshAdminData();
      } else {
        alert(res.message || 'Error publishing blog post');
      }
    });
  }

  // Gallery Form
  const galleryForm = document.getElementById('galleryForm');
  if (galleryForm) {
    galleryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const type = window.adminUI.getVal('galleryType') || 'image';
      const payload = {
        id: window.adminUI.getVal('galleryId'),
        title: window.adminUI.getVal('galleryTitle'),
        type: type,
        url: type === 'video' ? window.adminUI.getVal('galleryVideoUrl') : window.adminUI.getVal('galleryImagePath')
      };

      const res = await window.adminService.saveGallery(payload);
      if (res.success) {
        alert('Gallery item saved!');
        galleryForm.reset();
        window.adminUI.setVal('galleryId', '');
        window.removeUploadedImage('galleryImagePath', 'galleryImagePreview', 'galleryImageFile');
        await refreshAdminData();
      } else {
        alert(res.message || 'Error saving gallery item');
      }
    });
  }

  // Parliament Settings Form
  const parlSetForm = document.getElementById('parliamentSettingsForm');
  if (parlSetForm) {
    parlSetForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        parliamentPageTitle: window.adminUI.getVal('parliamentPageTitleInput'),
        parliamentIntroText: window.adminUI.getVal('parliamentIntroTextInput'),
        parliamentAttendance: window.adminUI.getVal('parliamentAttendanceInput'),
        parliamentDebates: window.adminUI.getVal('parliamentDebatesInput'),
        parliamentQuestions: window.adminUI.getVal('parliamentQuestionsInput'),
        parliamentZeroHour: window.adminUI.getVal('parliamentZeroHourInput')
      };

      const res = await window.adminService.updateSettings(payload);
      if (res.success) {
        alert('In Parliament settings saved!');
        await refreshAdminData();
      } else {
        alert(res.message || 'Error saving parliament settings');
      }
    });
  }

  // Parliament Item Form
  const parlItemForm = document.getElementById('parliamentItemForm');
  if (parlItemForm) {
    parlItemForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        id: window.adminUI.getVal('parliamentItemId'),
        title: window.adminUI.getVal('parliamentItemTitle'),
        description: window.adminUI.getVal('parliamentItemDesc')
      };

      const res = await window.adminService.saveParliamentItem(payload);
      if (res.success) {
        alert('Parliamentary item saved!');
        parlItemForm.reset();
        window.adminUI.setVal('parliamentItemId', '');
        await refreshAdminData();
      } else {
        alert(res.message || 'Error saving parliament item');
      }
    });
  }

  // Projects Settings Form
  const projSetForm = document.getElementById('projectsSettingsForm');
  if (projSetForm) {
    projSetForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        projectsPageTitle: window.adminUI.getVal('projectsPageTitleInput'),
        projectsIntroText: window.adminUI.getVal('projectsIntroTextInput')
      };

      const res = await window.adminService.updateSettings(payload);
      if (res.success) {
        alert('Projects page settings saved!');
        await refreshAdminData();
      } else {
        alert(res.message || 'Error saving project settings');
      }
    });
  }

  // Project Item Form
  const projForm = document.getElementById('constituencyProjectForm');
  if (projForm) {
    projForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        id: window.adminUI.getVal('constituencyProjectId'),
        title: window.adminUI.getVal('constituencyProjectTitle'),
        category: window.adminUI.getVal('constituencyProjectCategory'),
        description: window.adminUI.getVal('constituencyProjectDesc')
      };

      const res = await window.adminService.saveProject(payload);
      if (res.success) {
        alert('Constituency Project saved!');
        projForm.reset();
        window.adminUI.setVal('constituencyProjectId', '');
        await refreshAdminData();
      } else {
        alert(res.message || 'Error saving project');
      }
    });
  }

  // Sector Initiative Form
  const sectorForm = document.getElementById('sectorInitiativeForm');
  if (sectorForm) {
    sectorForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        id: window.adminUI.getVal('sectorItemId'),
        sector: window.adminUI.getVal('sectorPageSelect'),
        title: window.adminUI.getVal('sectorItemTitle'),
        issue: window.adminUI.getVal('sectorItemIssue'),
        description: window.adminUI.getVal('sectorItemDesc')
      };

      const res = await window.adminService.saveSectorItem(payload);
      if (res.success) {
        alert('Sector initiative saved!');
        sectorForm.reset();
        window.adminUI.setVal('sectorItemId', '');
        await refreshAdminData();
      } else {
        alert(res.message || 'Error saving sector initiative');
      }
    });
  }

  // Report Card Form
  const reportCardForm = document.getElementById('reportCardForm');
  if (reportCardForm) {
    reportCardForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const pdfUrl = window.adminUI.getVal('reportCardPdfUploadPath');
      if (!pdfUrl) {
        alert('Please attach a PDF document first.');
        return;
      }

      const payload = {
        id: window.adminUI.getVal('reportCardId'),
        title: window.adminUI.getVal('reportCardTitle'),
        year: window.adminUI.getVal('reportCardYear'),
        pdfUrl: pdfUrl
      };

      const res = await window.adminService.saveReportCard(payload);
      if (res.success) {
        alert('Report Card PDF saved successfully!');
        reportCardForm.reset();
        window.adminUI.setVal('reportCardId', '');
        window.adminUI.setVal('reportCardPdfUploadPath', '');
        const sEl = document.getElementById('reportCardFileStatus');
        if (sEl) sEl.style.display = 'none';
        await refreshAdminData();
      } else {
        alert(res.message || 'Error saving report card');
      }
    });
  }

  // Category Form
  const categoryForm = document.getElementById('categoryForm');
  if (categoryForm) {
    categoryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        id: window.adminUI.getVal('categoryId'),
        name: window.adminUI.getVal('categoryName')
      };
      const res = await window.adminService.saveCategory(payload);
      if (res.success) {
        alert('Category saved successfully!');
        categoryForm.reset();
        window.adminUI.setVal('categoryId', '');
        const cancelBtn = document.getElementById('btnCancelCategory');
        if (cancelBtn) cancelBtn.style.display = 'none';
        await refreshAdminData();
      } else {
        alert(res.message || 'Error saving category');
      }
    });

    const cancelCatBtn = document.getElementById('btnCancelCategory');
    if (cancelCatBtn) {
      cancelCatBtn.addEventListener('click', () => {
        categoryForm.reset();
        window.adminUI.setVal('categoryId', '');
        cancelCatBtn.style.display = 'none';
      });
    }
  }
}

// 3. Table Event Delegation (Edit & Delete)
function setupTableEventDelegation() {
  document.addEventListener('click', async (e) => {
    const target = e.target;

    // Edit Initiative Pillar (Primary 8 Sectors)
    if (target.classList.contains('editPillarBtn')) {
      const id = target.getAttribute('data-id');
      const item = (window.adminUI.currentData.initiativePillars || []).find(p => String(p.id) === String(id));
      if (item) {
        window.adminUI.setVal('pillarId', item.id);
        window.adminUI.setVal('pillarTitle', item.title);
        window.adminUI.setVal('pillarLink', item.link);
        window.adminUI.setVal('pillarIntro', item.intro || '');
        const badge = document.getElementById('pillarAutoUrlBadge');
        if (badge) badge.innerText = item.link || computePillarUrl(item.title);
        const btnCancel = document.getElementById('btnCancelPillar');
        if (btnCancel) btnCancel.style.display = 'inline-block';
        const form = document.getElementById('initiativePillarForm');
        if (form) form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const titleIn = document.getElementById('pillarTitle');
        if (titleIn) titleIn.focus();
      }
    }

    // Delete Initiative Pillar
    if (target.classList.contains('deletePillarBtn')) {
      const id = target.getAttribute('data-id');
      if (confirm(`Delete initiative pillar #${id}?`)) {
        await window.adminService.deleteInitiativePillar(id);
        await refreshAdminData();
      }
    }

    // Delete Initiative
    if (target.classList.contains('deleteInitiativeBtn')) {
      const id = target.getAttribute('data-id');
      if (confirm(`Delete initiative #${id}?`)) {
        await window.adminService.deleteInitiative(id);
        await refreshAdminData();
      }
    }

    // Edit Initiative
    if (target.classList.contains('editInitiativeBtn')) {
      const id = target.getAttribute('data-id');
      const item = (window.adminUI.currentData.initiatives || []).find(i => String(i.id) === String(id));
      if (item) {
        window.adminUI.setVal('initiativeId', item.id);
        window.adminUI.setVal('initiativeTitle', item.title);
        window.adminUI.setVal('initiativeShortDesc', item.shortDesc);
        window.adminUI.setVal('initiativeFullDesc', item.fullDesc);
        window.adminUI.setVal('initiativeImagePath', item.image);
        window.adminUI.setPreview('initiativeImagePreview', item.image);
        const form = document.getElementById('initiativeForm');
        if (form) form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    // Delete Highlight
    if (target.classList.contains('deleteHighlightBtn')) {
      const id = target.getAttribute('data-id');
      if (confirm(`Delete highlight #${id}?`)) {
        await window.adminService.deleteKeyHighlight(id);
        await refreshAdminData();
      }
    }

    // Edit Highlight
    if (target.classList.contains('editHighlightBtn')) {
      const id = target.getAttribute('data-id');
      const item = (window.adminUI.currentData.keyHighlights || []).find(k => String(k.id) === String(id));
      if (item) {
        window.adminUI.setVal('highlightId', item.id);
        window.adminUI.setVal('highlightTitle', item.title);
        window.adminUI.setVal('highlightIssue', item.issue);
        window.adminUI.setVal('highlightDesc', item.description);
        window.adminUI.setVal('highlightDonateUrl', item.donateUrl);
        const form = document.getElementById('keyHighlightForm');
        if (form) form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    // Delete Meet Kunal
    if (target.classList.contains('deleteMeetBtn')) {
      const id = target.getAttribute('data-id');
      if (confirm(`Delete slide #${id}?`)) {
        await window.adminService.deleteMeetKunal(id);
        await refreshAdminData();
      }
    }

    // Edit Meet Kunal
    if (target.classList.contains('editMeetBtn')) {
      const id = target.getAttribute('data-id');
      const item = (window.adminUI.currentData.meetKunal || []).find(m => String(m.id) === String(id));
      if (item) {
        window.adminUI.setVal('meetId', item.id);
        window.adminUI.setVal('meetTitle', item.title);
        window.adminUI.setVal('meetContent', item.content);
        const form = document.getElementById('meetKunalForm');
        if (form) form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    // Delete Sector Item
    if (target.classList.contains('deleteSectorBtn')) {
      const id = target.getAttribute('data-id');
      if (confirm(`Delete sector initiative #${id}?`)) {
        await window.adminService.deleteSectorItem(id);
        await refreshAdminData();
      }
    }

    // Edit Sector Item
    if (target.classList.contains('editSectorBtn')) {
      const id = target.getAttribute('data-id');
      const item = (window.adminUI.currentData.sectorInitiatives || []).find(s => String(s.id) === String(id));
      if (item) {
        window.adminUI.setVal('sectorItemId', item.id);
        window.adminUI.setVal('sectorPageSelect', item.sector);
        window.adminUI.setVal('sectorItemTitle', item.title);
        window.adminUI.setVal('sectorItemIssue', item.issue || '');
        window.adminUI.setVal('sectorItemDesc', item.description || '');
        const form = document.getElementById('sectorInitiativeForm');
        if (form) form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const titleIn = document.getElementById('sectorItemTitle');
        if (titleIn) titleIn.focus();
      }
    }

    // Delete Parliament Item
    if (target.classList.contains('deleteParlBtn')) {
      const id = target.getAttribute('data-id');
      if (confirm(`Delete parliamentary item #${id}?`)) {
        await window.adminService.deleteParliamentItem(id);
        await refreshAdminData();
      }
    }

    // Edit Parliament Item
    if (target.classList.contains('editParlBtn')) {
      const id = target.getAttribute('data-id');
      const item = (window.adminUI.currentData.parliamentItems || []).find(p => String(p.id) === String(id));
      if (item) {
        window.adminUI.setVal('parliamentItemId', item.id);
        window.adminUI.setVal('parliamentItemTitle', item.title);
        window.adminUI.setVal('parliamentItemDesc', item.description);
        const form = document.getElementById('parliamentItemForm');
        if (form) form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    // Delete Project
    if (target.classList.contains('deleteProjBtn')) {
      const id = target.getAttribute('data-id');
      if (confirm(`Delete project item #${id}?`)) {
        await window.adminService.deleteProject(id);
        await refreshAdminData();
      }
    }

    // Edit Project
    if (target.classList.contains('editProjBtn')) {
      const id = target.getAttribute('data-id');
      const item = (window.adminUI.currentData.constituencyProjects || []).find(c => String(c.id) === String(id));
      if (item) {
        window.adminUI.setVal('constituencyProjectId', item.id);
        window.adminUI.setVal('constituencyProjectTitle', item.title);
        window.adminUI.setVal('constituencyProjectCategory', item.category);
        window.adminUI.setVal('constituencyProjectDesc', item.description);
        const form = document.getElementById('constituencyProjectForm');
        if (form) form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    // Delete Blog
    if (target.classList.contains('deleteBlogBtn')) {
      const id = target.getAttribute('data-id');
      if (confirm(`Delete blog post #${id}?`)) {
        await window.adminService.deleteBlog(id);
        await refreshAdminData();
      }
    }

    // Edit Blog
    if (target.classList.contains('editBlogBtn')) {
      const id = target.getAttribute('data-id');
      const item = (window.adminUI.currentData.blogs || []).find(b => String(b.id) === String(id));
      if (item) {
        window.adminUI.setVal('blogId', item.id);
        window.adminUI.setVal('blogTitle', item.title);
        window.adminUI.setVal('blogCategory', item.category);
        window.adminUI.setVal('blogExcerpt', item.excerpt);
        window.adminUI.setVal('blogContent', item.content);
        window.adminUI.setVal('blogImagePath', item.image || '');
        window.adminUI.setPreview('blogImagePreview', item.image || '');
        const form = document.getElementById('blogForm');
        if (form) form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const titleIn = document.getElementById('blogTitle');
        if (titleIn) titleIn.focus();
      }
    }

    // Delete Gallery
    if (target.classList.contains('deleteGalleryBtn')) {
      const id = target.getAttribute('data-id');
      if (confirm(`Delete gallery item #${id}?`)) {
        await window.adminService.deleteGallery(id);
        await refreshAdminData();
      }
    }

    // Delete Message
    if (target.classList.contains('deleteMsgBtn')) {
      const id = target.getAttribute('data-id');
      if (confirm(`Delete message #${id}?`)) {
        await window.adminService.deleteMessage(id);
        await refreshAdminData();
      }
    }

    // Delete Report Card
    if (target.classList.contains('deleteReportCardBtn')) {
      const id = target.getAttribute('data-id');
      if (confirm(`Delete report card #${id}?`)) {
        await window.adminService.deleteReportCard(id);
        await refreshAdminData();
      }
    }

    // Edit Report Card
    if (target.classList.contains('editReportCardBtn')) {
      const id = target.getAttribute('data-id');
      const card = (window.adminUI.currentData.reportCards || []).find(c => String(c.id) === String(id));
      if (card) {
        window.adminUI.setVal('reportCardId', card.id);
        window.adminUI.setVal('reportCardTitle', card.title);
        window.adminUI.setVal('reportCardYear', card.year);
        window.adminUI.setVal('reportCardPdfUploadPath', card.pdfUrl);
        const sEl = document.getElementById('reportCardFileStatus');
        const nEl = document.getElementById('reportCardFileNameDisplay');
        if (sEl) sEl.style.display = 'block';
        if (nEl) nEl.innerText = card.pdfUrl;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    // Delete Category
    if (target.classList.contains('deleteCategoryBtn')) {
      const id = target.getAttribute('data-id');
      if (confirm(`Delete category #${id}?`)) {
        await window.adminService.deleteCategory(id);
        await refreshAdminData();
      }
    }

    // Edit Category
    if (target.classList.contains('editCategoryBtn')) {
      const id = Number(target.getAttribute('data-id'));
      const name = target.getAttribute('data-name');
      window.adminUI.setVal('categoryId', id);
      window.adminUI.setVal('categoryName', name);
      const cancelBtn = document.getElementById('btnCancelCategory');
      if (cancelBtn) cancelBtn.style.display = 'inline-block';
      const catForm = document.getElementById('categoryForm');
      if (catForm) catForm.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

// 4. Live Clean QR Code Generator
function setupQrGenerator() {
  const qrInput = document.getElementById('settingWhatsappChannel');
  if (qrInput) {
    qrInput.addEventListener('input', async () => {
      const text = qrInput.value.trim();
      if (!text) return;
      const res = await window.adminService.generateQr(text);
      if (res.success && res.data) {
        window.adminUI.setVal('settingWhatsappQrPath', res.data.qrUrl);
        window.adminUI.setPreview('settingWhatsappQrPreview', res.data.qrUrl);
      }
    });
  }
}
