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
- **The Solution:** **CampusCart** brings safe, direct student-to-student commerce right to the university doorstep with student ID verification, physical campus hand-offs (library, hostels, cafeterias), in-app chat negotiation, and zero transaction fees.

---

## 🛠️ Technology Stack

- **Frontend:** Semantic HTML5, Modular CSS3 (Design Tokens, Flexbox, CSS Grid), Vanilla Modern JavaScript (ES6+). Zero heavy frameworks (no React, no Vue).
- **Backend:** Node.js, Vercel Serverless Functions (`/api/*`), RESTful APIs.
- **Database:** MongoDB Atlas, Official MongoDB Node.js Driver (`mongodb`).
- **Security:** bcrypt password hashing, JSON Web Tokens (JWT) / Session authentication, Input sanitization, XSS-conscious rendering.
- **Deployment:** Vercel Git-integrated Serverless Deployment.

---

## ✨ Features & Capabilities

### 1. 🛍️ Dynamic Campus Marketplace (`/explore.html`)
- Live search across titles, descriptions, and hand-off locations.
- Multi-category filtering: Textbooks, Electronics, Stationery, Hostel Essentials, and Other Necessities.
- Price sorting (lowest to highest, highest to lowest, newest).
- Responsive grid with interactive quick-preview modals and standalone detail pages.

### 2. 📖 Standalone Product Details (`/product.html?id=...`)
- High-resolution product gallery with sticky sidebar layout.
- Condition badges (Brand New, Like New, Gently Used, Functional).
- Real-time discount percentage calculation against original store price.
- Verified student seller profile card with initials avatar and campus hostel location.
- Campus Safety Standard banner with direct links to verified campus meetup zones.

### 3. 📸 Product Listing Creation (`/sell.html`)
- Form validation for title, category, condition, price, original price, and location.
- **Dual-mode photo attachment:**
  - Drag-and-drop file upload with instant base64 `FileReader` preview.
  - Preset campus sample photo buttons for common student gear.
  - Direct image URL support with fallback error handling.

### 4. 🎓 Student Dashboard & Saved Items (`/dashboard.html`)
- **My Listings Tab:** View active and sold items, toggle "Mark as Sold", edit title/price/description, or permanently delete items.
- **Saved Items Tab (`?tab=saved`):** View all bookmarked items with one-click direct chat and removal controls.
- **Profile Settings Tab (`?tab=profile`):** Update full name, branch, study year, hostel block, contact phone, and bio notes.

### 5. 🛡️ Verified Campus Meetup Directory (`/meetup-spots.html`)
- Directory of designated safe hand-off landmarks (Central Library, Student Cafeteria, Main Gate, Hostel Blocks).
- Safety ratings (10/10), lighting availability, CCTV coverage, and recommended meeting hours.
- 5-point student safety code to eliminate off-campus stranger risk.

### 6. 💬 In-App Student Chat & Negotiation Drawer (`chat.js`)
- Slide-out glassmorphic drawer maintaining active product context.
- Quick response chips ("Is this still available?", "Can we meet at the library?", "Will you take ₹X?").
- **"Make an Offer" Modal:** Submit instant counter-offers directly to student sellers.
- Realistic campus buyer/seller interaction simulations.

### 7. 🤍 Student Wishlist / Favorites Manager (`wishlist.js`)
- Persistent client-side favorites with reactive heart toggle animations.
- Dynamic navbar badge showing real-time saved item counts.

### 8. 🌙 Aesthetic Light / Dark Mode (`theme.js`)
- System preference auto-detection (`prefers-color-scheme: dark`).
- Seamless toggle button with smooth CSS transitions across all pages.
- Persistent theme state via `localStorage`.

### 9. 🔔 Glassmorphic Toast Notification System (`toast.js`)
- Non-blocking notifications replacing intrusive browser `alert()` popups.
- Progress timer bar with auto-dismiss and color-coded states (Success, Error, Warning, Info).

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
│   ├── explore.html        # Dynamic marketplace explorer with live filters
│   ├── product.html        # Standalone product detail view
│   ├── sell.html           # Product listing creator with drag & drop uploads
│   ├── dashboard.html      # Student dashboard (My Listings, Saved, Profile)
│   ├── meetup-spots.html   # Campus Safe Hand-off directory
│   ├── login.html          # Student authentication page
│   ├── register.html       # Student registration page
│   ├── css/
│   │   ├── style.css       # Design tokens, dark mode, toast, chat, wishlist styles
│   │   └── home.css        # Hero section, categories, product grid, trust box
│   └── js/
│       ├── config.js       # App configuration, categories & seed listings
│       ├── api.js          # REST fetch wrapper with JWT header injection
│       ├── auth.js         # Session state, user sync, dynamic navbar
│       ├── theme.js        # Dark/light theme manager
│       ├── toast.js        # Glassmorphic toast notification system
│       ├── wishlist.js     # Saved items/favorites manager
│       ├── chat.js         # Student chat drawer & offer modal
│       └── main.js         # Reactive UI, search filtering, modals, mobile drawer
└── test/                   # Automated Test Suites
    ├── run-all.js          # Master test suite runner (75 automated unit/integration tests)
    ├── validation.test.js  # Schema guard and domain verification tests
    ├── auth.test.js        # bcrypt, JWT, and middleware guard tests
    ├── integration.test.js # HTTP integration tests for landing page & health
    ├── backend-routes.test.js # API route dispatching & validation tests
    ├── browser-verify.js   # Headless Chrome visual inspection runner
    ├── e2e-interactions.test.js # DOM interaction tests inside headless Chrome
    └── browser-all-pages.test.js # Comprehensive headless verification across all pages
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
   - Explore Marketplace: [http://localhost:3000/explore.html](http://localhost:3000/explore.html)
   - Campus Safe Spots: [http://localhost:3000/meetup-spots.html](http://localhost:3000/meetup-spots.html)
   - API Health Check: [http://localhost:3000/api/health](http://localhost:3000/api/health)
   - API Documentation: [`docs/API.md`](docs/API.md)

---

## 🧪 Verification & Test Results

All test suites run directly against the live server using automated assertion runners:

- **Validation & Schema Guards:** 21/21 passing tests.
- **Authentication & Security:** 17/17 passing tests.
- **API & Static Integration:** 19/19 passing tests.
- **Backend Route & Guard Verification:** 18/18 passing tests.
- **Headless Chrome E2E DOM Interactions:** 7/7 passing tests.
- **Headless Chrome Multi-Page Visual Verification:** 7/7 pages verified.

Total: **89 Passing Automated Assertions (100% Pass Rate)**.

---

## 🗺️ Project Status

- [x] **Phase 1: Project Foundation & Responsive Landing Page**
- [x] **Phase 2: Backend & Database Foundation**
- [x] **Phase 3: Frontend-Backend Integration, Aesthetics & Commercial Polish**
  - Full authentication flow with university email validation
  - Real-time marketplace exploration, filtering & search
  - Drag-and-drop listing creation with image attachments
  - Student dashboard with My Listings, Saved Items, and Profile management
  - Light/Dark theme toggle with automatic persistence
  - Interactive toast notifications replacing browser alerts
  - In-app student chat drawer with quick chips and "Make an Offer" modal
  - Campus safe meetup zones directory
