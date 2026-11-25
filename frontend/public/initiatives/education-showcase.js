/**
 * Minimalist Editorial Split Layout for /initiatives/:category
 * Supports: Education, Health, Sports, Leadership, Politics, and Initiatives
 * - Fixed non-scrolling containers; only the left topic list and right inner content body scroll
 * - Single-image carousel with Left/Right navigation arrows and auto-advance
 * - Dynamic "Other Categories" links below; responsive across desktop, tablet & mobile
 */
(function () {
  'use strict';

  var rawPath = window.location.pathname.toLowerCase().replace(/\/+$/, '').replace(/\/index\.html$/, '');
  var ROUTE_MAP = {
    '/initiatives/education': 'education',
    '/initiatives/health': 'health',
    '/initiatives/sports': 'sports',
    '/initiatives/leadership': 'leadership',
    '/initiatives/politics': 'politics',
    '/initiatives/initiative': 'initiatives',
    '/initiatives/initiatives': 'initiatives'
  };

  var activeCategoryKey = ROUTE_MAP[rawPath];
  if (!activeCategoryKey) {
    return;
  }

  var HOUR_MS = 3600 * 1000;
  var DAY_MS = 24 * HOUR_MS;
  var NOW = Date.now();

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatDate(ts) {
    try {
      return new Date(ts).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return '';
    }
  }

  var CATEGORY_DATA = {
    education: {
      heading: 'Education',
      heroIntro: "At the heart of Kunal Tilak's commitment to Kasba Peth, Pune lies a dedication to enhancing education opportunities for the youth of the constituency. Recognizing the critical role education plays in shaping young lives, he has championed a range of initiatives aimed at addressing various educational challenges.",
      items: [
        {
          id: 'edu-1',
          category: 'Scholarships',
          title: 'NaMo Vidyanidhi - Scholarships for Meritorious Students',
          publishedAt: NOW - 4 * HOUR_MS,
          relativeLabel: 'Recently',
          paragraphs: [
            'In response to financial constraints faced by underprivileged children aspiring for higher learning, the "NaMo Vidyanidhi" initiative offers annual scholarships of ₹10,000 each to 10,000 meritorious students across Kasba Peth, Pune.',
            'These scholarships are paid directly to the respective schools and educational institutions, ensuring financial assistance reaches deserving families promptly without middlemen, paperwork bottlenecks, or delays. To date, scholarships have already been disbursed to more than 1,000 student beneficiaries.',
            'Dedicated ward-level verification committees partner with school principals, class teachers, and parent representatives to identify diligent students from Class 8 through Class 10 who face economic hardship despite strong academic performance.',
            'Beyond tuition and examination fee relief, the NaMo Vidyanidhi network connects recipients with career mentors, textbook banks, and regular progress reviews so every scholar transitions smoothly into Class 11, diploma courses, and undergraduate studies.',
            'Citizen volunteers, alumni, and local community leaders continue to strengthen the endowment, transforming NaMo Vidyanidhi into a sustainable, citizen-driven movement for educational equity and social mobility.'
          ],
          photos: [
            {
              src: '/_next/static/media/best.f65e5294.jpg',
              caption: 'NaMo Vidyanidhi scholarship recognition & student interaction.'
            },
            {
              src: '/_next/static/media/pic2.5a946e85.jpg',
              caption: 'Parents, educators & students during annual grant distribution.'
            },
            {
              src: '/_next/static/media/slideone1.703831d3.png',
              caption: 'Community student felicitation and mentorship forum.'
            }
          ]
        },
        {
          id: 'edu-2',
          category: 'Smart Classrooms',
          title: 'Smart Classrooms & Visual Display Units in 28 Government Schools',
          publishedAt: NOW - 24 * HOUR_MS,
          relativeLabel: 'One day ago',
          paragraphs: [
            'In partnership with the Ladli Foundation, Kunal Tilak’s office is spearheading the installation of high-definition Visual Display Units and the creation of interactive Smart Classrooms across 28 Government schools in the constituency.',
            'Traditional chalk-and-board teaching often leaves abstract concepts in physics, geometry, biology, and geography difficult to visualize—especially for first-generation school learners. Smart Visual Display Units replace passive memorization with engaging, illustrated lessons.',
            'Each classroom receives curated bilingual digital modules aligned with the state and NCERT syllabus, enabling teachers to pause, annotate, demonstrate 3D scientific models, and conduct interactive classroom quizzes.',
            'To guarantee consistent daily usage, hands-on faculty orientation and technical maintenance visits are conducted throughout the academic calendar, resulting in higher student attendance and noticeable gains in STEM participation.'
          ],
          photos: [
            {
              src: '/_next/static/media/model-government-school.0512ceaa.jpg',
              caption: 'Smart classroom setup equipped with Visual Display Units.'
            },
            {
              src: '/_next/static/media/slideone3.17909d8f.png',
              caption: 'Interactive digital learning session in progress.'
            }
          ]
        },
        {
          id: 'edu-3',
          category: 'Free Coaching',
          title: 'NaMo Vidyakendra - Quality Education & After-School Coaching',
          publishedAt: NOW - 28 * HOUR_MS,
          relativeLabel: 'One day ago',
          paragraphs: [
            'The "NaMo Vidyakendra" initiative addresses inadequate access to quality exam preparation by providing completely free after-school coaching to Class 10 students, connecting them directly with experienced subject teachers.',
            'Many students from working-class neighborhoods lack quiet study spaces or affordable private tuition during their critical board examination year. NaMo Vidyakendra fills this gap with structured evening classes focused on Mathematics, Science, English, and Marathi.',
            'Small batch sizes allow mentors to identify individual learning gaps early, run weekly chapter assessments, and offer dedicated doubt-clearing clinics before board exams.',
            'Currently benefiting over 100 active learners, the program is steadily scaling neighborhood centers across the constituency to enroll 500 underperforming students and eliminate Class 10 dropouts altogether.'
          ],
          photos: []
        },
        {
          id: 'edu-4',
          category: 'Leadership',
          title: 'Youth Can Lead & School Leaders’ Council (40+ Schools)',
          publishedAt: NOW - 5 * DAY_MS,
          relativeLabel: 'One week ago',
          paragraphs: [
            'Youth Can Lead is an intensive 8-week civic leadership fellowship created to empower students through grassroots democracy, urban fieldwork, and direct exposure to policy-making and public administration.',
            'Over 300 young fellows have already graduated from the program, conducting neighborhood civic audits, studying public health and education delivery, and presenting actionable policy recommendations.',
            'Complementing the fellowship, Kunal Tilak established the School Leaders’ Council bringing together elected student representatives from 40+ top schools across the constituency to organize quarterly events on environment, arts, culture, and civic responsibility.'
          ],
          photos: [
            {
              src: '/_next/static/media/youth-can-lead.2458f56b.jpg',
              caption: 'Youth Can Lead fellows presenting civic policy proposals.'
            },
            {
              src: '/_next/static/media/slideone2.92da1120.png',
              caption: 'School Leaders’ Council quarterly summit & student dialogue.'
            }
          ]
        },
        {
          id: 'edu-5',
          category: 'Infrastructure',
          title: 'Model Government School Infrastructure Revamp',
          publishedAt: NOW - 18 * DAY_MS,
          relativeLabel: 'This month',
          paragraphs: [
            'Public schools are being transformed into state-of-the-art model government campuses through sustainable infrastructure upgrades—modernizing classrooms, libraries, science laboratories, and hygienic sanitation blocks.',
            'Working alongside architects, teachers, and parent-teacher associations, each campus redevelopment prioritizes natural ventilation, bright ergonomic seating, clean drinking water stations, and dedicated reading corners.',
            'Barrier-free wheelchair ramps and inclusive pathways have also been integrated so children of all abilities can access every floor and playground with dignity and independence.'
          ],
          photos: [
            {
              src: '/_next/static/media/model-government-school.0512ceaa.jpg',
              caption: 'Modernized public school campus and academic block.'
            },
            {
              src: '/_next/static/media/creating-accessible-public-places.2e160279.jpg',
              caption: 'Accessible ramps and barrier-free student pathways.'
            }
          ]
        },
        {
          id: 'edu-6',
          category: 'Student Welfare',
          title: 'Free Tablets, School Bags & Stationery for 250 Vulnerable Children',
          publishedAt: NOW - 24 * DAY_MS,
          relativeLabel: 'This month',
          paragraphs: [
            'At the School Leaders’ Summit, free digital learning tablets, durable school backpacks, and a complete year’s supply of textbooks and stationery were distributed to 250 school children who lost a parent during the COVID-19 pandemic.',
            'Each tablet was pre-loaded with structured offline video lessons and study guides so students could revise at home regardless of internet connectivity constraints.',
            'Beyond material support, dedicated case coordinators track school enrollment, coordinate fee waivers, and stay in regular contact with guardians so family hardship never disrupts a child’s right to education.'
          ],
          photos: []
        },
        {
          id: 'edu-7',
          category: 'Teacher & Youth Training',
          title: 'NEP Educator Support & Youth Financial Literacy Sessions',
          publishedAt: NOW - 120 * DAY_MS,
          relativeLabel: 'This year',
          paragraphs: [
            'Recognizing that empowered educators drive lasting academic transformation, targeted training workshops support school teachers in adopting interactive, competency-based pedagogy aligned with the National Education Policy (NEP 2020).',
            'In parallel, Youth Financial Literacy seminars introduce high-school and college students to personal budgeting, responsible digital payments, scholarship planning, and early entrepreneurship skills—preparing over 1,200 learners and educators for future readiness.'
          ],
          photos: [
            {
              src: '/_next/static/media/pic7.1e05b4cc.jpg',
              caption: 'Youth financial literacy and educator workshop session.'
            },
            {
              src: '/_next/static/media/pic5.9509c23c.jpg',
              caption: 'Interactive Q&A with teachers and student participants.'
            }
          ]
        },
        {
          id: 'edu-8',
          category: 'Student Support',
          title: 'Safe Return of Stranded Students & Constituency Summer Camp',
          publishedAt: NOW - 220 * DAY_MS,
          relativeLabel: 'This year',
          paragraphs: [
            'During the February 2022 crisis in Ukraine, Kunal Tilak’s office established a round-the-clock helpline coordinating directly with central ministries to ensure the safe evacuation and repatriation of more than 149 stranded students back home to their families.',
            'In addition, annual 15-day Summer Camps hosted across 7 constituency venues in partnership with 14 civic organizations have enriched over 1,000 children aged 10–16 through 16 creative, scientific, and leadership activities.'
          ],
          photos: [
            {
              src: '/_next/static/media/pic8.33ea3694.jpg',
              caption: 'Children participating in Summer Camp learning activities.'
            },
            {
              src: '/_next/static/media/slideone4.42506912.png',
              caption: '24x7 student assistance & coordination desk.'
            }
          ]
        }
      ]
    },

    health: {
      heading: 'Health',
      heroIntro: 'Guided by a vision of accessible and affordable healthcare for every household in Kasba Peth, Pune, Kunal Tilak has spearheaded Jan Aushadhi Kendra expansion, free dialysis facilities, preventive screening drives, and emergency medical support programs.',
      items: [
        {
          id: 'hlt-1',
          category: 'Affordable Medicines',
          title: '112 Jan Aushadhi Kendras — Generic Medicines at 70–90% Lower Cost',
          publishedAt: NOW - 6 * HOUR_MS,
          relativeLabel: 'Recently',
          paragraphs: [
            'Expanding affordable healthcare starts with making everyday medicines accessible to working families and senior citizens. From just 14 centers in 2019, the constituency network has expanded exponentially to 112 Pradhan Mantri Bharatiya Janaushadhi Kendras (PMBJKs).',
            'These stores supply WHO-GMP certified generic medicines—including cardiac, diabetes, hypertension, pediatric, and surgical supplies—at 70% to 90% reduced prices compared to branded equivalents.',
            'Over 2 lakh citizens benefit regularly from these stores, generating cumulative household medical savings exceeding ₹7 crore across the constituency.',
            'Regular quality checks, neighborhood store mapping, and pharmacist guidance desks ensure every resident knows where to find reliable, affordable prescriptions near their home.'
          ],
          photos: [
            {
              src: '/_next/static/media/pic3.f32ea54f.jpg',
              caption: 'Reviewing medicine stock and citizen affordability at Jan Aushadhi Kendra.'
            },
            {
              src: '/_next/static/media/namo-dialysis.4dc7c28a.jpg',
              caption: 'Public health facility expansion & community outreach.'
            }
          ]
        },
        {
          id: 'hlt-2',
          category: 'Free Critical Care',
          title: 'NaMo Dialysis Centre — Zero Billing Counter Free Haemodialysis',
          publishedAt: NOW - 2 * DAY_MS,
          relativeLabel: '2 days ago',
          paragraphs: [
            'Chronic kidney patients often face catastrophic recurring expenses of ₹2,500–₹3,500 per dialysis session multiple times every week. Under the Constituency Development Fund, the NaMo Dialysis Centre was established with no billing counter whatsoever.',
            'Equipped with modern multi-bed haemodialysis machines, RO water purification systems, and dedicated nephrology nursing staff, every procedure is provided completely free of charge to patients regardless of income paperwork.',
            'Partnering with public hospital doctors and charitable trusts, the centre also provides routine blood screening, dietary counseling, and post-dialysis medication support.'
          ],
          photos: [
            {
              src: '/_next/static/media/namo-dialysis.4dc7c28a.jpg',
              caption: 'NaMo Dialysis Centre providing completely free haemodialysis care.'
            },
            {
              src: '/_next/static/media/pic4.4ced51df.jpg',
              caption: 'Inspecting hospital wards and patient support counters.'
            }
          ]
        },
        {
          id: 'hlt-3',
          category: 'Telemedicine',
          title: 'Biggest National Teleconsultation Helpline (40,000+ Consultations)',
          publishedAt: NOW - 9 * DAY_MS,
          relativeLabel: '1 week ago',
          paragraphs: [
            'Launched to connect families swiftly with qualified physicians during peak healthcare pressure, the National Teleconsultation Helpline mobilized volunteer specialist doctors across general medicine, pediatrics, pulmonology, and mental wellness.',
            'Providing over 40,000 free remote consultations, the helpline guided families on home-care monitoring, medicine dosage, oxygen support, and hospital bed referrals without exposing patients to crowded clinics.',
            'Digital prescription follow-ups and multilingual volunteer triage operators ensured senior citizens and first-time callers received compassionate, timely medical guidance.'
          ],
          photos: []
        },
        {
          id: 'hlt-4',
          category: 'Preventive Care',
          title: 'Ward-Level Mega Health Checkup, Eye Care & Cataract Camps',
          publishedAt: NOW - 22 * DAY_MS,
          relativeLabel: 'This month',
          paragraphs: [
            'Regular weekend diagnostic camps bring free blood sugar screening, ECG checkups, blood pressure monitoring, dental checkups, and comprehensive vision testing directly into neighborhood community halls.',
            'Over 4,500 senior citizens and daily-wage workers have received free prescription spectacles and zero-cost cataract surgeries through partnerships with charitable eye hospitals.',
            'Early detection follow-up cards link patients requiring ongoing care directly to nearby primary health centers and Jan Aushadhi stores.'
          ],
          photos: [
            {
              src: '/_next/static/media/pic1.5b8a4db1.jpg',
              caption: 'Doctors & volunteers serving residents at a ward health camp.'
            },
            {
              src: '/_next/static/media/pic6.7491cb91.jpg',
              caption: 'Vision screening and citizen wellness outreach.'
            }
          ]
        },
        {
          id: 'hlt-5',
          category: 'Nutrition & Blood Drives',
          title: 'Maternal Nutrition Kits, TB Support & Mega Blood Donation Drives',
          publishedAt: NOW - 95 * DAY_MS,
          relativeLabel: 'This year',
          paragraphs: [
            'Under the Nikshay Mitra TB elimination drive and maternal wellness outreach, nutritious food baskets containing pulses, millets, fortified grains, and supplements are delivered monthly to patients undergoing treatment.',
            'Quarterly Mega Blood Donation Camps organized with youth volunteers and government blood banks collect thousands of life-saving blood units to keep city trauma and thalassemia reserves well stocked year-round.'
          ],
          photos: []
        }
      ]
    },

    sports: {
      heading: 'Sports',
      heroIntro: 'Committed to nurturing sporting talent and active community spaces across Kasba Peth, Pune, Kunal Tilak supports grassroots tournaments, school athletics, modern turf upgrades, and athlete training scholarships for youth.',
      items: [
        {
          id: 'spt-1',
          category: 'Constituency Games',
          title: 'MP Sports Utsava — Empowering Grassroots Athletes Across Wards',
          publishedAt: NOW - 1 * DAY_MS,
          relativeLabel: '1 day ago',
          paragraphs: [
            'MP Sports Utsava unites thousands of young athletes across athletics, kabaddi, kho-kho, cricket, badminton, volleyball, chess, and wrestling on an inclusive, professionally officiated constituency stage.',
            'By providing free tournament registration, official kits, certified referees, and electronic timing equipment, talented youngsters from neighborhood grounds gain real competitive exposure without financial barriers.',
            'Scouts and district sports coaches attend the finals to mentor standout performers toward state-level camps and Khelo India trials.'
          ],
          photos: [
            {
              src: '/_next/static/media/slideone5.1a0ba9df.png',
              caption: 'MP Sports Utsava opening ceremony and youth athletes.'
            },
            {
              src: '/_next/static/media/pic8.33ea3694.jpg',
              caption: 'Student track and team sport competitions.'
            }
          ]
        },
        {
          id: 'spt-2',
          category: 'School Athletics',
          title: 'Sarkari Shaala Kreedotsava — Annual Government School Sports Meet',
          publishedAt: NOW - 6 * DAY_MS,
          relativeLabel: 'One week ago',
          paragraphs: [
            'Organized alongside the School Leaders’ Council, Sarkari Shaala Kreedotsava ensures students in government and municipal schools enjoy the excitement of a stadium-grade annual sports festival.',
            'Over 40 schools participate in track sprints, relay races, tug-of-war, and traditional Indian games—giving first-time student competitors medals, sports footwear, and team jerseys.',
            'Physical education teachers collaborate before each meet to run preparatory fitness clinics for participating schools.'
          ],
          photos: [
            {
              src: '/_next/static/media/slideone6.d9d05f95.png',
              caption: 'Government school students competing in Sarkari Shaala Kreedotsava.'
            },
            {
              src: '/_next/static/media/best.f65e5294.jpg',
              caption: 'Award ceremony celebrating young school champions.'
            }
          ]
        },
        {
          id: 'spt-3',
          category: 'Sports Infrastructure',
          title: 'Upgrading Neighborhood Playgrounds, Open Gyms & Floodlit Courts',
          publishedAt: NOW - 19 * DAY_MS,
          relativeLabel: 'This month',
          paragraphs: [
            'Safe, accessible community grounds are essential for a healthy city. Under local area development allocations, neighborhood maidans have been upgraded with leveled running tracks, LED floodlighting for evening play, and weatherproof open-air fitness equipment.',
            'Dedicated synthetic badminton and volleyball courts give youth and senior morning walkers clean, well-maintained recreational spaces right inside residential wards.'
          ],
          photos: []
        },
        {
          id: 'spt-4',
          category: 'Athlete Support',
          title: 'Sports Kit Grants & Nutrition Support for District-Level Youth',
          publishedAt: NOW - 65 * DAY_MS,
          relativeLabel: '2 months ago',
          paragraphs: [
            'Promising student athletes representing the district in track, wrestling, swimming, and martial arts receive targeted equipment stipends for spikes, racquets, training gear, and travel expenses.',
            'Sports nutrition sessions help young players and their parents balance academics with disciplined athletic recovery.'
          ],
          photos: [
            {
              src: '/_next/static/media/pic5.9509c23c.jpg',
              caption: 'Encouraging young district sports achievers.'
            }
          ]
        },
        {
          id: 'spt-5',
          category: 'Community Fitness',
          title: 'International Yoga Day & Fit India Sunday Morning Walks',
          publishedAt: NOW - 150 * DAY_MS,
          relativeLabel: 'This year',
          paragraphs: [
            'Weekly morning yoga workshops and Fit India neighborhood walks bring together students, families, and senior citizens across local parks to cultivate preventive wellness and active urban lifestyles.'
          ],
          photos: []
        }
      ]
    },

    leadership: {
      heading: 'Leadership',
      heroIntro: 'Through initiatives like Youth Can Lead and neighborhood civic forums, Kunal Tilak empowers young citizens with hands-on exposure to democratic governance, public policy formulation, and community problem-solving.',
      items: [
        {
          id: 'ldr-1',
          category: 'Youth Governance',
          title: 'Youth Can Lead — 8-Week Civic & Policy Fellowship',
          publishedAt: NOW - 12 * HOUR_MS,
          relativeLabel: 'Recently',
          paragraphs: [
            'Designed to bridge the gap between idealistic students and hands-on public administration, the Youth Can Lead fellowship immerses college and senior-school participants in real constituency governance over an 8-week curriculum.',
            'Fellows work alongside urban planners, municipal engineers, healthcare coordinators, and parliamentary researchers to audit public services and draft actionable civic white papers.',
            'Over 300 fellows have graduated from the program, many going on to lead student councils, social enterprises, and civic-tech initiatives.'
          ],
          photos: [
            {
              src: '/_next/static/media/youth-can-lead.2458f56b.jpg',
              caption: 'Youth Can Lead fellows engaging in grassroots policy workshops.'
            },
            {
              src: '/_next/static/media/slideone1.703831d3.png',
              caption: 'Cohort presentation and civic leadership dialogue.'
            }
          ]
        },
        {
          id: 'ldr-2',
          category: 'National Youth Wing',
          title: 'Youngest National President of BJYM & 1,50,000 km Youth Outreach',
          publishedAt: NOW - 4 * DAY_MS,
          relativeLabel: '4 days ago',
          paragraphs: [
            'Serving as the youngest National President of the Bharatiya Janata Yuva Morcha (BJYM), Kunal Tilak has traveled over 1,50,000 km across 21 states to mentor young organizers, students, and first-time voters.',
            'Under his leadership, structured grassroots campaigns connected millions of young Indians with national development priorities, entrepreneurship schemes, and civic volunteering.'
          ],
          photos: [
            {
              src: '/_next/static/media/bjymTS.d44621e8.png',
              caption: 'Engaging youth volunteers and state chapters nationwide.'
            },
            {
              src: '/_next/static/media/slideone7.71dbd690.png',
              caption: 'Addressing young leaders on nation building and governance.'
            }
          ]
        },
        {
          id: 'ldr-3',
          category: 'Cadre Training',
          title: 'Karyakarta Training Modules & BJYM Vidhya Kamal App',
          publishedAt: NOW - 16 * DAY_MS,
          relativeLabel: 'This month',
          paragraphs: [
            'Building institutionally grounded young leaders requires continuous education. As the first National President to launch a standardized digital training module via the Vidhya Kamal App, Kunal Tilak enabled tens of thousands of karyakartas to study constitutional history, public policy, and grassroots service delivery.',
            'District-level leadership bootcamps pair theoretical sessions with hands-on community problem solving.'
          ],
          photos: []
        },
        {
          id: 'ldr-4',
          category: 'Student Councils',
          title: 'School Leaders’ Council — Empowering Next-Gen Civic Voices',
          publishedAt: NOW - 45 * DAY_MS,
          relativeLabel: '1 month ago',
          paragraphs: [
            'Representing 40+ top constituency schools, the School Leaders’ Council trains young prefects and student captains in consensus building, environmental stewardship, and peer welfare coordination.'
          ],
          photos: [
            {
              src: '/_next/static/media/pic2.5a946e85.jpg',
              caption: 'Student council captains collaborating on quarterly civic drives.'
            }
          ]
        },
        {
          id: 'ldr-5',
          category: 'Legal & Civic Advocacy',
          title: 'Standing Up for Pro-India Voices & Public Accountability',
          publishedAt: NOW - 140 * DAY_MS,
          relativeLabel: 'This year',
          paragraphs: [
            'Drawing on his background as a practicing advocate and founding partner of Trust Law, Kunal Tilak has championed free-speech accountability, legal aid for citizens facing unfair targeting, and transparent governance mechanisms.'
          ],
          photos: []
        }
      ]
    },

    politics: {
      heading: 'Politics',
      heroIntro: 'Rooted in transparent public service and constituent-first representation, Kunal Tilak bridges grassroots feedback with legislative action, urban infrastructure delivery, and responsive ward-level grievance redressal.',
      items: [
        {
          id: 'pol-1',
          category: 'Parliamentary Performance',
          title: 'Best Debutant Parliamentarian — 347 Questions & 32 Debates',
          publishedAt: NOW - 8 * HOUR_MS,
          relativeLabel: 'Recently',
          paragraphs: [
            'Recognized with the Lokmat "Best Debutant Parliamentarian of the Year" award, Kunal Tilak has consistently used the floor of Parliament to champion urban mobility, student welfare, healthcare access, and digital innovation.',
            'With 347 parliamentary questions raised and active participation in 32 key legislative debates—maintained alongside high attendance—every session translates citizen feedback from ward meetings into national policy action.',
            'Private Member inputs and standing committee interventions have helped accelerate funding for urban rail, generic pharmacies, and youth startup ecosystems.'
          ],
          photos: [
            {
              src: '/_next/static/media/slideone8.2150898b.png',
              caption: 'Representing constituency priorities in legislative forums.'
            },
            {
              src: '/_next/static/media/slideone2.92da1120.png',
              caption: 'Public policy discussion and citizen engagement.'
            }
          ]
        },
        {
          id: 'pol-2',
          category: 'Urban Infrastructure Advocacy',
          title: 'Fast-Tracking Suburban Rail & Metro Phase 2A, 2B & Phase 3',
          publishedAt: NOW - 3 * DAY_MS,
          relativeLabel: '3 days ago',
          paragraphs: [
            'Through persistent coordination with Central Ministries and technical task forces, approvals were expedited for the long-pending Suburban Rail network delayed for over four decades.',
            'Work on Metro Phases 2A and 2B—serving approximately 7.5 lakh daily commuters—and central clearances for Phase 3 along the Outer Ring Road represent a generational leap in urban public transport.'
          ],
          photos: [
            {
              src: '/_next/static/media/keyHighLights1.56ca94e0.png',
              caption: 'Advancing urban mobility and modern transit infrastructure.'
            }
          ]
        },
        {
          id: 'pol-3',
          category: 'National Pride',
          title: 'Tiranga Yatra at Lal Chowk, Srinagar',
          publishedAt: NOW - 14 * DAY_MS,
          relativeLabel: '2 weeks ago',
          paragraphs: [
            'Leading young patriots from across every corner of India, BJYM hoisted the National Tricolour at Lal Chowk in Srinagar—reaffirming national unity, peace, and youth confidence in a resurgent Bharat.',
            'The campaign resonated deeply with young citizens, celebrating constitutional integration and civic harmony.'
          ],
          photos: [
            {
              src: '/_next/static/media/slideone4.42506912.png',
              caption: 'Youth march and Tiranga celebration.'
            }
          ]
        },
        {
          id: 'pol-4',
          category: 'Citizen Connect',
          title: 'Janata Darbar & 24x7 Constituency Grievance Redressal Desk',
          publishedAt: NOW - 55 * DAY_MS,
          relativeLabel: '2 months ago',
          paragraphs: [
            'Weekly open-door citizen interaction sessions and digital grievance tracking ensure municipal drainage, streetlight repairs, ration cards, and senior-citizen pension issues are resolved with clear timelines and accountability.'
          ],
          photos: []
        },
        {
          id: 'pol-5',
          category: 'Mandate & Trust',
          title: 'Historic Mandate of 3.31 Lakh Votes & People-First Governance',
          publishedAt: NOW - 180 * DAY_MS,
          relativeLabel: 'This year',
          paragraphs: [
            'Elected with an unprecedented winning margin of 3.31 Lakh votes, the mandate reflects a shared vision combining civilizational roots, modern urban planning, and transparent service delivery for every neighborhood.'
          ],
          photos: []
        }
      ]
    },

    initiatives: {
      heading: 'Initiatives',
      heroIntro: 'Bringing together citizen welfare, housing, digital public services, women-led enterprise, and urban sustainability, these flagship initiatives drive inclusive and measurable development across Kasba Peth, Pune.',
      items: [
        {
          id: 'ini-1',
          category: 'Housing & Citizens',
          title: 'Completion of Mantri Serenity Project (3,000+ Families Got Homes)',
          publishedAt: NOW - 5 * HOUR_MS,
          relativeLabel: 'Recently',
          paragraphs: [
            'Stalled since 2020 due to acute funding hurdles, the Mantri Serenity residential project left over 3,000 middle-class homebuyer families waiting anxiously while paying both rent and EMIs.',
            'Through proactive intervention with the Government of India’s SWAMIH Special Window Investment Fund, the project secured last-mile rescue financing—becoming the country’s first residential project completed under the scheme.',
            'In December 2022, over 3,000 families formally received Occupation Certificates and moved into their long-awaited homes.'
          ],
          photos: [
            {
              src: '/_next/static/media/mantri-serenity.77390ddf.jpg',
              caption: 'Mantri Serenity residential project completed via SWAMIH Fund.'
            },
            {
              src: '/_next/static/media/pic6.7491cb91.jpg',
              caption: 'Homebuyer interaction and civic resolution meet.'
            }
          ]
        },
        {
          id: 'ini-2',
          category: 'Inclusivity',
          title: 'Creating Accessible Public Places — 100+ Wheelchair Ramps Installed',
          publishedAt: NOW - 3 * DAY_MS,
          relativeLabel: '3 days ago',
          paragraphs: [
            'In a collaborative partnership with NGO RampMyCity and delivery partners, wheelchair ramps were constructed at more than 100 clinics, pharmacies, banks, temples, and neighborhood shops across the constituency.',
            'By removing physical step barriers, senior citizens and persons with disabilities gained dignified, independent access to essential everyday neighborhood services.'
          ],
          photos: [
            {
              src: '/_next/static/media/creating-accessible-public-places.2e160279.jpg',
              caption: 'Accessible public ramps built for senior citizens and persons with disabilities.'
            }
          ]
        },
        {
          id: 'ini-3',
          category: 'Urban Housing',
          title: 'Pradhan Mantri Awas Yojana — 1.90 Lakh Affordable Urban Homes',
          publishedAt: NOW - 11 * DAY_MS,
          relativeLabel: '1 week ago',
          paragraphs: [
            'Regular project review meetings have accelerated affordable urban housing delivery under Pradhan Mantri Awas Yojana (PMAY), supporting 1,90,646 homes with over ₹3,239 crore in public investment.',
            'Dedicated citizen facilitation kiosks assist first-time homebuyers with documentation, interest subsidy tracking, and bank coordination.'
          ],
          photos: []
        },
        {
          id: 'ini-4',
          category: 'Environment & Water',
          title: 'Lake Rejuvenation, Rainwater Harvesting & 25,000 Urban Saplings',
          publishedAt: NOW - 35 * DAY_MS,
          relativeLabel: '1 month ago',
          paragraphs: [
            'Working with resident welfare associations and environmental volunteers, neighborhood parks and lakes are undergoing silt-clearing, bund strengthening, and rainwater recharge pit installation.',
            'Over 25,000 native saplings have been planted and geo-tagged across avenues, schools, and temple precincts to expand urban shade and groundwater replenishment.'
          ],
          photos: [
            {
              src: '/_next/static/media/pic1.5b8a4db1.jpg',
              caption: 'Community tree-planting and neighborhood greening drive.'
            }
          ]
        },
        {
          id: 'ini-5',
          category: 'Digital Citizen Seva',
          title: 'Ward Digital Seva Kendras for Senior Pensions & Ration Services',
          publishedAt: NOW - 110 * DAY_MS,
          relativeLabel: 'This year',
          paragraphs: [
            'Mobile and ward-level citizen facilitation camps bring Ayushman Bharat health cards, e-Shram registration, senior citizen IDs, and banking KYC support right to neighborhood doorsteps—saving citizens repeated trips to government offices.'
          ],
          photos: []
        }
      ]
    }
  };

  var ALL_CATEGORIES = [
    { key: 'education', label: 'Education', href: '/initiatives/education' },
    { key: 'health', label: 'Health', href: '/initiatives/health' },
    { key: 'sports', label: 'Sports', href: '/initiatives/sports' },
    { key: 'leadership', label: 'Leadership', href: '/initiatives/leadership' },
    { key: 'politics', label: 'Politics', href: '/initiatives/politics' },
    { key: 'initiatives', label: 'Initiatives', href: '/initiatives/initiative' }
  ];

  function getOtherCategories() {
    var data = window.uiRenderers && window.uiRenderers.state && window.uiRenderers.state.data;
    var pillars = data && Array.isArray(data.initiativePillars) ? data.initiativePillars : null;
    if (pillars && pillars.length) {
      var mapped = pillars
        .filter(function (p) {
          var link = (p.link || '').toLowerCase().replace(/\/+$/, '').replace(/\/index\.html$/, '');
          var mappedKey = ROUTE_MAP[link];
          if (mappedKey) return mappedKey !== activeCategoryKey;
          var titleKey = (p.title || '').trim().toLowerCase();
          return titleKey !== activeCategoryKey && !(activeCategoryKey === 'initiatives' && titleKey === 'initiative');
        })
        .map(function (p) {
          var link = (p.link || '').toLowerCase().replace(/\/+$/, '').replace(/\/index\.html$/, '');
          var mappedKey = ROUTE_MAP[link];
          if (mappedKey && CATEGORY_DATA[mappedKey]) {
            return {
              label: CATEGORY_DATA[mappedKey].heading,
              href: p.link || '/initiatives/' + mappedKey
            };
          }
          var rawTitle = (p.title || '').trim();
          var label = rawTitle.toLowerCase() === 'initiative'
            ? 'Initiatives'
            : (rawTitle ? rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1) : 'Initiative');
          return {
            label: label,
            href: p.link || '/index.html#myBlog'
          };
        });
      if (mapped.length) return mapped;
    }

    return ALL_CATEGORIES.filter(function (c) {
      return c.key !== activeCategoryKey;
    });
  }

  function getItemPhotos(item) {
    if (Array.isArray(item.photos) && item.photos.length) return item.photos;
    if (item.photo && item.photo.src) return [item.photo];
    return [];
  }

  function removeRecentlyPosted(container) {
    if (!container) return;
    var nodes = Array.prototype.slice.call(container.children);
    nodes.forEach(function (el) {
      if (el.id === 'educationShowcaseRoot') return;
      if (
        el.classList.contains('sc-jSwlEQ') ||
        el.classList.contains('bottomWrap') ||
        (el.tagName && el.tagName.toLowerCase() === 'p')
      ) {
        el.remove();
      }
    });
  }

  var isSyncingHero = false;

  function syncHeroBanner(categoryConfig) {
    if (!categoryConfig || isSyncingHero) return;
    isSyncingHero = true;
    try {
      var verticalLabel = categoryConfig.heading.toUpperCase();
      var featuredSpan = document.querySelector('.efEiml .featured span');
      if (featuredSpan && featuredSpan.textContent !== verticalLabel) {
        featuredSpan.textContent = verticalLabel;
      }

      var titleLink = document.querySelector('.efEiml .content > a');
      if (titleLink && titleLink.textContent !== categoryConfig.heading) {
        titleLink.textContent = categoryConfig.heading;
      }

      var introPara = document.querySelector('.efEiml .mediaSplit p');
      if (introPara && categoryConfig.heroIntro && introPara.textContent !== categoryConfig.heroIntro) {
        introPara.textContent = categoryConfig.heroIntro;
      }

      var targetDocTitle = categoryConfig.heading + ' | Kunal Tilak Initiatives';
      if (document.title !== targetDocTitle) {
        document.title = targetDocTitle;
      }
    } finally {
      isSyncingHero = false;
    }
  }

  function initCategoryShowcase() {
    var categoryConfig = CATEGORY_DATA[activeCategoryKey] || CATEGORY_DATA.education;
    syncHeroBanner(categoryConfig);

    var container = document.querySelector('.sc-jdkVqZ .container');
    if (!container) return;

    removeRecentlyPosted(container);

    if (document.getElementById('educationShowcaseRoot')) return;

    var root = document.createElement('div');
    root.id = 'educationShowcaseRoot';
    container.appendChild(root);

    var items = (categoryConfig.items || []).slice();
    var lastCmsFingerprint = '';

    var state = {
      selectedId: items.length ? String(items[0].id) : '',
      photoIndex: 0
    };

    var autoSlideTimer = null;
    var isCarouselPaused = false;

    function resolvePhotoSrc(src) {
      if (!src) return '';
      if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://')) return src;
      if ((src.startsWith('/uploads') || src.startsWith('uploads/')) && window.apiService && typeof window.apiService.getBackendOrigin === 'function') {
        var origin = window.apiService.getBackendOrigin();
        if (origin) {
          return origin + (src.startsWith('/') ? src : '/' + src);
        }
      }
      return src;
    }

    function normalizeCmsSector(sector) {
      var s = String(sector || '').trim().toLowerCase();
      return s === 'initiative' ? 'initiatives' : s;
    }

    function mapCmsSectorItem(raw) {
      var paragraphs = Array.isArray(raw.paragraphs) && raw.paragraphs.length
        ? raw.paragraphs.map(function (p) { return String(p || '').trim(); }).filter(Boolean)
        : String(raw.description || '').split(/\r?\n\s*\r?\n|\r?\n/).map(function (p) { return p.trim(); }).filter(Boolean);

      var photos = Array.isArray(raw.photos)
        ? raw.photos
            .filter(function (p) { return p && p.src; })
            .map(function (p) {
              return {
                src: resolvePhotoSrc(String(p.src).trim()),
                caption: String(p.caption || '').trim()
              };
            })
        : [];

      return {
        id: String(raw.id),
        category: String(raw.category || raw.issue || 'Initiative').trim(),
        title: String(raw.title || '').trim(),
        publishedAt: raw.publishedAt ? Number(raw.publishedAt) : NOW,
        relativeLabel: String(raw.relativeLabel || 'Recently').trim(),
        paragraphs: paragraphs,
        photos: photos
      };
    }

    function applyCmsData(cmsData) {
      if (!cmsData || typeof cmsData !== 'object') return false;
      var changed = false;

      if (Array.isArray(cmsData.initiativePillars)) {
        var matchedPillar = cmsData.initiativePillars.find(function (p) {
          var pk = normalizeCmsSector(p.key || '');
          var linkPath = String(p.link || '').toLowerCase().replace(/\/+$/, '').replace(/\/index\.html$/, '');
          var mapped = ROUTE_MAP[linkPath] || '';
          var titleKey = normalizeCmsSector(p.title || '');
          return pk === activeCategoryKey || mapped === activeCategoryKey || titleKey === activeCategoryKey;
        });
        if (matchedPillar && matchedPillar.intro && String(matchedPillar.intro).trim() !== categoryConfig.heroIntro) {
          categoryConfig.heroIntro = String(matchedPillar.intro).trim();
          syncHeroBanner(categoryConfig);
        }
      }

      if (Array.isArray(cmsData.sectorInitiatives)) {
        var matchedItems = cmsData.sectorInitiatives
          .filter(function (item) {
            return normalizeCmsSector(item.sector) === activeCategoryKey;
          })
          .map(mapCmsSectorItem);

        var fingerprint = JSON.stringify(matchedItems);
        if (fingerprint !== lastCmsFingerprint) {
          lastCmsFingerprint = fingerprint;
          items = matchedItems;
          var stillExists = items.some(function (it) { return String(it.id) === String(state.selectedId); });
          if (!stillExists) {
            state.selectedId = items.length ? String(items[0].id) : '';
            state.photoIndex = 0;
          }
          changed = true;
        }
      }
      return changed;
    }

    function stopAutoSlide() {
      if (autoSlideTimer) {
        clearInterval(autoSlideTimer);
        autoSlideTimer = null;
      }
    }

    function getSelectedItem() {
      for (var i = 0; i < items.length; i++) {
        if (String(items[i].id) === String(state.selectedId)) return items[i];
      }
      return items[0] || null;
    }

    // Update ONLY the active photo inside the single-image carousel (no scroll jump!)
    function updateCarouselSlide(newIdx) {
      var selected = getSelectedItem();
      if (!selected) return;
      var photos = getItemPhotos(selected);
      if (!photos.length) return;

      var count = photos.length;
      state.photoIndex = ((newIdx % count) + count) % count;
      var activePhoto = photos[state.photoIndex];

      var imgEl = document.getElementById('eduCarouselImg');
      var capEl = document.getElementById('eduCarouselCaption');
      var counterEl = document.getElementById('eduCarouselCounter');
      if (imgEl) {
        imgEl.src = activePhoto.src;
        imgEl.alt = activePhoto.caption || selected.title;
      }
      if (capEl) {
        capEl.textContent = activePhoto.caption || '';
      }
      if (counterEl) {
        counterEl.textContent = (state.photoIndex + 1) + ' / ' + count;
      }

      var dots = root.querySelectorAll('.eduCarouselDot');
      dots.forEach(function (dot, i) {
        if (i === state.photoIndex) dot.classList.add('active');
        else dot.classList.remove('active');
      });
    }

    function startAutoSlide() {
      stopAutoSlide();
      var selected = getSelectedItem();
      if (!selected) return;
      var photos = getItemPhotos(selected);
      if (photos.length <= 1) return;

      autoSlideTimer = setInterval(function () {
        if (!isCarouselPaused && document.body.contains(root)) {
          updateCarouselSlide(state.photoIndex + 1);
        }
      }, 4200);
    }

    function render(resetDetailScroll) {
      var prevList = root.querySelector('.eduSimpleList');
      var savedListScroll = prevList ? prevList.scrollTop : 0;
      var prevBody = root.querySelector('.eduDetailScrollBody');
      var savedBodyScroll = (!resetDetailScroll && prevBody) ? prevBody.scrollTop : 0;

      var selected = getSelectedItem();
      if (selected) {
        state.selectedId = selected.id;
      }

      var leftListHtml = '';
      if (!items.length) {
        leftListHtml = '<div class="eduSimpleEmpty">No initiatives published yet.</div>';
      } else {
        leftListHtml = items.map(function (item) {
          var isActive = selected && String(item.id) === String(selected.id);
          return (
            '<button type="button" class="eduSimpleListItem ' + (isActive ? 'active' : '') + '" data-item-id="' + escapeHtml(item.id) + '" title="' + escapeHtml(item.title) + '">' +
              '<span class="eduSimpleItemCategory">' + escapeHtml(item.category) + '</span>' +
              '<div class="eduSimpleDivider"></div>' +
              '<span class="eduSimpleItemTitle">' + escapeHtml(item.title) + '</span>' +
            '</button>'
          );
        }).join('');
      }

      var rightDetailHtml = '';
      if (!selected) {
        rightDetailHtml = '<div class="eduSimpleDetail"><div class="eduSimpleEmpty">Select a topic from the left to read more.</div></div>';
      } else {
        var mediaHtml = '';
        var photos = getItemPhotos(selected);
        if (photos.length > 0) {
          var safeIdx = Math.min(state.photoIndex, photos.length - 1);
          state.photoIndex = safeIdx;
          var activePhoto = photos[safeIdx];
          var hasMulti = photos.length > 1;

          var arrowsHtml = hasMulti
            ? '<button type="button" class="eduCarouselArrow prev" data-carousel-dir="-1" aria-label="Previous image">&#8249;</button>' +
              '<button type="button" class="eduCarouselArrow next" data-carousel-dir="1" aria-label="Next image">&#8250;</button>' +
              '<span class="eduCarouselCounter" id="eduCarouselCounter">' + (safeIdx + 1) + ' / ' + photos.length + '</span>'
            : '';

          var dotsHtml = hasMulti
            ? '<div class="eduCarouselDots">' + photos.map(function (_, idx) {
                return '<button type="button" class="eduCarouselDot ' + (idx === safeIdx ? 'active' : '') + '" data-carousel-dot="' + idx + '" aria-label="Show image ' + (idx + 1) + '"></button>';
              }).join('') + '</div>'
            : '';

          mediaHtml =
            '<div class="eduSimpleMediaWrap" id="eduMediaCarousel">' +
              '<div class="eduCarouselViewport">' +
                '<img class="eduSimplePhoto" id="eduCarouselImg" src="' + escapeHtml(activePhoto.src) + '" alt="' + escapeHtml(activePhoto.caption || selected.title) + '" />' +
                arrowsHtml +
              '</div>' +
              '<div class="eduCarouselFooter">' +
                '<div class="eduSimpleMediaCaption" id="eduCarouselCaption">' + escapeHtml(activePhoto.caption || '') + '</div>' +
                dotsHtml +
              '</div>' +
            '</div>';
        } else if (selected.video && selected.video.embedUrl) {
          mediaHtml =
            '<div class="eduSimpleMediaWrap">' +
              '<div class="eduSimpleVideoWrap">' +
                '<iframe src="' + escapeHtml(selected.video.embedUrl) + '" title="' + escapeHtml(selected.video.title || selected.title) + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>' +
              '</div>' +
              (selected.video.caption ? '<div class="eduSimpleMediaCaption">' + escapeHtml(selected.video.caption) + '</div>' : '') +
            '</div>';
        }

        var paragraphsHtml = (selected.paragraphs || []).map(function (p) {
          return '<p>' + escapeHtml(p) + '</p>';
        }).join('');

        rightDetailHtml =
          '<div class="eduSimpleDetail" id="eduSimpleDetail">' +
            '<div class="eduDetailHeader">' +
              '<span class="eduSimpleDetailCategory">' + escapeHtml(selected.category) + '</span>' +
              '<div class="eduSimpleDivider" style="margin-bottom:10px;"></div>' +
              '<h3 class="eduSimpleDetailHeading">' + escapeHtml(selected.title) + '</h3>' +
              '<div class="eduSimpleDetailMeta">' + escapeHtml(selected.relativeLabel) + ' &bull; ' + escapeHtml(formatDate(selected.publishedAt)) + '</div>' +
            '</div>' +
            '<div class="eduDetailScrollBody" id="eduDetailScrollBody">' +
              mediaHtml +
              '<div class="eduSimpleDetailBody">' + paragraphsHtml + '</div>' +
            '</div>' +
          '</div>';
      }

      var otherCategoriesHtml = getOtherCategories().map(function (c) {
        return '<a href="' + escapeHtml(c.href) + '" class="eduOtherTopicLink">' + escapeHtml(c.label) + '</a>';
      }).join('');

      root.innerHTML =
        '<div class="eduSimpleGrid">' +
          '<aside class="eduLeftSidebar">' +
            '<h3 class="eduMoreHeading">More on This</h3>' +
            '<div class="eduSimpleList">' + leftListHtml + '</div>' +
          '</aside>' +
          rightDetailHtml +
        '</div>' +

        '<div class="eduOtherTopicsSection">' +
          '<h3 class="eduOtherTopicsLabel">Other Categories</h3>' +
          '<div class="eduOtherTopicsRow">' + otherCategoriesHtml + '</div>' +
        '</div>';

      var nextList = root.querySelector('.eduSimpleList');
      if (nextList) nextList.scrollTop = savedListScroll;
      var nextBody = root.querySelector('.eduDetailScrollBody');
      if (nextBody) nextBody.scrollTop = resetDetailScroll ? 0 : savedBodyScroll;

      startAutoSlide();
    }

    root.addEventListener('mouseenter', function (e) {
      if (e.target && e.target.closest && e.target.closest('#eduMediaCarousel')) {
        isCarouselPaused = true;
      }
    }, true);

    root.addEventListener('mouseleave', function (e) {
      if (e.target && e.target.closest && e.target.closest('#eduMediaCarousel')) {
        isCarouselPaused = false;
      }
    }, true);

    root.addEventListener('click', function (e) {
      var arrowBtn = e.target.closest('[data-carousel-dir]');
      if (arrowBtn) {
        var dir = Number(arrowBtn.getAttribute('data-carousel-dir')) || 1;
        updateCarouselSlide(state.photoIndex + dir);
        startAutoSlide();
        return;
      }

      var dotBtn = e.target.closest('[data-carousel-dot]');
      if (dotBtn) {
        var idx = Number(dotBtn.getAttribute('data-carousel-dot')) || 0;
        updateCarouselSlide(idx);
        startAutoSlide();
        return;
      }

      var itemBtn = e.target.closest('[data-item-id]');
      if (itemBtn) {
        state.selectedId = itemBtn.getAttribute('data-item-id');
        state.photoIndex = 0;
        render(true);
        if (window.innerWidth <= 768) {
          var detail = document.getElementById('eduSimpleDetail');
          if (detail) detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return;
      }

      var topicLink = e.target.closest('.eduOtherTopicLink');
      if (topicLink) {
        var href = topicLink.getAttribute('href');
        if (href && !href.startsWith('#')) {
          e.preventDefault();
          window.location.href = href;
        }
      }
    });

    if (typeof MutationObserver !== 'undefined') {
      var observer = new MutationObserver(function () {
        removeRecentlyPosted(container);
      });
      observer.observe(container, { childList: true });

      var heroBanner = document.querySelector('.efEiml');
      if (heroBanner) {
        var heroObserver = new MutationObserver(function () {
          syncHeroBanner(categoryConfig);
        });
        heroObserver.observe(heroBanner, { childList: true, subtree: true, characterData: true });
      }
    }

    syncHeroBanner(categoryConfig);
    var existingCms = window.uiRenderers && window.uiRenderers.state && window.uiRenderers.state.data;
    if (existingCms) {
      applyCmsData(existingCms);
    }
    render(true);

    // Fetch live CMS content directly so edits/additions/deletions from Admin reflect immediately
    (function fetchLiveCategoryContent() {
      try {
        var base = (window.apiService && window.apiService.baseUrl) ? window.apiService.baseUrl : '/api';
        fetch(base + '/content?_t=' + Date.now())
          .then(function (r) { return r.json(); })
          .then(function (json) {
            if (json && json.success && json.data) {
              var updated = applyCmsData(json.data);
              syncHeroBanner(categoryConfig);
              if (updated) {
                render(false);
              }
            }
          })
          .catch(function () {});
      } catch (err) {}
    })();

    // Re-sync hero banner & "Other Categories" once dynamic CMS data settles if loaded after script execution
    setTimeout(function () {
      var latestCms = window.uiRenderers && window.uiRenderers.state && window.uiRenderers.state.data;
      if (latestCms) applyCmsData(latestCms);
      syncHeroBanner(categoryConfig);
      render(false);
    }, 350);
    setTimeout(function () {
      var latestCms = window.uiRenderers && window.uiRenderers.state && window.uiRenderers.state.data;
      if (latestCms) applyCmsData(latestCms);
      syncHeroBanner(categoryConfig);
      render(false);
    }, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCategoryShowcase);
  } else {
    initCategoryShowcase();
  }
})();
