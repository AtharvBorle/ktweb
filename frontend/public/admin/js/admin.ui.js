/**
 * Enterprise Admin UI Manager
 * Exact element bindings matching admin index.html including Visibility Toggles, Gallery & Report Cards
 */

class AdminUIManager {
  constructor() {
    this.currentData = null;
  }

  bustingUrl(url) {
    return window.adminService ? window.adminService.bustingUrl(url) : (url || '');
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

  setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val !== undefined && val !== null ? val : '';
  }

  getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  setCheckbox(id, checked) {
    const el = document.getElementById(id);
    if (el) el.checked = Boolean(checked);
  }

  getCheckbox(id) {
    const el = document.getElementById(id);
    return el ? el.checked : true;
  }

  setPreview(id, url) {
    const el = document.getElementById(id);
    if (el) {
      if (url && url.trim() !== '') {
        el.src = this.bustingUrl(url);
        el.style.display = 'block';
      } else {
        el.src = '';
        el.style.display = 'none';
      }
    }
  }

  showLoginScreen() {
    const login = document.getElementById('loginScreen');
    const app = document.getElementById('adminApp');
    if (login) login.style.display = 'flex';
    if (app) app.style.display = 'none';
  }

  showAdminApp(admin) {
    const login = document.getElementById('loginScreen');
    const app = document.getElementById('adminApp');
    if (login) login.style.display = 'none';
    if (app) app.style.display = 'flex';

    if (admin && admin.name) {
      const nameEl = document.getElementById('adminNameDisplay');
      if (nameEl) nameEl.innerText = admin.name;
    }
  }

