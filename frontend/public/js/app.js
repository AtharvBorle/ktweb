/**
 * Core Application Bootstrapper
 * Dynamically updates all pages with centralized CMS data
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (!window.apiService || !window.uiRenderers) {
    console.error('API service or UI Renderers not initialized');
    return;
  }

  // 1. Fetch live CMS content from API
  const result = await window.apiService.getContent();
  if (!result.success || !result.data) {
    console.warn('Could not load live content from API, keeping static layout');
    return;
  }

  const data = result.data;
  window.uiRenderers.state.data = data;

  // 2. Render Core Profile, Header, Footer & Section Visibility across all pages
  window.uiRenderers.renderCandidateProfile(data.settings);
  window.uiRenderers.renderHeroSection(data.hero, data.settings);
  window.uiRenderers.renderOrganizationSection(data.organization, data.settings);

  // 3. Render Common Home & Subpage Sections
  window.uiRenderers.renderKeyHighlights(data.keyHighlights, data.settings);
  window.uiRenderers.renderMeetKunal(data.meetKunal, data.settings);
  window.uiRenderers.renderMainInitiatives(data.initiatives, data.settings);
  window.uiRenderers.renderInitiativePillars(data.initiativePillars);
  window.uiRenderers.renderGallery(data.gallery);
  window.uiRenderers.renderReportCards(data.reportCards, data.hero);
  window.uiRenderers.renderBlogs(data.blogs);
  window.uiRenderers.renderFooterLinks(data.initiativePillars);

  // 4. Subpage Detection & Dedicated Renderers
  const path = window.location.pathname.toLowerCase();

  // Dynamic Universal /initiatives/:slug Template Handler
  if (path.includes('/initiatives/')) {
    const slug = path.split('/initiatives/')[1].replace(/\/index\.html$/, '').replace(/\/$/, '');
    window.uiRenderers.renderDynamicInitiativePage(slug, data);
  } else {
    // Dynamic Subpage Intro Header Text (for legacy subpages if directly loaded)
    window.uiRenderers.renderSubpageIntro(data.initiativePillars, path);

    if (path.includes('education')) {
      window.uiRenderers.renderSectorSubpage('education', data.sectorInitiatives, data.settings);
    } else if (path.includes('health')) {
      window.uiRenderers.renderSectorSubpage('health', data.sectorInitiatives, data.settings);
    } else if (path.includes('infrastructure-transport-mobility') || path.includes('infrastructure')) {
      window.uiRenderers.renderSectorSubpage('infrastructure', data.sectorInitiatives, data.settings);
    } else if (path.includes('sports')) {
      window.uiRenderers.renderSectorSubpage('sports', data.sectorInitiatives, data.settings);
    } else if (path.includes('labour')) {
      window.uiRenderers.renderSectorSubpage('labour', data.sectorInitiatives, data.settings);
    } else if (path.includes('security')) {
      window.uiRenderers.renderSectorSubpage('security', data.sectorInitiatives, data.settings);
    } else if (path.includes('policy-and-parliamentary-work')) {
      window.uiRenderers.renderParliamentSubpage(data.parliamentItems, data.settings);
    } else if (path.includes('constituency-projects')) {
      window.uiRenderers.renderProjectsSubpage(data.constituencyProjects, data.settings);
    }
  }

  // 5. Contact Form and Global Navigation
  window.uiRenderers.setupContactModal();
  window.uiRenderers.setupGlobalNavigation();

  // 6. Master Section Visibility Enforcement
  if (data.settings && data.settings.sectionVisibility) {
    window.uiRenderers.applySectionVisibility(data.settings.sectionVisibility);
  }
});
