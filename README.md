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
├── api/                    # Vercel Serverless Function Endpoints
│   ├── health.js           # API health check endpoint (/api/health)
│   └── lib/
│       └── db.js           # Cached MongoDB Atlas connection singleton
└── public/                 # Static Frontend Web Assets
    ├── index.html          # High-converting, responsive landing page
    ├── css/
    │   ├── style.css       # Design tokens, typography, navbar, cards, footer
    │   └── home.css        # Hero section, categories, product grid, trust box
    └── js/
        ├── config.js       # App configuration, categories & seed listings
        └── main.js         # Reactive UI, search filtering, modals, mobile drawer
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

3. **Install dependencies (when ready for backend DB testing):**
   ```bash
   npm install
   ```

4. **Start the local development server:**
   ```bash
   node server.js
   # or
   npm run dev
   ```

5. **Open your browser:**
   - Web Application: [http://localhost:3000](http://localhost:3000)
   - API Health Check: [http://localhost:3000/api/health](http://localhost:3000/api/health)

---

## 🗺️ Incremental Development Roadmap

- [x] **Phase 1: Project Foundation & Responsive Landing Page (Current)**
  - Repository initialized with clean modular architecture
  - Vercel-ready structure (`/api`, `/public`, `vercel.json`)
  - Design tokens, typography, and responsive CSS system
  - High-converting landing page with Hero, Category Explorer, and Product Grid
  - Real-time client search, category filtering, and item quick-preview modal
  - Zero-dependency local runner `server.js` and `/api/health` endpoint
- [ ] **Phase 2: Authentication & Student Verification**
  - Registration with college email / student ID
  - Password hashing via bcrypt
  - JWT session generation & cookie/header verification
- [ ] **Phase 3: Product Listing Management**
  - Post listing form with image upload (cloud storage integration)
  - Price, condition tag, hostel/campus location selection
  - User Dashboard ("My Listings" edit / mark as sold / delete)
- [ ] **Phase 4: Search, Filtering & Seller Contact**
  - MongoDB Atlas aggregation for full-text keyword search and price filters
  - Direct student contact / chat initiation
- [ ] **Phase 5: Safety & Moderation**
  - Product reporting system
  - Basic admin dashboard for listing moderation

