/**
 * Universal Frontend UI Renderers (Precision Enterprise Edition)
 * Pure Vanilla JS, Zero Selector Collisions, Resilient Live Image Data Binding
 */

class UIRenderers {
  constructor() {
    this.state = {
      data: null
    };
  }

  bustingUrl(url) {
    if (!url) return '';
    if (window.apiService) return window.apiService.bustingUrl(url);
    return url.includes('?') ? url : `${url}?_t=${Date.now()}`;
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

  /**
   * Universal Interactive Detail Modal for "Read More"
   */
  showDetailModal(title, image, content, link) {
    let modal = document.getElementById('universalDetailModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'universalDetailModal';
      modal.style.cssText = `
        position: fixed;
        top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.75);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        box-sizing: border-box;
        backdrop-filter: blur(4px);
      `;
      modal.innerHTML = `
        <div style="background: #ffffff; max-width: 650px; width: 100%; max-height: 90vh; overflow-y: auto; border-radius: 14px; padding: 28px; position: relative; box-shadow: 0 20px 40px rgba(0,0,0,0.3); box-sizing: border-box;">
          <button type="button" id="closeDetailModal" style="position: absolute; top: 18px; right: 18px; background: #f0f0f0; border: none; font-size: 22px; font-weight: bold; width: 38px; height: 38px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #333;">&times;</button>
          <div id="detailModalBody"></div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.addEventListener('click', (e) => {
        if (e.target.id === 'universalDetailModal' || e.target.id === 'closeDetailModal') {
          modal.style.display = 'none';
        }
      });
    }

    const body = modal.querySelector('#detailModalBody');
    body.innerHTML = `
      ${image && image.trim() !== '' ? `<img src="${this.bustingUrl(image)}" alt="${this.escapeHtml(title)}" style="width:100%; max-height:320px; object-fit:cover; border-radius:10px; margin-bottom:20px; display:block;" />` : ''}
      <h2 style="font-family:'Alegreya', serif; font-size:26px; font-weight:bold; color:#212121; margin-bottom:14px; line-height:1.3;">${this.escapeHtml(title)}</h2>
      <div style="font-family:'IBM Plex Sans', sans-serif; font-size:15px; line-height:1.7; color:#444444; margin-bottom:24px; white-space:pre-line;">${this.escapeHtml(content || 'No additional details available.')}</div>
      ${link && link.trim() !== '' ? `<a href="${this.bustingUrl(link)}" target="_blank" style="display:inline-block; padding:10px 22px; background:#F4821E; color:#ffffff; font-weight:bold; border-radius:24px; text-decoration:none; box-shadow: 0 4px 12px rgba(244,130,30,0.3);">Explore More &rarr;</a>` : ''}
    `;

    modal.style.display = 'flex';
  }

  /**
   * 0. Master Section Visibility Engine
   */
  applySectionVisibility(visibility) {
    if (!visibility) return;

    const sectionMap = {
      hero: ['.sc-jNRKYE', '.jHGDop', '.heroBanner', 'section.heroWrap', '.bannerLinkWrap'],
      keyHighlights: ['.sc-hOayVG', '.dnnknw', '#press-coverage-prev', 'section.keyHighlightsSection'],
      meetKunal: ['#press-coverage', '.sc-dtgxmn', '.dQDszw', 'section.meetKunalSection'],
      initiatives: ['#bengaluru', '.initiativesSection'],
      bjym: ['#bjym', '.bjymWrapper', 'section.bjymSection'],
      gallery: ['#videos', '.sc-cZhcFc', '.gkPqiL', '.sc-bBbNsw', 'section.gallerySection'],
      sectorLinks: ['#myBlog', '.sc-jTIKuF', '.cLNFnR', 'section.sectorLinksSection'],
      reportCard: ['#reportCardId', '.sc-jQXlCi', '.bsGuHH', '.sc-cwKisF', 'section.reportCardSection', '.reportButton', 'a.reportButton', 'a.reportCardBtn'],
      contact: ['#contact-me', '.sc-fwdjSP', '.htpZlO', '.sc-iUeHef', '.ljGClc', '.sc-lltjXc', 'section.contactSection'],
      footer: ['footer.sc-fcdPlE', '.hJzSZn', 'footer.sc-iAfmwU', '.etlfrS', 'footer']
    };

    // Navigation links corresponding to sections
    const navLinkMap = {
      meetKunal: ['a[href*="#press-coverage"]'],
      initiatives: ['a[href*="#bengaluru"]'],
      bjym: ['a[href*="#bjym"]'],
      gallery: ['a[href*="#videos"]'],
      sectorLinks: ['a[href*="#myBlog"]'],
      reportCard: ['a[href*="#reportCardId"]'],
      contact: ['a[href*="#contact-me"]']
    };

    // Parent container logic for Initiatives + BJYM shared wrapper
    const parentInitiativesSection = document.querySelector('.sc-dIEoRj, .jKBbUA');
    if (parentInitiativesSection) {
      if (visibility.initiatives === false && visibility.bjym === false) {
        parentInitiativesSection.style.setProperty('display', 'none', 'important');
      } else {
        parentInitiativesSection.style.removeProperty('display');
      }
    }

    Object.keys(sectionMap).forEach(key => {
      const isVisible = visibility[key] !== false;
      const selectors = sectionMap[key];
      selectors.forEach(sel => {
        const elements = document.querySelectorAll(sel);
        elements.forEach(el => {
          if (!isVisible) {
            el.style.setProperty('display', 'none', 'important');
          } else {
            el.style.removeProperty('display');
          }
        });
      });

      // Also hide corresponding navigation menu links
      if (navLinkMap[key]) {
        navLinkMap[key].forEach(sel => {
          const links = document.querySelectorAll(sel);
          links.forEach(a => {
            const li = a.closest('li');
            const targetEl = li || a;
            if (!isVisible) {
              targetEl.style.setProperty('display', 'none', 'important');
            } else {
              targetEl.style.removeProperty('display');
            }
          });
        });
      }
    });
  }

  /**
   * 1. Core Profile, Header & Footer Settings
   */
  renderCandidateProfile(settings) {
    const s = settings || {};

    if (s.sectionVisibility) {
      this.applySectionVisibility(s.sectionVisibility);
    }

    // Document Title & Candidate Name
    if (s.candidateName) {
      document.title = `${s.candidateName} | Official Website`;
      const names = document.querySelectorAll('.candidateNameText, .leaderWrap h1, .brand h2, .mobileDrawerHeader h3, .desc h4, .bottom .left');
      names.forEach(el => {
        if (!el.innerText.includes('Admin') && !el.classList.contains('no-replace')) {
          if (el.tagName.toLowerCase() === 'h4') el.innerText = s.candidateName;
          else if (el.classList.contains('left') && el.closest('.bottom')) {
            el.innerText = `${s.candidateName} © ${new Date().getFullYear()} ALL RIGHTS RESERVED.`;
          }
        }
      });
    }

    // Designation
    const desigEls = document.querySelectorAll('.cttLvF .linkWrap span, .linkWrap span, .gJVyPZ .linkWrap span');
    desigEls.forEach(el => {
      if (s.designation) el.innerText = s.designation;
    });

    // 1A. Party Logo (BJP)
    const bjpImgs = document.querySelectorAll('.linkWrap > img[alt*="BJP"], img[alt="BJP-logo"], img[src*="BJP-logo"]');
    bjpImgs.forEach(img => {
      if (s.bjpLogo && s.bjpLogo.trim() !== '') {
        img.src = this.bustingUrl(s.bjpLogo);
        img.style.display = '';
        img.style.objectFit = 'contain';
      } else {
        img.style.display = 'none';
      }
    });

    // 1B. Candidate Header Logo
    const candLogoImgs = document.querySelectorAll('.linkWrap a > img, header .linkWrap a > img, .menuWrap .linkWrap a > img, .gJVyPZ .linkWrap a > img, .cttLvF .linkWrap a > img');
    candLogoImgs.forEach(img => {
      if (!img.alt.includes('BJP') && !img.src.includes('BJP')) {
        if (s.candidateLogo && s.candidateLogo.trim() !== '') {
          img.src = this.bustingUrl(s.candidateLogo);
          img.style.display = '';
          img.style.objectFit = 'contain';
        } else {
          img.style.display = 'none';
        }
      }
    });

    // 1C. WhatsApp Channel Link & Live QR Code Binding
    const waAnchors = document.querySelectorAll('a[href*="whatsapp.com"], a[href*="wa.me"], a h6, .urCodeWrapper a');
    if (s.whatsappChannel && s.whatsappChannel.trim() !== '') {
      const waLink = s.whatsappChannel.trim();
      waAnchors.forEach(el => {
        const anchor = el.tagName.toLowerCase() === 'a' ? el : el.closest('a');
        if (anchor) {
          anchor.href = waLink;
          anchor.target = '_blank';
        }
      });

      const qrImgs = document.querySelectorAll('.urCodeWrapper > img:first-child, img[alt="url-qr-code.png"], img[src*="url-qr-code"]');
      if (s.whatsappQrCode && s.whatsappQrCode.trim() !== '') {
        const qrSrc = this.bustingUrl(s.whatsappQrCode);
        qrImgs.forEach(img => {
          img.src = qrSrc;
          img.style.display = 'inline-block';
          img.style.width = '120px';
          img.style.height = '120px';
          img.style.maxWidth = '120px';
          img.style.maxHeight = '120px';
          img.style.aspectRatio = '1 / 1';
          img.style.objectFit = 'contain';
          img.style.cursor = 'pointer';
          img.title = 'Click to join WhatsApp Channel';
          img.onclick = () => window.open(waLink, '_blank');
        });
      } else {
        qrImgs.forEach(img => img.style.display = 'none');
      }

      const waLogoImgs = document.querySelectorAll('.urCodeWrapper > div img, img[alt="whatsapp"]');
      waLogoImgs.forEach(img => {
        img.style.display = 'inline-block';
        img.style.width = '24px';
        img.style.height = '24px';
      });
    }

    // 1D. Sub-Pages Dynamic Header Banner CSS
    let subStyle = document.getElementById('dynamicSubpageBannerCss');
    if (!subStyle) {
      subStyle = document.createElement('style');
      subStyle.id = 'dynamicSubpageBannerCss';
      document.head.appendChild(subStyle);
    }
    if (s.subpageHeaderBanner && s.subpageHeaderBanner.trim() !== '') {
      subStyle.innerHTML = `
        .sc-hHvkSs.nVCTi, .nVCTi, .subpageBanner {
          background: url("${this.bustingUrl(s.subpageHeaderBanner)}") no-repeat center top / cover !important;
        }
      `;
    }

    // 1E. Social Media URLs
    const socialMappings = [
      { sel: 'a[href*="instagram.com"]', url: s.instagramUrl },
      { sel: 'a[href*="facebook.com"]', url: s.facebookUrl },
      { sel: 'a[href*="youtube.com"]', url: s.youtubeUrl },
      { sel: 'a[href*="linkedin.com"]', url: s.linkedinUrl }
    ];
    socialMappings.forEach(item => {
      if (item.url) {
        document.querySelectorAll(item.sel).forEach(a => {
          a.href = item.url;
          a.target = '_blank';
        });
      }
    });

    // 1F. Footer Bio & Details
    const footerDesc = document.querySelector('footer .desc p, footer .top .desc p');
    if (footerDesc && s.shortBio) footerDesc.innerText = s.shortBio;

    const addressEl = document.querySelector('#contact-me .letsTalk div:last-child p');
    if (addressEl && s.officeAddress) addressEl.innerText = s.officeAddress;

    const phoneEl = document.querySelector('#contact-me a[href^="tel:"]');
    if (phoneEl && s.contactPhone) {
      phoneEl.href = `tel:${s.contactPhone}`;
      phoneEl.innerText = s.contactPhone;
    }

    const emailEl = document.querySelector('#contact-me a[href^="mailto:"]');
    if (emailEl && s.contactEmail) {
      emailEl.href = `mailto:${s.contactEmail}`;
      emailEl.innerText = s.contactEmail;
    }
  }

  /**
   * 2. Hero Section (Precision Target - No Collision with Download Icon)
   */
  renderHeroSection(hero, settings) {
    const h = hero || {};
    const s = settings || {};

    const headline = document.querySelector('.heroHeadline, .leaderWrap h1');
    if (headline && h.headline) headline.innerText = h.headline;

    const votesCount = document.querySelector('.votes h3, .bannerLinkWrap .votes h3');
    if (votesCount && (s.votesCount || h.votesCount)) {
      const val = s.votesCount || h.votesCount;
      votesCount.innerHTML = `<strong>${this.escapeHtml(val)}</strong> LAKH VOTES`;
    }

    const votesDesc = document.querySelector('.votes p, .bannerLinkWrap .votes p');
    if (votesDesc && (s.votesDescription || h.votesDescription)) {
      votesDesc.innerText = s.votesDescription || h.votesDescription;
    }

    const heroBio = document.querySelector('.heroContent p, .bannerText p, .leaderWrap > p');
    if (heroBio && h.heroBio) heroBio.innerText = h.heroBio;

    // Hero Portrait Cutout (Strictly first child of imgWrap, preserving .btnImgWrap img)
    const heroPortraitImgs = document.querySelectorAll('.leaderWrap .right.desktop .imgWrap > img:first-child, .leaderWrap .right.mobile .imgWrap > img:first-child, .right.desktop .imgWrap > img:first-child, .right.mobile .imgWrap > img:first-child');
    heroPortraitImgs.forEach(img => {
      if (h.heroPortrait && h.heroPortrait.trim() !== '') {
        img.src = this.bustingUrl(h.heroPortrait);
        img.style.display = '';
        if (img.parentElement && img.parentElement.classList.contains('imgWrap')) {
          img.parentElement.style.display = '';
        }
      } else {
        img.style.display = 'none';
        if (img.parentElement && img.parentElement.classList.contains('imgWrap')) {
          img.parentElement.style.display = 'none';
        }
      }
    });

    // Hero Background Graphic
    const heroBgImgs = document.querySelectorAll('.leaderWrap .right.desktop > img[alt="Banner"], .leaderWrap .right.mobile > img[alt="Banner"], .right.desktop > img[alt="Banner"], .right.mobile > img[alt="Banner"]');
    heroBgImgs.forEach(img => {
      if (h.heroBackground && h.heroBackground.trim() !== '') {
        img.src = this.bustingUrl(h.heroBackground);
        img.style.display = '';
      } else {
        img.style.display = 'none';
      }
    });
  }

  /**
   * 3. Organization / BJYM Section Binding
   */
  renderOrganizationSection(organization, settings) {
    const s = settings || {};
    const org = organization || {};

    const bjymH2 = document.querySelectorAll('.bjymLeft .leftTop h2, #bjym h2');
    bjymH2.forEach(h2 => {
      if (org.sectionTitle || s.bjymSectionTitle) h2.innerText = org.sectionTitle || s.bjymSectionTitle;
    });

    const bjymP = document.querySelectorAll('.bjymLeft .leftTop p, #bjym .leftTop p');
    bjymP.forEach(p => {
      if (org.mainDesc || s.bjymMainDesc) p.innerText = org.mainDesc || s.bjymMainDesc;
    });

    const bjymImgs = document.querySelectorAll('#bjym .TSimage > img, .bjymWrapper .TSimage > img, .TSimage img, img[alt="Kunal Tilak in BJYM"]');
    const imgPath = org.mainImage || s.bjymMainImage;
    bjymImgs.forEach(img => {
      if (imgPath && imgPath.trim() !== '') {
        img.src = this.bustingUrl(imgPath);
        img.style.display = '';
      } else {
        img.style.display = 'none';
      }
    });

    const card1H3 = document.querySelector('.bjymLeft .leftBottom .content h3');
    if (card1H3 && (org.card1Title || s.bjymCard1Title)) card1H3.innerText = org.card1Title || s.bjymCard1Title;

    const card1P = document.querySelector('.bjymLeft .leftBottom .content p');
    if (card1P && (org.card1Desc || s.bjymCard1Desc)) card1P.innerText = org.card1Desc || s.bjymCard1Desc;

    const card2H3 = document.querySelector('.bjymRight .content:nth-child(1) h3');
    if (card2H3 && (org.card2Title || s.bjymCard2Title)) card2H3.innerText = org.card2Title || s.bjymCard2Title;

    const card2P = document.querySelector('.bjymRight .content:nth-child(1) p');
    if (card2P && (org.card2Desc || s.bjymCard2Desc)) card2P.innerText = org.card2Desc || s.bjymCard2Desc;

    const card3H3 = document.querySelector('.bjymRight .content:nth-child(2) h3');
    if (card3H3 && (org.card3Title || s.bjymCard3Title)) card3H3.innerText = org.card3Title || s.bjymCard3Title;

    const card3P = document.querySelector('.bjymRight .content:nth-child(2) p');
    if (card3P && (org.card3Desc || s.bjymCard3Desc)) card3P.innerText = org.card3Desc || s.bjymCard3Desc;

    const bjymReadMores = document.querySelectorAll('.bjymLeft .leftTop small, #bjym .leftTop small');
    bjymReadMores.forEach(sm => {
      sm.style.cursor = 'pointer';
      sm.onclick = (e) => {
        e.preventDefault();
        this.showDetailModal(
          org.sectionTitle || s.bjymSectionTitle || 'Bharatiya Janata Yuva Morcha',
          org.mainImage || s.bjymMainImage,
          org.mainDesc || s.bjymMainDesc
        );
      };
    });
  }

  /**
   * 4. Key Highlights Section
   */
  renderKeyHighlights(keyHighlights, settings) {
    const s = settings || {};

    const hlH2 = document.querySelector('.sc-hOayVG .left h2, .keyHighlightsSection .left h2');
    if (hlH2 && s.keyHighlightsHeading) hlH2.innerText = s.keyHighlightsHeading;

    const hlImgs = document.querySelectorAll('.sc-hOayVG .left .imgWrap img, .sc-hOayVG .imgWrap img, img[alt="Key Highlights"]');
    hlImgs.forEach(img => {
      if (s.keyHighlightsImage && s.keyHighlightsImage.trim() !== '') {
        img.src = this.bustingUrl(s.keyHighlightsImage);
        img.style.display = '';
      } else {
        img.style.display = 'none';
      }
    });

    if (!keyHighlights || !keyHighlights.length) return;

    const track = document.querySelector('.sc-hOayVG .slick-track, .keyHighlightsSection .slick-track');
    if (track) {
      const count = keyHighlights.length;
      track.style.width = `${count * 100}%`;
      track.style.display = 'flex';
      track.style.flexDirection = 'row';
      track.style.transition = 'transform 0.4s ease';

      track.innerHTML = keyHighlights.map((item, idx) => {
        const cleanIssue = item.issue ? item.issue.replace(/^issue:\s*/i, '') : '';
        return `
        <div data-index="${idx}" class="slick-slide ${idx === 0 ? 'slick-active slick-current' : ''}" style="outline:none; width:${(100 / count).toFixed(6)}%;">
          <div>
            <div tabindex="-1" style="width:100%; display:inline-block;">
              <b>${this.escapeHtml(item.title)}</b>
              ${cleanIssue ? `<p>Issue: ${this.escapeHtml(cleanIssue)}</p>` : ''}
              <p>${this.escapeHtml(item.description || '')}</p>
              ${item.donateUrl ? `<a href="${this.bustingUrl(item.donateUrl)}" target="_blank" style="padding:6px 16px; background:#f4821e; color:#fff; border-radius:20px; display:inline-block; margin-top:10px; font-weight:bold; text-decoration:none;">Support Now</a>` : ''}
            </div>
          </div>
        </div>
        `;
      }).join('');

      const prevBtn = document.querySelector('.sc-hOayVG .slick-prev, .keyHighlightsSection .slick-prev');
      const nextBtn = document.querySelector('.sc-hOayVG .slick-next, .keyHighlightsSection .slick-next');

      if (prevBtn && nextBtn) {
        let currentIndex = 0;

        const updateSliderPosition = () => {
          const percentage = -(currentIndex * (100 / count));
          track.style.transform = `translateX(${percentage}%)`;

          if (currentIndex === 0) {
            prevBtn.classList.add('slick-disabled');
          } else {
            prevBtn.classList.remove('slick-disabled');
          }

          if (currentIndex >= count - 1) {
            nextBtn.classList.add('slick-disabled');
          } else {
            nextBtn.classList.remove('slick-disabled');
          }

          const slides = track.querySelectorAll('.slick-slide');
          slides.forEach((sEl, i) => {
            if (i === currentIndex) {
              sEl.classList.add('slick-active', 'slick-current');
              sEl.setAttribute('aria-hidden', 'false');
            } else {
              sEl.classList.remove('slick-active', 'slick-current');
              sEl.setAttribute('aria-hidden', 'true');
            }
          });
        };

        prevBtn.onclick = (e) => {
          e.preventDefault();
          if (currentIndex > 0) {
            currentIndex--;
            updateSliderPosition();
          }
        };

        nextBtn.onclick = (e) => {
          e.preventDefault();
          if (currentIndex < count - 1) {
            currentIndex++;
            updateSliderPosition();
          }
        };

        updateSliderPosition();
      }
    }
  }

  /**
   * 5. Meet Kunal Section
   */
  renderMeetKunal(meetKunal, settings) {
    const s = settings || {};

    const meetH2 = document.querySelector('#press-coverage .right h2, .meetKunalSection h2');
    if (meetH2 && s.meetKunalSectionTitle) meetH2.innerText = s.meetKunalSectionTitle;

    const leaderImgs = document.querySelectorAll('#press-coverage .leaderContainer .left > img, #press-coverage .left img, .meetKunalSection .left img, img[alt*="Leader of the new generation"]');
    leaderImgs.forEach(img => {
      if (s.meetKunalImage && s.meetKunalImage.trim() !== '') {
        img.src = this.bustingUrl(s.meetKunalImage);
        img.style.display = '';
      } else {
        img.style.display = 'none';
      }
    });

    if (!meetKunal || !meetKunal.length) return;

    const container = document.querySelector('#press-coverage .right, .meetKunalSection .right');
    const track = document.querySelector('#press-coverage .slick-track, .meetKunalSlider .slick-track');

    if (track && container) {
      const count = meetKunal.length;
      track.style.width = `${count * 100}%`;
      track.style.display = 'flex';
      track.style.flexDirection = 'row';
      track.style.transition = 'transform 0.5s ease-in-out';

      track.innerHTML = meetKunal.map((item, idx) => `
        <div data-index="${idx}" class="slick-slide ${idx === 0 ? 'slick-active slick-current' : ''}" style="outline:none; width:${(100 / count).toFixed(6)}%;">
          <div>
            <div class="sliderItem" tabindex="-1" style="width:100%; display:inline-block;">
              <strong>${this.escapeHtml(item.title)}</strong>
              <p>${this.escapeHtml(item.content)}</p>
            </div>
          </div>
        </div>
      `).join('');

      // Render Dots (Clean duplicate containers)
      const existingDots = container.querySelectorAll('.slick-dots');
      existingDots.forEach((el, i) => {
        if (i > 0) el.remove();
      });

      let dotsContainer = container.querySelector('.slick-dots');
      if (!dotsContainer) {
        dotsContainer = document.createElement('ul');
        dotsContainer.className = 'slick-dots';
        dotsContainer.style.display = 'flex';
        container.appendChild(dotsContainer);
      }

      dotsContainer.innerHTML = meetKunal.map((_, idx) => `
        <li class="${idx === 0 ? 'slick-active' : ''}">
          <button type="button" data-index="${idx}">${idx + 1}</button>
        </li>
      `).join('');

      const prevBtn = container.querySelector('.slick-prev');
      const nextBtn = container.querySelector('.slick-next');
      const dotLis = dotsContainer.querySelectorAll('li');

      let currentIndex = 0;
      let autoPlayTimer = null;

      const updateSliderPosition = () => {
        const percentage = -(currentIndex * (100 / count));
        track.style.transform = `translateX(${percentage}%)`;

        // Update Prev / Next buttons
        if (prevBtn) {
          if (currentIndex === 0) prevBtn.classList.add('slick-disabled');
          else prevBtn.classList.remove('slick-disabled');
        }

        if (nextBtn) {
          if (currentIndex >= count - 1) nextBtn.classList.add('slick-disabled');
          else nextBtn.classList.remove('slick-disabled');
        }

        // Update Dots Active State
        dotLis.forEach((li, i) => {
          if (i === currentIndex) {
            li.classList.add('slick-active');
          } else {
            li.classList.remove('slick-active');
          }
        });

        // Update Slides Active State
        const slides = track.querySelectorAll('.slick-slide');
        slides.forEach((sEl, i) => {
          if (i === currentIndex) {
            sEl.classList.add('slick-active', 'slick-current');
            sEl.setAttribute('aria-hidden', 'false');
          } else {
            sEl.classList.remove('slick-active', 'slick-current');
            sEl.setAttribute('aria-hidden', 'true');
          }
        });
      };

      const goToNext = () => {
        currentIndex = (currentIndex + 1) % count;
        updateSliderPosition();
      };

      const goToPrev = () => {
        currentIndex = (currentIndex - 1 + count) % count;
        updateSliderPosition();
      };

      if (prevBtn) {
        prevBtn.onclick = (e) => {
          e.preventDefault();
          goToPrev();
          resetAutoPlay();
        };
      }

      if (nextBtn) {
        nextBtn.onclick = (e) => {
          e.preventDefault();
          goToNext();
          resetAutoPlay();
        };
      }

      // Attach click events to dots
      dotLis.forEach((li, idx) => {
        const btn = li.querySelector('button');
        if (btn) {
          btn.onclick = (e) => {
            e.preventDefault();
            currentIndex = idx;
            updateSliderPosition();
            resetAutoPlay();
          };
        }
      });

      // Auto-play interval (every 2 seconds)
      const startAutoPlay = () => {
        if (autoPlayTimer) clearInterval(autoPlayTimer);
        autoPlayTimer = setInterval(goToNext, 2000);
      };

      const resetAutoPlay = () => {
        startAutoPlay();
      };

      // Pause on hover
      container.onmouseenter = () => {
        if (autoPlayTimer) clearInterval(autoPlayTimer);
      };

      container.onmouseleave = () => {
        startAutoPlay();
      };

      updateSliderPosition();
      startAutoPlay();
    }
  }

  /**
   * 6. Main Initiatives Section & Universal Interactive Slider
   */
  renderMainInitiatives(initiatives, settings) {
    const s = settings || {};

    const initH2 = document.querySelectorAll('.sc-dIEoRj h2, .initiativesSection h2, #bengaluru h2');
    initH2.forEach(h => {
      if (s.initiativesSectionTitle) h.innerText = s.initiativesSectionTitle;
    });

    const initSubP = document.querySelectorAll('.sc-dIEoRj .up p, .initiativesSection .up p, #bengaluru .up p');
    initSubP.forEach(p => {
      if (s.initiativesSectionDesc) p.innerText = s.initiativesSectionDesc;
    });

    if (!initiatives || !initiatives.length) return;

    const tracks = document.querySelectorAll('.sc-dIEoRj .slick-track, #bengaluru .slick-track');
    tracks.forEach(track => {
      track.innerHTML = initiatives.map((init, idx) => `
        <div class="sliderItem" tabindex="-1" data-index="${idx}">
          ${init.image && init.image.trim() !== '' ? `<img alt="${this.escapeHtml(init.title)}" loading="lazy" src="${this.bustingUrl(init.image)}" />` : ''}
          <div>
            <strong>${this.escapeHtml(init.title)}</strong>
            <p>${this.escapeHtml(init.shortDesc || init.fullDesc || '')}</p>
            <small class="readMore" style="cursor:pointer; color:#F4821E; font-weight:bold;">Read more &rarr;</small>
          </div>
        </div>
      `).join('');

      track.querySelectorAll('.sliderItem').forEach((itemEl, idx) => {
        const initData = initiatives[idx];
        const readMoreBtn = itemEl.querySelector('.readMore');
        if (readMoreBtn && initData) {
          readMoreBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.showDetailModal(
              initData.title,
              initData.image,
              initData.fullDesc || initData.shortDesc,
              initData.link || initData.pdfUrl
            );
          };
        }
      });
    });

    // Slider Smooth Arrows Navigation
    document.querySelectorAll('.sc-dIEoRj .sliderWrapper, #bengaluru .sliderWrapper').forEach(wrapper => {
      const track = wrapper.querySelector('.slick-track');
      const prevBtn = wrapper.querySelector('.slick-prev');
      const nextBtn = wrapper.querySelector('.slick-next');

      if (track && prevBtn && nextBtn) {
        let currentOffset = 0;
        const itemWidth = 375; // Card width + gap

        prevBtn.onclick = (e) => {
          e.preventDefault();
          currentOffset = Math.min(0, currentOffset + itemWidth);
          track.style.transform = `translateX(${currentOffset}px)`;
        };

        nextBtn.onclick = (e) => {
          e.preventDefault();
          const maxScroll = -(track.scrollWidth - wrapper.clientWidth);
          if (maxScroll < 0) {
            currentOffset = Math.max(maxScroll, currentOffset - itemWidth);
            track.style.transform = `translateX(${currentOffset}px)`;
          }
        };
      }
    });
  }

  /**
   * 7. Gallery Photos & Videos Section Binding with Bidirectional Auto-Slide
   */
  renderGallery(gallery) {
    const gallerySections = document.querySelectorAll('section#videos, section.sc-cZhcFc, section.sc-bBbNsw, .fLwwqA');
    if (!gallerySections.length) return;

    gallerySections.forEach(section => {
      section.style.display = '';

      const row1Track = section.querySelector('.sliderOneWrapper .slick-track');
      const row2Track = section.querySelector('.sliderTwoWrapper .slick-track');

      if (gallery && gallery.length > 0) {
        const validItems = gallery.filter(item => item && item.url && item.url.trim() !== '' && item.type !== 'video');
        if (validItems.length > 0) {
          // Row 1 items: repeat to at least 8 items, then duplicate for seamless 50% loop
          let r1 = [...validItems];
          while (r1.length < 8) {
            r1 = r1.concat(validItems);
          }
          const fullRow1 = r1.concat(r1);

          // Row 2 items: reversed for variety, repeat to at least 8, then duplicate
          let r2 = [...validItems].reverse();
          while (r2.length < 8) {
            r2 = r2.concat(validItems.slice().reverse());
          }
          const fullRow2 = r2.concat(r2);

          const renderItems = (items) => items.map((item, i) => `
            <div class="slick-slide" tabindex="-1" style="width: auto !important; float: none !important;">
              <div class="slideItem" style="cursor: pointer;" data-idx="${i}" title="${this.escapeHtml(item.title || 'View Photo')}">
                <img src="${this.bustingUrl(item.url)}" alt="${this.escapeHtml(item.title || 'Gallery Item')}" loading="lazy" />
              </div>
            </div>
          `).join('');

          if (row1Track) {
            row1Track.innerHTML = renderItems(fullRow1);
            row1Track.querySelectorAll('.slideItem').forEach((el, idx) => {
              const itm = fullRow1[idx];
              el.onclick = () => this.showDetailModal(itm.title || 'Gallery Photo', itm.url, '');
            });
          }

          if (row2Track) {
            row2Track.innerHTML = renderItems(fullRow2);
            row2Track.querySelectorAll('.slideItem').forEach((el, idx) => {
              const itm = fullRow2[idx];
              el.onclick = () => this.showDetailModal(itm.title || 'Gallery Photo', itm.url, '');
            });
          }
          return;
        }
      }

      // Default static fallback: duplicate existing static items so the CSS marquee loops seamlessly
      [row1Track, row2Track].forEach(track => {
        if (track && track.children.length > 0 && !track.dataset.duplicated) {
          const original = Array.from(track.children);
          original.forEach(child => {
            const clone = child.cloneNode(true);
            track.appendChild(clone);
          });
          track.dataset.duplicated = 'true';
        }
      });
    });
  }

  /**
   * 8. Report Cards Section
   */
  renderReportCards(reportCards, hero) {
    const wrappers = document.querySelectorAll('.reportCardWrapper, #reportCardId .reportCardWrapper');
    wrappers.forEach(wrapper => {
      if (reportCards && reportCards.length > 0) {
        wrapper.innerHTML = reportCards.map(c => `
          <a href="${this.bustingUrl(c.pdfUrl)}" class="last" download="" target="_blank">
            ${this.escapeHtml(c.title)}
          </a>
        `).join('');
      }
    });

    if (hero && hero.reportCardPdf) {
      const heroReportBtns = document.querySelectorAll('a.reportButton, a.reportCardBtn, a[href*="report-card"]');
      heroReportBtns.forEach(btn => {
        if (hero.reportCardPdf.trim() !== '') {
          btn.href = this.bustingUrl(hero.reportCardPdf);
          btn.style.display = '';
          const txtSpan = btn.querySelector('.btn-text');
          if (txtSpan && hero.reportCardTitle) txtSpan.innerText = hero.reportCardTitle;
        } else {
          btn.style.display = 'none';
        }
      });
    }
  }

  /**
   * 9. Universal Blog Posts Renderer
   */
  renderBlogs(blogs) {
    const container = document.querySelector('.ncFdE .bottomWrap, .blogListContainer');
    if (!container) return;

    // If no blogs exist (or all were deleted), remove fallback and show clean empty message
    if (!blogs || !blogs.length) {
      container.innerHTML = '<div style="padding: 40px 20px; text-align: center; color: #888; width: 100%; font-size: 15px; font-style: italic;">No blog posts published yet.</div>';
      return;
    }

    const half = Math.ceil(blogs.length / 2);
    const col1 = blogs.slice(0, half);
    const col2 = blogs.slice(half);

    const renderCol = (list) => list.map(b => `
      <div class="list">
        <strong>${this.escapeHtml(b.category || 'Article')}</strong>
        <a href="${b.link || '/blog/index.html'}">${this.escapeHtml(b.title)}</a>
        <p>${this.escapeHtml(b.excerpt || b.content || '')}</p>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="right">${renderCol(col1)}</div>
      <div class="right">${renderCol(col2)}</div>
    `;
  }

  /**
   * 10. Universal Sector Subpage Renderer (Education, Health, Transport, Labour, Security, Sports)
   */
  renderSectorSubpage(sectorKey, sectorInitiatives, settings) {
    if (!sectorInitiatives) return;
    const items = sectorInitiatives.filter(i => i.sector === sectorKey);

    // Locate the initiative container dynamically across all 6 sector subpages:
    // Every subpage has the "Recently Posted" block (.sc-jSwlEQ) at the bottom of the initiatives container
    const recentBlock = document.querySelector('.sc-jSwlEQ, .bottomWrap');
    let parentContainer = null;
    if (recentBlock) {
      parentContainer = recentBlock.closest('.container') || recentBlock.parentElement;
    }
    if (!parentContainer) {
      parentContainer = document.querySelector('.sc-jdkVqZ .container, .sc-dPOtYP .container, .sc-gSkWNA .container, .sc-egWZns .container, .sc-eGmjcv .container, .sc-dujzCk .container, .sectorInitiativesList, .sc-kgflAQ, .sc-gldtlU');
    }
    if (!parentContainer) return;

    // Remove ALL static hardcoded fallback paragraphs from the old template
    const existingPs = parentContainer.querySelectorAll('p:not(.recentP)');
    existingPs.forEach(p => p.remove());

    if (items.length > 0) {
      const itemsHtml = items.map((item, i) => `
        <p class="sectorInitiativeItem">
          <strong>${i + 1}. ${this.escapeHtml(item.title)}</strong><br/>
          ${item.issue ? `<b>${this.escapeHtml(item.issue)}</b><br/>` : ''}
          ${this.escapeHtml(item.description)}
        </p>
      `).join('');

      const temp = document.createElement('div');
      temp.innerHTML = itemsHtml;
      while (temp.firstChild) {
        if (recentBlock) {
          parentContainer.insertBefore(temp.firstChild, recentBlock);
        } else {
          parentContainer.appendChild(temp.firstChild);
        }
      }
    } else {
      // If deleted or empty, remove fallback and show clean empty notice
      const emptyNote = document.createElement('p');
      emptyNote.style.cssText = 'padding: 30px 0; color: #888; font-style: italic; font-size: 15px;';
      emptyNote.innerText = 'No initiatives currently published for this sector.';
      if (recentBlock) {
        parentContainer.insertBefore(emptyNote, recentBlock);
      } else {
        parentContainer.appendChild(emptyNote);
      }
    }
  }

  /**
   * 10.4. Universal Dynamic Initiative Subpage Handler (/initiatives/:slug)
   */
  renderDynamicInitiativePage(slug, data) {
    if (!data) return;
    const s = (slug || '').toLowerCase();

    // 1. Match initiative pillar by key, link slug, or title slug
    const pillars = data.initiativePillars || [];
    const pillar = pillars.find(p => {
      const k = (p.key || '').toLowerCase();
      const l = (p.link || '').toLowerCase().replace('/initiatives/', '').replace(/^\//, '').replace(/\/index\.html$/, '');
      const t = (p.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return k === s || l === s || t === s || s.includes(k) || (k && s.includes(k));
    });

    const pageTitle = pillar ? pillar.title : slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const pageIntro = pillar ? pillar.intro : '';

    // 2. Set Page Title & Breadcrumb Header
    const featuredSpan = document.querySelector('.featured span');
    if (featuredSpan) featuredSpan.innerText = 'INITIATIVE';

    const titleAnchor = document.querySelector('.content > a, .content h1, .featured + .content > a');
    if (titleAnchor) titleAnchor.innerText = pageTitle;

    document.title = `${pageTitle} | Kunal Tilak Initiatives`;

    // 3. Set Header Introduction Narrative
    const introP = document.querySelector('.mediaSplit p, .content .mediaSplit p, .content p');
    if (introP && pageIntro) {
      introP.innerText = pageIntro;
    }

    // 4. Render Sector Initiatives matching this pillar
    const sectorKey = (pillar && pillar.key) ? pillar.key : slug;
    this.renderSectorSubpage(sectorKey, data.sectorInitiatives, data.settings);
  }

  /**
   * 10.5. Primary Initiative Pillars Renderer (Homepage 8 Sector Cards)
   */
  renderInitiativePillars(pillars) {
    const section = document.querySelector('#myBlog, section.sc-jTIKuF, section.sectorLinksSection');
    const container = document.querySelector('#myBlog .right, .sc-jTIKuF .right, section.sectorLinksSection .right');
    const leftHeader = document.querySelector('#myBlog .left, .sc-jTIKuF .left');

    if (!pillars || !pillars.length) {
      if (section) {
        section.classList.remove('has-initiatives');
        section.style.cssText = 'display: none !important;';
      }
      if (leftHeader) {
        leftHeader.style.cssText = 'display: none !important; visibility: hidden !important;';
      }
      if (container) container.innerHTML = '';
      return;
    }

    if (section) {
      section.classList.add('has-initiatives');
      section.style.display = '';
    }

    if (leftHeader) {
      leftHeader.style.display = '';
      leftHeader.style.visibility = '';
      if (!leftHeader.querySelector('h2')) {
        leftHeader.innerHTML = '<h2>Initiatives</h2>';
      }
    }

    if (!container) return;

    container.innerHTML = pillars.map(p => `
      <div class="content">
        <a href="${p.link}"><h3>${this.escapeHtml(p.title)}</h3></a>
        <a href="${p.link}">Read More</a>
      </div>
    `).join('');

    // Force real browser navigation on click to prevent Next.js client router from swallowing navigation
    container.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (href && !href.startsWith('#')) {
          e.preventDefault();
          e.stopPropagation();
          window.location.href = href;
        }
      });
    });
  }

  /**
   * 10.55. Universal Dynamic Footer Links Renderer
   */
  renderFooterLinks(pillars) {
    const footerLinksWrappers = document.querySelectorAll('.footerLinks');
    if (!footerLinksWrappers.length) return;

    const hasPillars = Array.isArray(pillars) && pillars.length > 0;

    // Column 1: Base site links (HOME, BLOG, REPORTS, GALLERY)
    const col1Html = `
      <div>
        <ul>
          <li><a href="/index.html">HOME</a></li>
          <li><a href="/blog/index.html">BLOG</a></li>
          <li><a href="/index.html#reportCardId">REPORTS</a></li>
          <li><a href="/index.html#videos">GALLERY</a></li>
          ${hasPillars ? `<li><a href="/index.html#myBlog">INITIATIVES</a></li>` : ''}
        </ul>
      </div>
    `;

    // Maximum available slots in footer columns (5 in Column 2, 5 in Column 3 = 10 total)
    const MAX_FOOTER_INITIATIVES = 10;

    // Column 2 & Column 3: Filled dynamically with initiatives if they exist, capped to available places
    let col2Items = [];
    let col3Items = [];

    if (hasPillars) {
      // If more initiatives exist than available slots (e.g. 13), only show the first 10
      const visiblePillars = pillars.slice(0, MAX_FOOTER_INITIATIVES);
      const half = Math.ceil(visiblePillars.length / 2);
      const firstHalf = visiblePillars.slice(0, half);
      const secondHalf = visiblePillars.slice(half);

      col2Items = firstHalf.map(p => `<li><a href="${p.link}">${this.escapeHtml((p.title || '').toUpperCase())}</a></li>`);
      col3Items = secondHalf.map(p => `<li><a href="${p.link}">${this.escapeHtml((p.title || '').toUpperCase())}</a></li>`);
    }

    const col2Html = `
      <div>
        <ul>
          ${col2Items.join('')}
        </ul>
      </div>
    `;

    const col3Html = `
      <div>
        <ul>
          ${col3Items.join('')}
        </ul>
      </div>
    `;

    footerLinksWrappers.forEach(wrapper => {
      wrapper.innerHTML = col1Html + col2Html + col3Html;

      wrapper.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', (e) => {
          const href = a.getAttribute('href');
          if (href && !href.startsWith('#')) {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = href;
          }
        });
      });
    });
  }

  /**
   * 10.6. Sub-Page Header Introduction Dynamic Renderer (Education, Health, etc.)
   */
  renderSubpageIntro(pillars, currentPath) {
    if (!pillars || !pillars.length) return;
    const path = (currentPath || window.location.pathname || '').toLowerCase();
    const cleanPath = path.replace('/index.html', '').replace(/^\//, '').replace(/\/$/, '');

    // Match the current page to the appropriate initiative pillar
    const matched = pillars.find(p => {
      const link = (p.link || '').toLowerCase();
      const key = (p.key || '').toLowerCase();
      const cleanLink = link.replace('/index.html', '').replace(/^\//, '').replace(/\/$/, '');
      const slugTitle = (p.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return (cleanLink && (cleanPath === cleanLink || cleanPath.includes(cleanLink))) ||
             (key && (cleanPath === key || cleanPath.includes(key))) ||
             (slugTitle && (cleanPath === slugTitle || cleanPath.includes(slugTitle)));
    });

    if (matched) {
      // 1. Update the subpage header introduction paragraph in .mediaSplit or .content
      const introP = document.querySelector('.mediaSplit p, .content .mediaSplit p, .sc-ciJnBw .content p, .sc-jOHGOj .content p, .sc-eflkNB .content p, .sc-gXCJSa .content p');
      if (introP && matched.intro) {
        introP.innerText = matched.intro;
      }

      // 2. Update the subpage title anchor in the header if available
      const titleLink = document.querySelector('.content > a, .content h1, .sc-ciJnBw .content > a, .sc-jOHGOj .content > a');
      if (titleLink && matched.title) {
        titleLink.innerText = matched.title;
      }
    }
  }

  /**
   * 11. Parliament Subpage Renderer
   */
  renderParliamentSubpage(parliamentItems, settings) {
    const s = settings || {};

    if (s.parliamentPageTitle) {
      const h1 = document.querySelector('.featured + .content > a, .content > a, .sc-ciJnBw .content a, h1.pageTitle');
      if (h1) h1.innerText = s.parliamentPageTitle;
    }
    if (s.parliamentIntroText) {
      const introP = document.querySelector('.featured + .content p, .content p, .sc-ciJnBw .content p');
      if (introP) introP.innerText = s.parliamentIntroText;
    }
    if (s.parliamentAttendance) {
      const el = document.querySelector('.highlightsAndMedia .item:nth-child(1) strong');
      if (el) el.innerText = s.parliamentAttendance;
    }
    if (s.parliamentDebates) {
      const el = document.querySelector('.highlightsAndMedia .item:nth-child(2) strong');
      if (el) el.innerText = s.parliamentDebates;
    }
    if (s.parliamentQuestions) {
      const el = document.querySelector('.highlightsAndMedia .item:nth-child(3) strong');
      if (el) el.innerText = s.parliamentQuestions;
    }
    if (s.parliamentZeroHour) {
      const el = document.querySelector('.highlightsAndMedia .item:nth-child(4) strong');
      if (el) el.innerText = s.parliamentZeroHour;
    }

    if (parliamentItems && parliamentItems.length > 0) {
      const container = document.querySelector('.sc-dwvMdg .container, .gOQYXh .container');
      if (container) {
        const itemsHtml = parliamentItems.map((item, i) => `
          <p>
            <strong>${i + 1}. ${this.escapeHtml(item.title)}</strong><br/><br/>
            ${this.escapeHtml(item.description)}
          </p>
        `).join('');
        container.innerHTML = itemsHtml;
      }
    }
  }

  /**
   * 12. Constituency Projects Subpage Renderer
   */
  renderProjectsSubpage(constituencyProjects, settings) {
    const s = settings || {};

    if (s.projectsPageTitle) {
      const h1 = document.querySelector('.featured + .content > a, .content > a, .sc-ciJnBw .content a, h1.pageTitle');
      if (h1) h1.innerText = s.projectsPageTitle;
    }
    if (s.projectsIntroText) {
      const introP = document.querySelector('.featured + .content p, .content p, .sc-ciJnBw .content p');
      if (introP) introP.innerText = s.projectsIntroText;
    }

    if (constituencyProjects && constituencyProjects.length > 0) {
      const container = document.querySelector('.sc-kMbQoj .container, .gbsxhe .container');
      if (container) {
        const itemsHtml = constituencyProjects.map((item, i) => `
          <p>
            <strong>${i + 1}. ${this.escapeHtml(item.title)}</strong><br/><br/>
            ${this.escapeHtml(item.description)}
          </p>
        `).join('');
        container.innerHTML = itemsHtml;
      }
    }
  }

  /**
   * Universal Modern Floating Toast Notification
   */
  showToast(message, type = 'success') {
    let toast = document.getElementById('universalToastNotification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'universalToastNotification';
      toast.style.cssText = `
        position: fixed;
        bottom: 28px;
        right: 28px;
        min-width: 280px;
        max-width: 440px;
        padding: 14px 20px;
        border-radius: 8px;
        font-family: 'IBM Plex Sans', sans-serif;
        font-size: 14px;
        font-weight: 500;
        line-height: 1.4;
        color: #ffffff;
        box-shadow: 0 10px 30px rgba(0,0,0,0.28);
        z-index: 999999;
        display: flex;
        align-items: center;
        gap: 12px;
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.3s ease, transform 0.3s ease;
        pointer-events: none;
      `;
      document.body.appendChild(toast);
    }

    toast.style.background = type === 'success' ? '#2e7d32' : (type === 'error' ? '#c62828' : '#F4821E');
    const icon = type === 'success' ? '✓' : (type === 'error' ? '⚠️' : 'ℹ️');
    toast.innerHTML = `<span style="font-size: 18px; font-weight: bold;">${icon}</span><span style="flex: 1;">${message}</span>`;

    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    toast.style.pointerEvents = 'auto';

    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      toast.style.pointerEvents = 'none';
    }, 4500);
  }

  /**
   * 13. Interactive Contact Modal & Form Handler
   */
  setupContactModal() {
    // Helper: Scroll smoothly to the Contact section
    const scrollToContact = (e) => {
      if (e) e.preventDefault();
      const target = document.getElementById('contact-me') || document.querySelector('section.contactSection, .sc-fwdjSP, .sc-iUeHef');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Highlight form smoothly
        const formBox = target.querySelector('.getInTouch, form');
        if (formBox) {
          formBox.style.transition = 'box-shadow 0.4s ease, border-color 0.4s ease';
          formBox.style.boxShadow = '0 0 0 4px rgba(244, 130, 30, 0.45)';
          setTimeout(() => {
            formBox.style.boxShadow = '';
          }, 1800);
        }

        // Focus first input field
        setTimeout(() => {
          const firstInput = target.querySelector('input');
          if (firstInput) firstInput.focus();
        }, 500);
      } else {
        // Fallback for subpages without a local contact section
        window.location.href = '/index.html#contact-me';
      }
    };

    // A. Bind all Header & Banner "Contact Me" buttons
    const headerButtons = document.querySelectorAll('.btnWrap button, .mobileMenuWrap button, button.contact-btn, .sc-bcPKhP.primary button');
    headerButtons.forEach(btn => {
      const text = (btn.innerText || '').trim().toLowerCase();
      if (text.includes('contact') || text.includes('connect')) {
        btn.style.cursor = 'pointer';
        btn.setAttribute('type', 'button');
        btn.addEventListener('click', scrollToContact);
      }
    });

    // Also bind any anchor links targeting #contact-me
    const contactLinks = document.querySelectorAll('a[href*="#contact-me"]');
    contactLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        if (document.getElementById('contact-me')) {
          scrollToContact(e);
        }
      });
    });

    // B. Bind Contact Form Submissions & Click Events
    const forms = document.querySelectorAll('form#contactForm, form.contactForm, section#contact-me form, .getInTouch form');
    forms.forEach(form => {
      const submitBtn = form.querySelector('button');
      if (submitBtn) {
        submitBtn.style.cursor = 'pointer';
        // Handle direct click on the button
        submitBtn.addEventListener('click', (e) => {
          e.preventDefault();
          form.dispatchEvent(new Event('submit', { cancelable: true }));
        });
      }

      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const inputs = form.querySelectorAll('input, textarea');
        const formData = {
          name: '',
          phone: '',
          email: '',
          subject: 'Website Inquiry',
          message: ''
        };

        inputs.forEach(input => {
          const type = input.type ? input.type.toLowerCase() : '';
          const placeholder = (input.placeholder || '').toLowerCase();
          const val = input.value.trim();

          if (type === 'email' || placeholder.includes('email')) {
            formData.email = val;
          } else if (type === 'number' || type === 'tel' || placeholder.includes('mobile') || placeholder.includes('phone')) {
            formData.phone = val;
          } else if (placeholder.includes('name')) {
            formData.name = val;
          } else if (placeholder.includes('city') || placeholder.includes('address')) {
            if (val) {
              formData.message += (formData.message ? ', ' : '') + `${input.placeholder}: ${val}`;
            }
          } else if (input.tagName.toLowerCase() === 'textarea') {
            formData.message = val;
          }
        });

        // Form Validations
        if (!formData.name) {
          this.showToast('Please enter your name.', 'error');
          const nameInput = form.querySelector('input[placeholder*="Name"], input[type="text"]');
          if (nameInput) nameInput.focus();
          return;
        }

        if (!formData.phone && !formData.email) {
          this.showToast('Please provide your mobile number or email address.', 'error');
          const contactInput = form.querySelector('input[placeholder*="Mobile"], input[type="number"], input[type="email"]');
          if (contactInput) contactInput.focus();
          return;
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          this.showToast('Please enter a valid email address.', 'error');
          const emailInput = form.querySelector('input[type="email"]');
          if (emailInput) emailInput.focus();
          return;
        }

        if (formData.phone && formData.phone.replace(/\D/g, '').length < 7) {
          this.showToast('Please enter a valid mobile number.', 'error');
          const phoneInput = form.querySelector('input[placeholder*="Mobile"], input[type="number"]');
          if (phoneInput) phoneInput.focus();
          return;
        }

        if (!formData.message) {
          formData.message = `Inquiry submitted by ${formData.name}`;
        }

        // Visual loading state
        const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<div class="textWrapper"><span class="btn-text">Sending...</span></div>';
        }

        try {
          const result = await window.apiService.submitContact(formData);
          if (result && result.success) {
            this.showToast('Thank you! Your message has been sent successfully.', 'success');
            form.reset();
          } else {
            this.showToast((result && result.message) || 'Could not send message. Please try again.', 'error');
          }
        } catch (err) {
          this.showToast('Network error while sending message. Please try again.', 'error');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHtml;
          }
        }
      });
    });
  }

  /**
   * 14. Global Navigation & Hamburger Drawer (Universal across Home & Subpages)
   */
  setupGlobalNavigation() {
    // 1. Ensure Mobile Drawer Overlay exists
    let overlay = document.getElementById('mobileDrawerOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'mobileDrawerOverlay';
      document.body.appendChild(overlay);
    }

    // 2. Ensure Mobile Drawer Container exists
    let drawer = document.getElementById('mobileDrawer');
    if (!drawer) {
      drawer = document.createElement('div');
      drawer.id = 'mobileDrawer';
      drawer.innerHTML = `
        <div class="mobileDrawerHeader">
          <h3>Kunal Tilak</h3>
          <span class="mobileDrawerClose" id="mobileDrawerClose">&times;</span>
        </div>
        <ul class="mobileDrawerNav">
          <li><a href="/index.html">Home</a></li>
          <li><a href="/index.html#press-coverage">About Kunal</a></li>
          <li><a href="/constituency-projects/index.html">Constituency Initiatives</a></li>
          <li><a href="/policy-and-parliamentary-work/index.html">In Parliament</a></li>
          <li><a href="/index.html#bjym">BJYM Youth Wing</a></li>
          <li><a href="/blog/index.html">Blog & Press</a></li>
          <li><a href="/index.html#videos">Gallery</a></li>
          <li><a href="#contact-me" style="color:#F4821E; font-weight:600;">Contact Kunal &rarr;</a></li>
          <li><a href="/admin" target="_blank" style="color:#F4821E; font-weight:bold;">Admin CMS &rarr;</a></li>
        </ul>
      `;
      document.body.appendChild(drawer);
    }

    // 3. Normalise links inside existing drawer to root-relative paths
    const drawerNav = drawer.querySelector('.mobileDrawerNav');
    if (drawerNav) {
      const linkMap = {
        'home': '/index.html',
        'about': '/index.html#press-coverage',
        'constituency': '/constituency-projects/index.html',
        'parliament': '/policy-and-parliamentary-work/index.html',
        'bjym': '/index.html#bjym',
        'blog': '/blog/index.html',
        'gallery': '/index.html#videos'
      };

      drawerNav.querySelectorAll('a').forEach(a => {
        const text = (a.innerText || '').toLowerCase();
        Object.keys(linkMap).forEach(key => {
          if (text.includes(key)) {
            a.setAttribute('href', linkMap[key]);
          }
        });
      });

      // Ensure Contact Kunal item is present
      if (!drawerNav.querySelector('a[href*="#contact-me"]')) {
        const contactLi = document.createElement('li');
        contactLi.innerHTML = '<a href="#contact-me" style="color:#F4821E; font-weight:600;">Contact Kunal &rarr;</a>';
        drawerNav.appendChild(contactLi);
      }
    }

    // 3.5. Remove any leftover Schemes Dashboard links in desktop header or subpage navbars
    document.querySelectorAll('.bannerLink a[href*="dashboard"], a[href*="dashboard/index.html"], a[href*="index.php/dashboard"]').forEach(a => {
      const li = a.closest('li');
      if (li) li.remove();
      else a.remove();
    });

    // 4. Open / Close Controllers
    const openDrawer = (e) => {
      if (e) e.preventDefault();
      drawer.classList.add('open');
      drawer.classList.add('active');
      overlay.classList.add('open');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    const closeDrawer = (e) => {
      if (e) e.preventDefault();
      drawer.classList.remove('open');
      drawer.classList.remove('active');
      overlay.classList.remove('open');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    };

    // 4.5. Remove any duplicate menu button placed right beside Contact Me
    document.querySelectorAll('.btnWrap .mobileMenu, header .btnWrap .mobileMenu').forEach(btn => {
      btn.remove();
    });

    // 5. Bind All Menu Buttons (.mobileMenu, div.mobileMenu, button.mobileMenu, .mobileMenu.lite, etc.)
    const mobileMenuBtns = document.querySelectorAll('.sNxBf .mobileMenu, div.mobileMenu, .mobileMenuWrap .mobileMenu');
    mobileMenuBtns.forEach(btn => {
      btn.style.cursor = 'pointer';
      // Prevent duplicate event handlers
      btn.removeEventListener('click', openDrawer);
      btn.addEventListener('click', openDrawer);
    });

    // 6. Bind Close Button & Overlay Backdrop
    const closeBtn = drawer.querySelector('#mobileDrawerClose') || document.getElementById('mobileDrawerClose');
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);

    // 7. Bind Drawer Nav Links
    if (drawerNav) {
      drawerNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
          const href = link.getAttribute('href') || '';
          closeDrawer();

          if (href.startsWith('#contact-me') || href === '#contact-me') {
            e.preventDefault();
            const target = document.getElementById('contact-me') || document.querySelector('section.contactSection, .sc-fwdjSP, .sc-iUeHef');
            if (target) {
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
              setTimeout(() => {
                const firstInput = target.querySelector('input');
                if (firstInput) firstInput.focus();
              }, 500);
            } else {
              window.location.href = '/index.html#contact-me';
            }
          }
        });
      });
    }

    // 8. ESC Key Handler
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDrawer();
    });
  }
}

// Global Singleton
window.uiRenderers = new UIRenderers();
