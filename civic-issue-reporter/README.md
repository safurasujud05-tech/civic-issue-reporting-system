# 🏛️ CivicAI — AI-powered Civic Issue Reporting with Legal Assistance

A full-stack project that empowers citizens to report civic issues, get AI legal guidance, and gives admin users a focused portal for complaint management and analytics.

**Live Demo:** [https://civic-issue-reporting-system-1-b6tg.onrender.com](https://civic-issue-reporting-system-1-b6tg.onrender.com)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📝 **Issue Reporting** | Submit civic complaints with title, description, photo, and map location |
| 🤖 **AI Classification** | Auto-classify issues into Electricity / Water / Roads / Garbage |
| ⚖️ **Legal Assistant** | AI chatbot providing legal rights and escalation guidance for citizens |
| 👩‍⚖️ **Admin Portal** | Admin-only dashboard with complaint list and status update controls |
| 📊 **Analytics Dashboard** | Separate analytics page with charts and summary statistics |
| 🗺️ **Map Integration** | OpenStreetMap with Leaflet for location picking and viewing |
| 🎤 **Voice Input** | Browser Speech Recognition API for hands-free input |
| 📱 **Responsive UI** | Works on mobile and desktop |

---

## 🏗️ Project Structure

```
civic-issue-reporter/
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Navigation bar with admin portal logic
│   │   │   ├── ComplaintForm.jsx     # Issue submission form (with voice)
│   │   │   ├── ComplaintCard.jsx     # Complaint card used in lists
│   │   │   ├── Chatbot.jsx           # AI legal assistant chat UI
│   │   │   ├── MapPicker.jsx         # Leaflet location picker
│   │   │   └── AnalyticsDashboard.jsx# Analytics summary component
│   │   ├── pages/
│   │   │   ├── Home.jsx              # Landing / role selection page
│   │   │   ├── ReportIssue.jsx       # Report submission page
│   │   │   ├── Dashboard.jsx         # Complaint listing + filters page
│   │   │   ├── AdminDashboard.jsx    # Admin complaint portal
│   │   │   ├── ComplaintDetail.jsx   # Single complaint detail page
│   │   │   ├── GovernmentDashboard.jsx # Analytics dashboard page
│   │   │   ├── LegalAssistant.jsx    # Legal chatbot page
│   │   │   └── CitizenDashboard.jsx  # Citizen portal with personal history
│   │   ├── utils/
│   │   │   ├── api.js                # API request helpers
│   │   │   └── helpers.js            # Utility and formatting helpers
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Authentication / role context
│   │   ├── App.jsx                   # App routing and layout
│   │   ├── main.jsx                  # React entry file
│   │   └── index.css                 # Tailwind and custom styles
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                    # Node.js + Express backend
│   ├── routes/
│   │   ├── complaints.js      # Complaint CRUD endpoints
│   │   ├── legalAdvice.js     # AI legal help endpoint
│   │   ├── auth.js            # Authentication endpoints (if present)
│   │   ├── dashboard.js       # Dashboard stats endpoints
│   │   └── vote.js            # Voting endpoints (if present)
│   ├── db/
│   │   ├── index.js           # Database connection helper
│   │   └── mockDb.js          # In-memory mock DB support
│   ├── utils/
│   │   ├── aiHelpers.js       # AI & classification logic
│   │   ├── authMiddleware.js  # Auth protection middleware
│   │   ├── contentValidator.js# Validation utilities
│   │   ├── notification.js    # Notification helper logic
│   │   └── openaiHelper.js    # OpenAI prompt helper
│   ├── uploads/               # Uploaded image storage
│   ├── index.js               # Express server entry point
│   ├── package.json
│   └── .env.example           # Environment template
│
├── package.json               # Root scripts
└── README.md
```

---

## 🚀 Quick Setup

### Prerequisites
- Node.js v18+ ([download](https://nodejs.org))
- npm v8+
- PostgreSQL (optional — mock DB works without it)

### Install dependencies

```bash
cd civic-issue-reporter/server
npm install
cd ../client
npm install
```

### Configure environment

```bash
cd ../server
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=civic_issues
DB_USER=postgres
DB_PASSWORD=your_password
OPENAI_API_KEY=sk-your-key-here
```

> The app runs without PostgreSQL and without OpenAI by default.

### Run the app

**Backend:**
```bash
cd server
npm run dev
```

**Frontend:**
```bash
cd ../client
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/status` | Health check |
| POST | `/api/complaints` | Submit a new complaint |
| GET | `/api/complaints` | List complaints with optional filters |
| GET | `/api/complaints/:id` | Fetch a single complaint |
| PATCH | `/api/complaints/:id/status` | Update a complaint status |
| POST | `/api/legal-advice` | Request legal advice |

---

## 🔧 Recent Project Changes

### Admin portal
- `Navbar.jsx` now shows only `Dashboard` and `Logout` for admin users.
- Citizen navigation items like `Home`, `Report Issue`, `Legal Help`, and `+ New Report` are hidden from admins.
- `AdminDashboard.jsx` now includes clickable complaint rows and status controls.
- `ComplaintDetail.jsx` preserves admin back navigation to `/admin`.
- `ComplaintCard.jsx` no longer shows community vote buttons or vote actions.
- `App.jsx` now displays the navbar on `/admin` and admin complaint pages.
- `GovernmentDashboard.jsx` is used as the separate analytics page with a back link to admin portal.

### Complaint status flow
- Admins can change complaint status between `Submitted`, `In Progress`, and `Resolved`.
- The admin portal is designed as a management workspace, while analytics are shown on a separate page.

---

## 🌟 Features

- 📝 Citizen complaint submission with image and map location
- 🤖 Issue classification and routing logic
- ⚖️ AI legal guidance for citizens
- 👨‍💼 Admin portal with complaint management and status updates
- 📊 Analytics page for charts and summary data
- 🗺️ Leaflet map integration for location selection and view
- 🎤 Voice input for hands-free report creation
- 📱 Fully responsive web UI

---

## 💡 Notes

- Admin and citizen flows are role-based and render different UI.
- The admin portal focuses on complaint management and analytics.
- Citizens continue to see legal assistant and complaint submission features.
- Admin users can open complaints from the dashboard and return to the portal easily.

---

**Demo flow**: Role selection → Admin Portal → Analytics → Open complaint → Change status
