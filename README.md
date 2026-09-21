# Kunal Tilak Official Website & CMS

A scalable, secure, and decoupled Web Application and Content Management System (CMS) built for the official website of **Kunal Tilak**.

---

## 🏛️ Architecture Overview

The repository is organized into distinct **Frontend** and **Backend** systems following **Clean Layered Architecture (Controller-Service-Repository)**, **OOP design principles**, and **Security Hardening standards**.

```
kunaltilak/
├── backend/                     # Enterprise Node.js / Express API Server
│   ├── src/
│   │   ├── config/              # Centralized configuration (env, db, upload settings)
│   │   │   └── config.js
│   │   ├── controllers/         # OOP Controllers (Request parsing & response DTOs)
│   │   │   ├── ApiController.js    # Public content, initiatives, contact inquiries
│   │   │   └── AdminController.js  # Auth, settings, CRUD management, QR generator, uploads
│   │   ├── services/            # OOP Business Logic Layer
│   │   │   ├── ContentService.js   # Content aggregation, sectors, blogs, parliament
│   │   │   └── AuthService.js      # Admin authentication, bcrypt hashing, session tokens
│   │   ├── repositories/        # OOP Data Access Layer (Prisma ORM + Atomic JSON store)
│   │   │   └── DataRepository.js   # Atomic file writes with temporary swap protection
│   │   ├── middlewares/         # Consolidated security & processing middlewares
│   │   │   └── middleware.js       # Helmet headers, rate limiting, auth guards, upload filters
│   │   ├── utils/               # DTOs, custom errors & utility helpers
│   │   │   └── helpers.js          # ApiResponse, ApiError hierarchy, asyncHandler, sanitizer
│   │   ├── routes/              # Modular Express route registry
│   │   │   └── routes.js           # API route mappings
│   │   └── app.js               # Express application composition root
│   ├── prisma/
│   │   └── schema.prisma        # Database schema
│   ├── data/
│   │   └── data_store.json      # Persistent local database store
│   ├── uploads/                 # Media & document uploads directory
│   ├── .env                     # Server environment variables
│   ├── .env.example             # Environment template
│   ├── package.json             # Backend dependencies & scripts
│   └── server.js                # Server entry point & lifecycle manager
│
├── frontend/                    # Client UI & Admin CMS Dashboard
│   ├── public/                  # Static pages & public assets
│   │   ├── _next/               # Static site assets
│   │   ├── assets/              # Banners, images, report PDFs
│   │   ├── css/                 # Global styles
│   │   ├── blog/                # Subpage
│   │   ├── constituency-projects/
│   │   ├── education/
│   │   ├── health/
│   │   ├── infrastructure/
│   │   ├── infrastructure-transport-mobility/
│   │   ├── labour/
│   │   ├── policy-and-parliamentary-work/
│   │   ├── security/
│   │   ├── sports/
│   │   ├── favicon.html
│   │   └── index.html           # Main landing page
│   ├── js/                      # Modular Frontend Logic
│   │   ├── api.service.js       # Reusable API service (dynamic origin & cache-busting)
│   │   ├── renderers.js         # Universal UI renderers (Hero, Sectors, Initiatives, Modals)
│   │   └── app.js               # Client entry point
│   ├── admin/                   # Admin CMS Dashboard
│   │   ├── css/
│   │   │   └── admin.css
│   │   ├── js/
│   │   │   ├── admin.service.js # Admin API service (Auth, CRUD, QR generator, Uploads)
│   │   │   ├── admin.ui.js      # Form binders, tabs, modals, tables, upload handlers
│   │   │   └── admin.js         # Admin entry point
│   │   └── index.html           # Admin Dashboard interface
│   ├── package.json             # Frontend standalone server scripts
│   └── README.md
│
├── package.json                 # Unified workspace orchestration scripts
└── README.md                    # Project documentation
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Install Dependencies
Install dependencies across root and backend in one command:
```bash
npm run install:all
```

### 3. Start the Application
Start the unified full-stack application (Backend API + Frontend & Admin):
```bash
npm start
```

- **Public Website**: [http://localhost:5000](http://localhost:5000)
- **Admin CMS Panel**: [http://localhost:5000/admin](http://localhost:5000/admin)
- **API Endpoints**: [http://localhost:5000/api/content](http://localhost:5000/api/content)

### 4. Running Backend & Frontend Standalone (Decoupled Mode)
If you prefer running backend and frontend on separate ports during development:

```bash
# Terminal 1 - Backend (Port 5000)
npm run start:backend

# Terminal 2 - Frontend (Port 3000)
npm run start:frontend
```
> The frontend automatically connects to the backend API via CORS when run on port 3000.

---

## 🔒 Security Standards & Features

- **HTTP Security Headers**: Powered by `helmet` to guard against XSS, clickjacking, and MIME-type sniffing.
- **Rate Limiting**: Configured via `express-rate-limit` on login attempts and contact message submissions to prevent brute force and spam.
- **Atomic Data Store**: `DataRepository` writes data through temporary swap files (`.tmp` + `fs.renameSync`) to eliminate corruption risks.
- **Input Sanitization**: Strings and objects are sanitized against XSS vectors before storage.
- **Secure File Uploads**: `multer` validates file extensions and MIME types (Images: PNG, JPG, JPEG, WEBP, SVG; Documents: PDF) with a 10MB maximum limit.
- **0 Vulnerabilities**: Fully audited dependencies with `npm audit`.

---

## 🔑 Admin CMS Credentials

- **URL**: [http://localhost:5000/admin](http://localhost:5000/admin)
- **Default Username**: `admin`
- **Default Password**: `admin123`

---

## 📡 API Reference Summary

### Public Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/content` | Fetch all aggregated dynamic content |
| `POST` | `/api/contact` | Submit contact form inquiry (rate-limited) |

### Admin Endpoints (Protected)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/admin/login` | Admin authentication & session issuance |
| `GET` | `/api/admin/me` | Check active admin session |
| `POST` | `/api/admin/logout` | Terminate admin session |
| `GET` | `/api/admin/generate-qr` | Clean URL QR Code generation |
| `POST` | `/api/admin/upload` | Secure image & document upload |
| `PUT` | `/api/admin/settings` | Update general candidate & header settings |
| `PUT` | `/api/admin/hero` | Update hero banner & bio |
| `PUT` | `/api/admin/organization` | Update BJYM & youth wing content |
| `POST / DELETE` | `/api/admin/initiatives` | Manage main initiatives |
| `POST / DELETE` | `/api/admin/sector-initiatives` | Manage sector initiatives (Education, Health, Infra, etc.) |
| `POST / DELETE` | `/api/admin/parliament-items` | Manage parliamentary debate items |
| `POST / DELETE` | `/api/admin/constituency-projects` | Manage constituency development projects |
| `POST / DELETE` | `/api/admin/blogs` | Manage blog posts |
| `POST / DELETE` | `/api/admin/gallery` | Manage gallery media |
| `GET / DELETE` | `/api/admin/messages` | View and delete contact inquiries |

---

## 🛠️ Code Reusability & Architecture Highlights

- **Universal Subpage Renderer**: All 6 sector subpages (`/education`, `/health`, `/infrastructure`, `/sports`, etc.) reuse the same renderer (`uiRenderers.renderSectorSubpage`), completely eliminating duplicate code.
- **Centralized API Services**: `api.service.js` and `admin.service.js` provide unified request pipelines with dynamic origin resolution, automatic cache-busting, and error management.
- **Zero Temporary Scratch Scripts**: Clean repository containing only production-ready modules.
