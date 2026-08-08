# PetConnect-MERN: Complete Project Architecture & Documentation

## 1. Project Overview & Scope
**PetConnect-MERN** is a comprehensive full-stack web application built using the MERN stack (MongoDB, Express.js, React 18, Node.js). It serves as an integrated ecosystem providing four core pillars:
1. **Pet E-Commerce & Adoption:** Users can list pets for sale or adoption, view live interactive preview cards, browse verified listings, bookmark to wishlists, and adopt/purchase pets.
2. **🤖 AI Pet Scanner & Breed Analytics:** Powered by Google Gemini Vision AI (`gemini-3.5-flash`), users and guests can upload or capture pet photos to receive instant breed identification, physical trait estimates, behavioral compatibility scores, health/care recommendations, and monthly cost estimates.
3. **Pet Caretaker Services & Draft Versioning:** Users can apply to become verified caretakers. Caretakers maintain a professional showcase with rates, services, and availability calendars, protected by an Admin Draft Versioning & Side-by-Side Review pipeline.
4. **Real-Time WebSockets Social Engine:** Real-time messaging with Socket.io, connection request handshakes, presence tracking (online/offline/last seen), typing indicators, read receipts, and push notifications with dynamic unread badges.

---

## 2. Role-Based Access Control (RBAC)
The platform distinctly utilizes three roles, which dictate layout, routing, and capabilities:
- **`user` (Default):** Can browse pets, buy pets, list pets for sale via an interactive step wizard, apply to become a caretaker, scan pets with AI, bookmark wishlists, send connection requests, and book caretaker services.
- **`caretaker`:** A specialized user role that has passed an application process. Has access to a dedicated dashboard, can manage their professional showcase profile, set custom daily/hourly service rates, and handle booking requests.
- **`admin`:** Has platform-wide control. Can review caretaker applications, manage users, approve/reject marketplace pet listings, and conduct side-by-side version reviews of caretaker profile drafts.

---

## 3. Technology Stack

### Backend
- **Core:** Node.js (ES Modules `"type": "module"`), Express.js v4.21.2
- **AI Integration:** `@google/generative-ai` (Gemini 3.5 Flash Vision Model)
- **Rate Limiting:** `express-rate-limit` (guest rate limiter middleware)
- **Database:** MongoDB (via `mongoose` ODM v8.13.0)
- **Real-Time Server:** Socket.io v4.8.1 (JWT authenticated handshake)
- **Authentication:** `jsonwebtoken` (JWT), `bcrypt` (password hashing), `google-auth-library` (Google OAuth)
- **File Uploads & Media:** `multer` (in-memory buffer storage), `datauri`, `cloudinary` (cloud media hosting)
- **Validation & Parsing:** `validator`, `body-parser`, `cookie-parser`, `cors`

### Frontend
- **Core Engine:** React 18, powered by Vite build tool.
- **Styling UI:** Tailwind CSS, integrating `framer-motion` for micro-animations, and `lucide-react` for icons.
- **Routing:** `react-router-dom` (v6) implementing a modular, multi-layout system.
- **State Management & Data Fetching:** React Context API (`AuthContext`, `AdminContext`), `axios` for REST HTTP communication.
- **Real-Time Client:** `socket.io-client` connected to backend HTTP server.
- **Notifications & UI Helpers:** `react-hot-toast` for real-time toast feedback.

---

## 4. Top-Level Directory Structure

```
/petconnect
├── PROJECT_FEATURES_EXPLAINED.md   # Detailed Markdown Feature & Tech Architecture Guide
├── PROJECT_FEATURES_EXPLAINED.txt  # Detailed Plain-Text Feature & Tech Guide
├── CURRENT_PROJECT_DOCUMENTATION.md# Complete Architecture & Schema Documentation
├── FUNCTIONALITY_DEEPDIVE.md       # Technical Execution & Code-Level Explanations
├── PROJECT_CONTEXT.md              # High-Level AI Markdown Context
├── PROJECT_INFO.txt                # Developer/AI Context Text File
├── README.md                       # Quickstart instructions
├── backend/                        # Node.js + Express API Server
│   ├── Config/                     # DB and Cloudinary configurations
│   ├── Controllers/                # Business logic (admin, ai, appointment, auth, caretaker, chat, pet, user)
│   ├── Middlewares/                # aiRateLimiter.js, authenticate.js, caretakerIsAuth.js, isAdmin.js, isAuth.js, multer.js
│   ├── Models/                     # Mongoose schemas (12 data models)
│   ├── Routes/                     # Express Routers (adminRouter, aiRoutes, authRouter, caretakerRoutes, chatRouter, userRouter)
│   ├── Seed/                       # Database seeders (adminSeeder.js)
│   ├── socket.js                   # Socket.io real-time WebSockets handler
│   └── server.js                   # Server entry point
└── frontend/                       # Vite + React Client
    └── src/
        ├── context/                # Global contexts (AuthContext.jsx)
        ├── layouts/                # Wrapper layouts per role (UserLayout, CaretakerLayout, AdminLayout, PublicLayout)
        ├── modules/                # Business logic isolated by Actor (admin, caretaker, user)
        │   ├── admin/              # Admin components & views
        │   ├── caretaker/          # Caretaker components & views
        │   └── user/               # User components & views (including PetScanner, Wishlist, Chat, Notifications)
        └── routes/                 # Central router definitions & RBAC guards
```

---

## 5. Backend Architecture & Key Endpoints

### 5.1 AI Scanner & Rate Limiter (`backend/Controllers/aiController.js`)
- `POST /api/ai/scan-guest`: Rate-limited via `aiGuestLimiter` (max 5 calls/15 minutes per IP).
- `POST /api/ai/scan-auth`: Unrestricted access for authenticated users (`isAuth`).
- Uses Gemini 3.5 Flash Vision API to parse image buffers and extract structured JSON data.

### 5.2 Data Models (`backend/Models/`)
- `userModel.js`: Accounts, authentication, roles (`user`, `caretaker`, `admin`), `lastSeen`.
- `petModel.js`: Pet marketplace orders (`category`, `breed`, `price`, `owner`, `buyer`, `isApproved`, `soldBool`).
- `caretakerApplicationModel.js`: Caretaker role application state (`skills`, `experience`, `hourlyRate`, `status`).
- `caretakerProfileModel.js`: Showcase profile with versioning (`version`, `status: pending|approved|rejected|archived`, `services`, `gallery`).
- `connectionRequestModel.js`: Connection handshakes between users.
- `conversationModel.js` & `messageModel.js`: 1-on-1 socket chat logs, attachments, and read receipts.
- `notificationModel.js`: System and socket notification records.

---

## 6. Verification and Maintenance Guidelines

1. **Verify State Before Modifying:** Ensure edits follow actor boundaries (`src/modules/user`, `src/modules/caretaker`, `src/modules/admin`).
2. **Environment Variables:** Maintain `.env` keys (`PORT`, `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`).
3. **Rate Limiting Guardrails:** Ensure guest endpoints maintain rate limiter protection.
