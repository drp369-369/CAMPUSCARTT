# CAMPUSCART 🛒

> **Your Campus. Your Marketplace.**  
> A university-focused student marketplace connecting college students to buy, sell, and exchange second-hand and new academic essentials, gadgets, and hostel necessities.

**Course:** CS3911 Startup Practicum 3  
**Repository:** [https://github.com/drp369-369/CAMPUSCARTT](https://github.com/drp369-369/CAMPUSCARTT)  
**Target Platform:** Vercel Serverless + MongoDB Atlas  

---

## 👥 Core Project Team

| Team Member | Student ID | Core Role & Responsibilities |
| :--- | :--- | :--- |
| **Deep Ranjan Paul** | `1RUA24SCSOO30` | **Technical Lead** — Architecture, Vercel serverless functions, database design, API security, session authentication |
| **Yuvrat Mittal** | `1rua24cse0552` | **Product & Development Lead** — Product roadmap, responsive UI/UX design system, client interaction logic, category taxonomy |

---

## 🚀 Problem Statement & Value Proposition

- **The Problem:** Students often struggle to find affordable textbooks, calculators, tech gadgets, and hostel furniture, while senior students lack a trusted, zero-fee, hyper-local platform to sell their used items without dealing with strangers or high platform fees.
- **The Solution:** **CampusCart** brings safe, direct student-to-student commerce right to the university doorstep with student ID verification, physical campus hand-offs (library, hostels, cafeterias), and zero transaction fees.

---

## 🛠️ Technology Stack

- **Frontend:** Semantic HTML5, Modular CSS3 (Design Tokens, Flexbox, CSS Grid), Vanilla Modern JavaScript (ES6+). Zero heavy frameworks (no React, no Vue).
- **Backend:** Node.js, Vercel Serverless Functions (`/api/*`), RESTful APIs.
- **Database:** MongoDB Atlas, Official MongoDB Node.js Driver (`mongodb`).
- **Security:** bcrypt password hashing, JSON Web Tokens (JWT) / Session authentication, Input sanitization, XSS-conscious rendering.
- **Deployment:** Vercel Git-integrated Serverless Deployment.

---

## 📁 Project Architecture & Directory Structure

```text
c:\STARTUP_PRACTICUM/
├── .env.example            # Sample environment variables for local testing
├── .gitignore              # Ignores node_modules, .env, OS files
├── README.md               # Master project documentation & guide
├── package.json            # Node project configuration & dependencies
├── vercel.json             # Vercel deployment routing & headers
├── server.js               # Zero-dependency local dev server (emulates Vercel functions)
├── docs/
│   └── API.md              # Complete RESTful API documentation & schemas
├── api/                    # Vercel Serverless Function Endpoints
│   ├── health.js           # API health check endpoint (/api/health)
│   ├── auth/
│   │   ├── register.js     # Student registration (/api/auth/register)
│   │   ├── login.js        # Student login & JWT issuance (/api/auth/login)
│   │   ├── logout.js       # Session logout (/api/auth/logout)
│   │   └── me.js           # Current user profile (/api/auth/me)
│   ├── products/
│   │   └── index.js        # Listings CRUD, search & filters (/api/products)
│   ├── reports/
│   │   └── index.js        # Item reporting & moderation (/api/reports)
│   └── lib/
│       ├── db.js           # Cached MongoDB Atlas connection & index initialization
│       ├── auth.js         # bcrypt password hashing, JWT signing & guards
│       ├── validation.js   # Input validation for users, products & reports
│       └── response.js     # Standardized JSON response and error handlers
├── public/                 # Static Frontend Web Assets
│   ├── index.html          # High-converting, responsive landing page
│   ├── css/
│   │   ├── style.css       # Design tokens, typography, navbar, cards, footer
│   │   └── home.css        # Hero section, categories, product grid, trust box
│   └── js/
│       ├── config.js       # App configuration, categories & seed listings
│       └── main.js         # Reactive UI, search filtering, modals, mobile drawer
└── test/                   # Automated Test Suites
    ├── run-all.js          # Master test suite runner
    ├── validation.test.js  # Schema guard and domain verification tests
    ├── auth.test.js        # bcrypt, JWT, and middleware guard tests
    ├── integration.test.js # HTTP integration tests for landing page & health
    ├── backend-routes.test.js # API route dispatching & validation tests
    ├── browser-verify.js   # Headless Chrome visual inspection runner
    └── e2e-interactions.test.js # DOM interaction tests inside headless Chrome
```

---

## 💻 Local Development Setup

To run CampusCart locally:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/drp369-369/CAMPUSCARTT.git
   cd CAMPUSCARTT
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Update MONGODB_URI and JWT_SECRET in .env
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Run automated test suites:**
   ```bash
   npm test
   ```

5. **Start the local development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   - Web Application: [http://localhost:3000](http://localhost:3000)
   - API Health Check: [http://localhost:3000/api/health](http://localhost:3000/api/health)
   - API Documentation: [`docs/API.md`](docs/API.md)

---

## 🗺️ Incremental Development Roadmap

- [x] **Phase 1: Project Foundation & Responsive Landing Page**
  - Repository initialized with clean modular architecture
  - Vercel-ready structure (`/api`, `/public`, `vercel.json`)
  - Design tokens, typography, and responsive CSS system
  - High-converting landing page with Hero, Category Explorer, and Product Grid
  - Real-time client search, category filtering, and item quick-preview modal
  - Zero-dependency local runner `server.js` and `/api/health` endpoint
- [x] **Phase 2: Backend & Database Foundation (Current)**
  - MongoDB Atlas connection caching & collection accessors (`users`, `products`, `reports`)
  - Automated database index creation (unique email, compound filters, text search)
  - Student registration, login, logout, and profile management with bcrypt & JWT
  - Configurable university email domain verification guard
  - Full Product CRUD with multi-attribute filtering, price ranges, and keyword search
  - Product moderation reporting endpoint
  - Comprehensive REST API documentation in `docs/API.md`
  - Automated test suite covering validation, auth, routes, and UI interactions (82 passing tests)
- [ ] **Phase 3: Frontend Integration & Listing Creation Flow**
  - Connect registration and login modals to `/api/auth`
  - Product listing creation form with client-side image preview
  - User dashboard ("My Active Listings", "Mark as Sold", "Edit Price")
- [ ] **Phase 4: Direct Student Contact & Real-Time Search Integration**
  - Direct student contact modal connected to seller profile
  - Live search connected to `/api/products` with pagination
- [ ] **Phase 5: Safety, Moderation & Deployment Hardening**
  - Moderation dashboard for reported listings
  - Final Vercel production deployment and verification