  setupTabNavigation() {
    const tabs = document.querySelectorAll('.navTab');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const target = tab.getAttribute('data-tab');
        if (!target) return;

        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const sections = document.querySelectorAll('.tabSection');
        sections.forEach(s => s.classList.remove('active'));

        const activeSection = document.getElementById(`tab-${target}`);
        if (activeSection) activeSection.classList.add('active');

        const titleEl = document.getElementById('currentTabTitle');
        if (titleEl) titleEl.innerText = tab.innerText;
      });
    });

    document.querySelectorAll('.navTabTrigger').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabName = btn.getAttribute('data-tab');
        const targetTab = document.querySelector(`.navTab[data-tab="${tabName}"]`);
        if (targetTab) targetTab.click();
      });
    });

    const galleryType = document.getElementById('galleryType');
    if (galleryType) {
      galleryType.addEventListener('change', () => {
        const isVideo = galleryType.value === 'video';
        const imgGroup = document.getElementById('galleryImageUploadGroup');
        const vidGroup = document.getElementById('galleryVideoUrlGroup');
        if (imgGroup) imgGroup.style.display = isVideo ? 'none' : 'block';
        if (vidGroup) vidGroup.style.display = isVideo ? 'block' : 'none';
      });
    }
  }

  populateForms(data) {
    this.currentData = data;

    // 1. Settings & Section Visibility
    if (data.settings) {
      const s = data.settings;
      this.setVal('settingCandidateName', s.candidateName);
      this.setVal('settingDesignation', s.designation);
      this.setVal('settingConstituency', s.constituency);
      this.setVal('votesCount', s.votesCount);
      this.setVal('settingVotesCount', s.votesCount);
      this.setVal('settingVotesDescription', s.votesDescription);
      this.setVal('settingShortBio', s.shortBio);
      this.setVal('settingContactEmail', s.contactEmail);
      this.setVal('settingContactPhone', s.contactPhone);
      this.setVal('settingOfficeAddress', s.officeAddress);
      this.setVal('settingWhatsappChannel', s.whatsappChannel);

      this.setVal('settingBjpLogoPath', s.bjpLogo || '');
      this.setPreview('settingBjpLogoPreview', s.bjpLogo || '');

      this.setVal('settingCandLogoPath', s.candidateLogo || '');
      this.setPreview('settingCandLogoPreview', s.candidateLogo || '');

      this.setVal('settingWhatsappQrPath', s.whatsappQrCode || '');
      this.setPreview('settingWhatsappQrPreview', s.whatsappQrCode || '');

      this.setVal('settingSubpageBannerPath', s.subpageHeaderBanner || '');
      this.setPreview('settingSubpageBannerPreview', s.subpageHeaderBanner || '');

      this.setVal('settingInstagramUrl', s.instagramUrl);
      this.setVal('settingFacebookUrl', s.facebookUrl);
      this.setVal('settingYoutubeUrl', s.youtubeUrl);
      this.setVal('settingLinkedinUrl', s.linkedinUrl);

      // Section Headings & Intros
      this.setVal('hlSectionHeadingInput', s.keyHighlightsHeading);
      this.setVal('hlSectionImgPath', s.keyHighlightsImage || '');
      this.setPreview('hlSectionImgPreview', s.keyHighlightsImage || '');

      this.setVal('meetSectionTitleInput', s.meetKunalSectionTitle);
      this.setVal('meetLeaderImgPath', s.meetKunalImage || '');
      this.setPreview('meetLeaderImgPreview', s.meetKunalImage || '');

      this.setVal('initSectionTitleInput', s.initiativesSectionTitle);
      this.setVal('initSectionDescInput', s.initiativesSectionDesc);

      this.setVal('parliamentPageTitleInput', s.parliamentPageTitle);
      this.setVal('parliamentIntroTextInput', s.parliamentIntroText);
      this.setVal('parliamentAttendanceInput', s.parliamentAttendance);
      this.setVal('parliamentDebatesInput', s.parliamentDebates);
      this.setVal('parliamentQuestionsInput', s.parliamentQuestions);
      this.setVal('parliamentZeroHourInput', s.parliamentZeroHour);

      this.setVal('projectsPageTitleInput', s.projectsPageTitle);
      this.setVal('projectsIntroTextInput', s.projectsIntroText);

      // Visibility Toggles Binding
      const v = s.sectionVisibility || {};
      this.setCheckbox('visHero', v.hero !== false);
      this.setCheckbox('visKeyHighlights', v.keyHighlights !== false);
      this.setCheckbox('visMeetKunal', v.meetKunal !== false);
      this.setCheckbox('visInitiatives', v.initiatives !== false);
      this.setCheckbox('visBjym', v.bjym !== false);
      this.setCheckbox('visGallery', v.gallery !== false);
      this.setCheckbox('visSectorLinks', v.sectorLinks !== false);
      this.setCheckbox('visReportCard', v.reportCard !== false);
      this.setCheckbox('visContact', v.contact !== false);
      this.setCheckbox('visFooter', v.footer !== false);
    }

    // 2. Hero Form
    if (data.hero) {
      const h = data.hero;
      this.setVal('heroHeadlineInput', h.headline);
      this.setVal('heroSubheadlineInput', h.subheadline);
      this.setVal('heroBioInput', h.heroBio);
      this.setVal('reportCardPdfPath', h.reportCardPdf);

      this.setVal('heroPortraitPath', h.heroPortrait || '');
      this.setPreview('heroPortraitPreview', h.heroPortrait || '');

      this.setVal('heroBgPath', h.heroBackground || '');
      this.setPreview('heroBgPreview', h.heroBackground || '');
    }

    // 3. Organization Form
    if (data.organization || data.settings) {
      const org = data.organization || {};
      const s = data.settings || {};
      this.setVal('orgSectionTitle', org.sectionTitle || s.bjymSectionTitle);
      this.setVal('orgMainDesc', org.mainDesc || s.bjymMainDesc);
      const img = org.mainImage || s.bjymMainImage || '';
      this.setVal('orgMainImgPath', img);
      this.setPreview('orgMainImgPreview', img);

      this.setVal('orgCard1Title', org.card1Title || s.bjymCard1Title);
      this.setVal('orgCard1Desc', org.card1Desc || s.bjymCard1Desc);
      this.setVal('orgCard2Title', org.card2Title || s.bjymCard2Title);
      this.setVal('orgCard2Desc', org.card2Desc || s.bjymCard2Desc);
      this.setVal('orgCard3Title', org.card3Title || s.bjymCard3Title);
      this.setVal('orgCard3Desc', org.card3Desc || s.bjymCard3Desc);
    }
  }
  populateTables(data) {
    this.renderInitiativePillarsTable(data.initiativePillars || []);
    this.renderInitiativesTable(data.initiatives || []);
    this.renderKeyHighlightsTable(data.keyHighlights || []);
    this.renderMeetKunalTable(data.meetKunal || []);
    this.renderSectorsTable(data.sectorInitiatives || []);
    this.renderParliamentTable(data.parliamentItems || []);
    this.renderProjectsTable(data.constituencyProjects || []);
    this.renderBlogsTable(data.blogs || []);
    this.renderGalleryTable(data.gallery || []);
    this.renderReportCardsTable(data.reportCards || []);
  }

  // --- Table Renderers ---

  renderInitiativePillarsTable(items) {
    const tbody = document.getElementById('pillarsTableBody');
    const titleEl = document.getElementById('pillarsSectionTitle');
    const count = (items || []).length;
    if (titleEl) {
      titleEl.innerText = `Active Initiatives & Page Intros (${count})`;
    }
    if (!tbody) return;
    if (count === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #888; padding: 25px;">No initiatives published yet. Create one above!</td></tr>';
      return;
    }
    tbody.innerHTML = items.map(item => `
      <tr>
        <td><strong>${this.escapeHtml(item.title)}</strong></td>
        <td><a href="${item.link}" target="_blank" style="color: #4f46e5; text-decoration: underline; font-weight: 500;">${this.escapeHtml(item.link)}</a></td>
        <td style="font-size: 13px; color: #475569; line-height: 1.4;">${this.escapeHtml(item.intro || '').substring(0, 140)}${(item.intro && item.intro.length > 140) ? '...' : ''}</td>
        <td>
          <button class="btn btn-sm btn-outline editPillarBtn" data-id="${item.id}" type="button">Edit</button>
          <button class="btn btn-sm btn-danger deletePillarBtn" data-id="${item.id}" type="button">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  renderInitiativesTable(items) {
    const tbody = document.getElementById('initiativesTableBody');
    if (!tbody) return;
    tbody.innerHTML = items.map(item => `
      <tr>
        <td>${item.image ? `<img src="${this.bustingUrl(item.image)}" style="width: 50px; height: 35px; object-fit: cover; border-radius: 4px;" onerror="this.style.display='none'"/>` : '<span style="color:#999;font-size:12px">No Image</span>'}</td>
        <td><strong>${this.escapeHtml(item.title)}</strong></td>
        <td>
          <button class="btn btn-sm btn-outline editInitiativeBtn" data-id="${item.id}" type="button">Edit</button>
          <button class="btn btn-sm btn-danger deleteInitiativeBtn" data-id="${item.id}" type="button">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  renderKeyHighlightsTable(items) {
    const tbody = document.getElementById('highlightsTableBody');
    if (!tbody) return;
    tbody.innerHTML = items.map(item => `
      <tr>
        <td><strong>${this.escapeHtml(item.title)}</strong></td>
        <td>${this.escapeHtml(item.issue || '')}</td>
        <td>${this.escapeHtml(item.description || '').substring(0, 80)}...</td>
        <td>
          <button class="btn btn-sm btn-outline editHighlightBtn" data-id="${item.id}" type="button">Edit</button>
          <button class="btn btn-sm btn-danger deleteHighlightBtn" data-id="${item.id}" type="button">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  renderMeetKunalTable(items) {
    const tbody = document.getElementById('meetTableBody');
    if (!tbody) return;
    tbody.innerHTML = items.map(item => `
      <tr>
        <td><strong>${this.escapeHtml(item.title)}</strong></td>
        <td>${this.escapeHtml(item.content || '').substring(0, 100)}...</td>
        <td>
          <button class="btn btn-sm btn-outline editMeetBtn" data-id="${item.id}" type="button">Edit</button>
          <button class="btn btn-sm btn-danger deleteMeetBtn" data-id="${item.id}" type="button">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  renderSectorsTable(items) {
    const tbody = document.getElementById('sectorItemsTableBody');
    if (!tbody) return;
    tbody.innerHTML = items.map(item => `
      <tr>
        <td><span class="badge" style="background:#fff0e6; color:#ff6b00; padding:3px 8px; border-radius:4px; font-weight:700; text-transform:uppercase;">${this.escapeHtml(item.sector)}</span></td>
        <td><strong>${this.escapeHtml(item.title)}</strong></td>
        <td>${this.escapeHtml(item.issue || '')}</td>
        <td>
          <button class="btn btn-sm btn-outline editSectorBtn" data-id="${item.id}" type="button">Edit</button>
          <button class="btn btn-sm btn-danger deleteSectorBtn" data-id="${item.id}" type="button">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  renderParliamentTable(items) {
    const tbody = document.getElementById('parliamentTableBody');
    if (!tbody) return;
    tbody.innerHTML = items.map(item => `
      <tr>
        <td><strong>${this.escapeHtml(item.title)}</strong></td>
        <td>${this.escapeHtml(item.description || '').substring(0, 80)}...</td>
        <td>
          <button class="btn btn-sm btn-outline editParlBtn" data-id="${item.id}" type="button">Edit</button>
          <button class="btn btn-sm btn-danger deleteParlBtn" data-id="${item.id}" type="button">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  renderProjectsTable(items) {
    const tbody = document.getElementById('constituencyProjectsTableBody');
    if (!tbody) return;
    tbody.innerHTML = items.map(item => `
      <tr>
        <td><strong>${this.escapeHtml(item.title)}</strong></td>
        <td><span class="badge" style="background:#eef2ff; color:#4f46e5; padding:3px 8px; border-radius:4px; font-weight:700;">${this.escapeHtml(item.category || 'General')}</span></td>
        <td>${this.escapeHtml(item.description || '').substring(0, 80)}...</td>
        <td>
          <button class="btn btn-sm btn-outline editProjBtn" data-id="${item.id}" type="button">Edit</button>
          <button class="btn btn-sm btn-danger deleteProjBtn" data-id="${item.id}" type="button">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  populateCategoryDropdowns(categories) {
    const dropdownIds = ['blogCategory'];
    const cats = categories || [];
    dropdownIds.forEach(id => {
      const select = document.getElementById(id);
      if (select) {
        const currentVal = select.value;
        select.innerHTML = '<option value="">-- Select Category --</option>' + cats.map(c => `
          <option value="${this.escapeHtml(c.name)}">${this.escapeHtml(c.name)}</option>
        `).join('');
        if (currentVal) select.value = currentVal;
      }
    });
  }

  renderCategoriesTable(categories) {
    const tbody = document.getElementById('categoriesTableBody');
    if (!tbody) return;
    tbody.innerHTML = (categories || []).map(cat => `
      <tr>
        <td><strong>${this.escapeHtml(cat.name)}</strong></td>
        <td>
          <button class="btn btn-sm btn-outline editCategoryBtn" data-id="${cat.id}" data-name="${this.escapeHtml(cat.name)}" type="button">Edit</button>
          <button class="btn btn-sm btn-danger deleteCategoryBtn" data-id="${cat.id}" type="button">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  renderBlogsTable(items) {
    const tbody = document.getElementById('blogsTableBody');
    if (!tbody) return;
    tbody.innerHTML = items.map(item => `
      <tr>
        <td><strong>${this.escapeHtml(item.title)}</strong></td>
        <td>${this.escapeHtml(item.category || 'Article')}</td>
        <td>${item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : ''}</td>
        <td>
          <button class="btn btn-sm btn-outline editBlogBtn" data-id="${item.id}" type="button">Edit</button>
          <button class="btn btn-sm btn-danger deleteBlogBtn" data-id="${item.id}" type="button">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  renderGalleryTable(items) {
    const tbody = document.getElementById('galleryTableBody');
    if (!tbody) return;
    tbody.innerHTML = items.map(item => `
      <tr>
        <td><strong>${this.escapeHtml(item.title)}</strong></td>
        <td>${item.type === 'video' ? '🎬 Video' : '🖼️ Image'}</td>
        <td>
          ${item.type === 'video' 
            ? `<span style="font-size:12px; color:#64748b;">${this.escapeHtml(item.url)}</span>` 
            : `<img src="${this.bustingUrl(item.url)}" style="width: 70px; height: 50px; object-fit: cover; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" onerror="this.style.display='none'"/>`
          }
        </td>
        <td>
          <button class="btn btn-sm btn-danger deleteGalleryBtn" data-id="${item.id}" type="button">Delete Photo</button>
        </td>
      </tr>
    `).join('');
  }

  renderReportCardsTable(cards) {
    const tbody = document.getElementById('reportCardsTableBody');
    if (!tbody) return;
    tbody.innerHTML = cards.map(c => `
      <tr>
        <td><strong>${this.escapeHtml(c.title)}</strong></td>
        <td><span class="badge" style="background:#ecfdf5; color:#059669; padding:4px 8px; border-radius:4px; font-weight:bold;">${this.escapeHtml(c.year || 'General')}</span></td>
        <td>
          <a href="${this.bustingUrl(c.pdfUrl)}" target="_blank" style="color:#F4821E; text-decoration:underline; font-weight:600;">
            📄 View PDF
          </a>
        </td>
        <td>
          <button class="btn btn-sm btn-outline editReportCardBtn" data-id="${c.id}" type="button">Edit</button>
          <button class="btn btn-sm btn-danger deleteReportCardBtn" data-id="${c.id}" type="button">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  renderMessagesTable(messages) {
    const tbody = document.getElementById('messagesTableBody');
    if (!tbody) return;
    tbody.innerHTML = messages.map(msg => `
      <tr>
        <td>${msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : ''}</td>
        <td><strong>${this.escapeHtml(msg.name)}</strong></td>
        <td>${this.escapeHtml(msg.email || msg.phone)}</td>
        <td>${this.escapeHtml(msg.subject || '')}</td>
        <td>${this.escapeHtml(msg.message)}</td>
        <td><button class="btn btn-sm btn-danger deleteMsgBtn" data-id="${msg.id}" type="button">Delete</button></td>
      </tr>
    `).join('');
  }

  setupUploadHandlers() {
    const uploadMappings = [
      { file: 'settingBjpLogoFile', path: 'settingBjpLogoPath', preview: 'settingBjpLogoPreview' },
      { file: 'settingCandLogoFile', path: 'settingCandLogoPath', preview: 'settingCandLogoPreview' },
      { file: 'settingSubpageBannerFile', path: 'settingSubpageBannerPath', preview: 'settingSubpageBannerPreview' },
      { file: 'heroPortraitFile', path: 'heroPortraitPath', preview: 'heroPortraitPreview' },
      { file: 'heroBgFile', path: 'heroBgPath', preview: 'heroBgPreview' },
      { file: 'reportCardPdfFile', path: 'reportCardPdfPath', preview: null },
      { file: 'reportCardPdfUploadFile', path: 'reportCardPdfUploadPath', preview: null, statusEl: 'reportCardFileStatus', nameEl: 'reportCardFileNameDisplay' },
      { file: 'hlSectionImgFile', path: 'hlSectionImgPath', preview: 'hlSectionImgPreview' },
      { file: 'meetLeaderImgFile', path: 'meetLeaderImgPath', preview: 'meetLeaderImgPreview' },
      { file: 'initiativeImageFile', path: 'initiativeImagePath', preview: 'initiativeImagePreview' },
      { file: 'orgMainImgFile', path: 'orgMainImgPath', preview: 'orgMainImgPreview' },
      { file: 'blogImageFile', path: 'blogImagePath', preview: 'blogImagePreview' },
      { file: 'galleryImageFile', path: 'galleryImagePath', preview: 'galleryImagePreview' }
    ];

    uploadMappings.forEach(mapping => {
      const fileInput = document.getElementById(mapping.file);
      if (fileInput) {
        fileInput.addEventListener('change', async (e) => {
          const file = e.target.files[0];
          if (!file) return;

          const result = await window.adminService.uploadFile(file);
          if (result.success && result.data && result.data.url) {
            const url = result.data.url;
            this.setVal(mapping.path, url);
            if (mapping.preview) this.setPreview(mapping.preview, url);
            if (mapping.statusEl) {
              const sEl = document.getElementById(mapping.statusEl);
              if (sEl) sEl.style.display = 'block';
            }
            if (mapping.nameEl) {
              const nEl = document.getElementById(mapping.nameEl);
              if (nEl) nEl.innerText = file.name;
            }
          } else {
            alert(result.message || 'File upload failed');
          }
        });
      }
    });
  }
}

// Global Singleton & Helper
window.adminUI = new AdminUIManager();

window.removeUploadedImage = function(pathId, previewId, fileId) {
  window.adminUI.setVal(pathId, '');
  window.adminUI.setPreview(previewId, '');
  const fileInput = document.getElementById(fileId);
  if (fileInput) fileInput.value = '';
};
