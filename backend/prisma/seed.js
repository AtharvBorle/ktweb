const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding from data_store.json...');

  const dataPath = path.join(__dirname, '..', 'data', 'data_store.json');
  let data = {};
  if (fs.existsSync(dataPath)) {
    try {
      data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    } catch (e) {
      console.warn('⚠️ Could not parse data_store.json:', e.message);
    }
  }

  // 1. Admin User
  const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);
  
  await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      name: 'Kunal Tilak Admin',
      role: 'SUPER_ADMIN'
    }
  });
  console.log('✅ Admin user verified/created (username: admin)');

  // 2. Site Settings
  if (data.settings) {
    const s = data.settings;
    const settingsData = {
      candidateName: s.candidateName || 'Kunal Tilak',
      designation: s.designation || 'MEMBER OF LEGISLATIVE ASSEMBLY',
      constituency: s.constituency || 'Kasba Peth Constituency, Pune',
      partyName: s.partyName || 'Bharatiya Janata Party',
      bjpLogo: s.bjpLogo || '/_next/static/media/BJP-logo.e6dbeb2f.png',
      candidateLogo: s.candidateLogo || '/_next/static/media/colorLogo.54e4cb38.png',
      votesCount: s.votesCount || '3.31 LAKH VOTES',
      votesDescription: s.votesDescription || 'Elected with immense support and trust from the citizens of Kasba Peth',
      shortBio: s.shortBio || 'Kunal Tilak serves as a dedicated leader and voice for youth...',
      contactEmail: s.contactEmail || 'office@kunaltilak.in',
      contactPhone: s.contactPhone || '+91 98765 43210',
      officeAddress: s.officeAddress || 'Office of Kunal Tilak, Kasba Peth, Pune, Maharashtra',
      whatsappChannel: s.whatsappChannel || 'https://whatsapp.com',
      whatsappQrCode: s.whatsappQrCode || '/_next/static/media/url-qr-code.7bed1177.png',
      instagramUrl: s.instagramUrl || 'https://instagram.com',
      facebookUrl: s.facebookUrl || 'https://facebook.com',
      youtubeUrl: s.youtubeUrl || 'https://youtube.com',
      linkedinUrl: s.linkedinUrl || 'https://linkedin.com',
      twitterUrl: s.twitterUrl || '',
      subpageHeaderBanner: s.subpageHeaderBanner || '/assets/images/aboutDetailBanner.png',
      keyHighlightsHeading: s.keyHighlightsHeading || 'Nurturing Civilizational Roots...',
      keyHighlightsImage: s.keyHighlightsImage || '/_next/static/media/keyHighLights1.56ca94e0.png',
      meetKunalSectionTitle: s.meetKunalSectionTitle || 'Meet Kunal',
      meetKunalImage: s.meetKunalImage || '/_next/static/media/meet-kunal.81e03335.png',
      initiativesSectionTitle: s.initiativesSectionTitle || 'EXPLORE VARIOUS INITIATIVES BY KUNAL TILAK',
      initiativesSectionDesc: s.initiativesSectionDesc || 'Kunal has introduced a range of schemes...',
      bjymSectionTitle: s.bjymSectionTitle || 'Bharatiya Janata Yuva Morcha',
      bjymMainDesc: s.bjymMainDesc || 'Kunal Tilak actively organizes youth welfare programs...',
      bjymMainImage: s.bjymMainImage || '/_next/static/media/bjymTS.d44621e8.png',
      bjymCard1Title: s.bjymCard1Title || 'Youth Leadership Summits',
      bjymCard1Desc: s.bjymCard1Desc || 'Organizing state-level youth conferences...',
      bjymCard2Title: s.bjymCard2Title || 'Citizen Assistance & Teleconsultation',
      bjymCard2Desc: s.bjymCard2Desc || 'Setting up citizen assistance helplines...',
      bjymCard3Title: s.bjymCard3Title || 'Karyakarta Skill Training',
      bjymCard3Desc: s.bjymCard3Desc || 'Developing skill development workshops...',
      parliamentPageTitle: s.parliamentPageTitle || 'Policy & Parliamentary Work of Kunal Tilak',
      parliamentIntroText: s.parliamentIntroText || 'Kunal Tilak has been a proactive and dedicated representative...',
      parliamentAttendance: s.parliamentAttendance || '92%',
      parliamentDebates: s.parliamentDebates || '35',
      parliamentQuestions: s.parliamentQuestions || '290',
      parliamentZeroHour: s.parliamentZeroHour || '12',
      projectsPageTitle: s.projectsPageTitle || 'Constituency Projects & Development in Kasba Peth',
      projectsIntroText: s.projectsIntroText || 'Key infrastructure, healthcare, education projects...',
      blogPageTitle: s.blogPageTitle || 'Blog, Press Releases & Media Coverage',
      blogIntroText: s.blogIntroText || 'Stay updated with the latest news...'
    };

    const existingSettings = await prisma.siteSetting.findFirst();
    if (!existingSettings) {
      await prisma.siteSetting.create({ data: settingsData });
      console.log('✅ Site settings created');
    }
  }

  // 3. Hero Section
  if (data.hero) {
    const h = data.hero;
    const heroData = {
      headline: h.headline || 'Kunal Tilak: Voice for Yuva & Progressive Governance',
      subheadline: h.subheadline || 'Grassroots Dedication, Visionary Development, Constituent Welfare',
      heroBio: h.heroBio || 'Kunal Tilak serves as the dedicated leader for Kasba Peth...',
      heroPortrait: h.heroPortrait || '/_next/static/media/bannerTS-removebg.75334595.png',
      heroBackground: h.heroBackground || '/_next/static/media/bannerBg.0a25a5ba.png',
      reportCardPdf: h.reportCardPdf || '/assets/downloads/5years-report-card.pdf',
      reportCardTitle: h.reportCardTitle || '5 Years Report Card'
    };

    const existingHero = await prisma.heroSection.findFirst();
    if (!existingHero) {
      await prisma.heroSection.create({ data: heroData });
      console.log('✅ Hero section created');
    }
  }

  // 4. Key Highlights
  if (Array.isArray(data.keyHighlights) && data.keyHighlights.length > 0) {
    const count = await prisma.keyHighlight.count();
    if (count === 0) {
      for (const item of data.keyHighlights) {
        await prisma.keyHighlight.create({
          data: {
            title: item.title,
            category: item.category || 'General',
            issue: item.issue || 'Focus Area',
            description: item.description,
            donateUrl: item.donateUrl || null,
            orderIndex: item.orderIndex || 0
          }
        });
      }
      console.log(`✅ Seeded ${data.keyHighlights.length} Key Highlights`);
    }
  }

  // 5. Meet Kunal Slides
  if (Array.isArray(data.meetKunal) && data.meetKunal.length > 0) {
    const count = await prisma.meetKunalSlide.count();
    if (count === 0) {
      for (const item of data.meetKunal) {
        await prisma.meetKunalSlide.create({
          data: {
            title: item.title,
            subtitle: item.subtitle || null,
            content: item.content,
            image: item.image || null,
            orderIndex: item.orderIndex || 0
          }
        });
      }
      console.log(`✅ Seeded ${data.meetKunal.length} Meet Kunal slides`);
    }
  }

  // 6. Initiatives
  if (Array.isArray(data.initiatives) && data.initiatives.length > 0) {
    const count = await prisma.initiative.count();
    if (count === 0) {
      for (const item of data.initiatives) {
        await prisma.initiative.create({
          data: {
            title: item.title,
            shortDesc: item.shortDesc || item.title,
            fullDesc: item.fullDesc || item.description || '',
            image: item.image || '',
            category: item.category || 'General',
            featured: Boolean(item.featured),
            readMoreUrl: item.readMoreUrl || null,
            orderIndex: item.orderIndex || 0
          }
        });
      }
      console.log(`✅ Seeded ${data.initiatives.length} Initiatives`);
    }
  }

  // 7. Sector Initiatives
  if (Array.isArray(data.sectorInitiatives) && data.sectorInitiatives.length > 0) {
    const count = await prisma.sectorInitiativeItem.count();
    if (count === 0) {
      for (const item of data.sectorInitiatives) {
        await prisma.sectorInitiativeItem.create({
          data: {
            sector: item.sector || 'education',
            title: item.title,
            issue: item.issue || null,
            description: item.description,
            orderIndex: item.orderIndex || 0
          }
        });
      }
      console.log(`✅ Seeded ${data.sectorInitiatives.length} Sector Initiatives`);
    }
  }

  // 8. Constituency Projects
  if (Array.isArray(data.constituencyProjects) && data.constituencyProjects.length > 0) {
    const count = await prisma.constituencyProjectItem.count();
    if (count === 0) {
      for (const item of data.constituencyProjects) {
        await prisma.constituencyProjectItem.create({
          data: {
            title: item.title,
            description: item.description,
            category: item.category || 'Infrastructure',
            orderIndex: item.orderIndex || 0
          }
        });
      }
      console.log(`✅ Seeded ${data.constituencyProjects.length} Constituency Projects`);
    }
  }

  // 9. Parliament Items
  if (Array.isArray(data.parliamentItems) && data.parliamentItems.length > 0) {
    const count = await prisma.parliamentItem.count();
    if (count === 0) {
      for (const item of data.parliamentItems) {
        await prisma.parliamentItem.create({
          data: {
            title: item.title,
            description: item.description,
            orderIndex: item.orderIndex || 0
          }
        });
      }
      console.log(`✅ Seeded ${data.parliamentItems.length} Parliament Items`);
    }
  }

  // 10. Blogs
  if (Array.isArray(data.blogs) && data.blogs.length > 0) {
    const count = await prisma.blogPost.count();
    if (count === 0) {
      for (const item of data.blogs) {
        await prisma.blogPost.create({
          data: {
            title: item.title,
            slug: item.slug || item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            excerpt: item.excerpt || '',
            content: item.content || '',
            image: item.image || '',
            author: item.author || 'Office of Kunal Tilak',
            category: item.category || 'Press Coverage',
            isPublished: item.isPublished !== false
          }
        });
      }
      console.log(`✅ Seeded ${data.blogs.length} Blogs`);
    }
  }

  // 11. Gallery Items
  if (Array.isArray(data.gallery) && data.gallery.length > 0) {
    const count = await prisma.galleryItem.count();
    if (count === 0) {
      for (const item of data.gallery) {
        await prisma.galleryItem.create({
          data: {
            title: item.title,
            type: item.type || 'image',
            url: item.url || '',
            thumbnail: item.thumbnail || null,
            category: item.category || 'Events',
            orderIndex: item.orderIndex || 0
          }
        });
      }
      console.log(`✅ Seeded ${data.gallery.length} Gallery items`);
    }
  }

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
