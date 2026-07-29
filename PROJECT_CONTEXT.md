# PetConnect 🐾 - Comprehensive AI Context & Technical Reference

> **Purpose of this file:** This document provides a complete, structured overview of the PetConnect repository. It is designed to allow any AI assistant (ChatGPT, Claude, Gemini, Copilot, Cursor, etc.) to immediately understand the project architecture, database schemas, authentication flows, API routes, frontend structures, and business logic without needing to scan every individual file.

---

## 1. Executive Summary & Project Overview

**PetConnect** is a full-stack **MERN (MongoDB, Express, React, Node.js)** web application built as a multi-role ecosystem for pet owners, caretakers, and platform administrators.

### Core Value Proposition & Domains:
1. **Pet Marketplace**: Allows pet owners to list pets for sale/adoption and enables users to browse, search, and purchase pets.
2. **Caretaker Marketplace & Professional Showcase**: Allows users to apply to become pet caretakers, manage professional showcase profiles (services, availability calendar, trust badges, home environment, gallery), and accept booking requests from pet owners.
3. **Admin Supervision & Profile Approval**: Provides a centralized admin control panel to verify pet listings, approve/reject caretaker applications, and review/approve caretaker professional profile edits with full versioning.

---

## 2. Tech Stack & Infrastructure

### Backend
- **Runtime**: Node.js (ESM modules `"type": "module"`)
- **Framework**: Express.js (`v4.21.2`)
- **Database**: MongoDB using Mongoose ORM (`v8.13.0`)
- **Authentication**: JWT (`jsonwebtoken` v9.0.2) + Passwords hashed with `bcrypt` (`v5.1.1`)
- **Middleware**: `cookie-parser`, `body-parser`, `cors`
- **File Uploads**: `multer` + `datauri` + `cloudinary` (`v2.6.0`) for media storage
- **Development Tool**: `nodemon` (`v3.1.9`)
- **Default Server Port**: `7001` (configurable via `process.env.PORT`)

### Frontend
- **Framework / Library**: React 18 SPA
- **Build Tool**: Vite
- **Routing**: `react-router-dom` (v6)
- **State Management**: React Context API (`AuthContext.jsx`, `AdminContext.jsx`)
- **Styling**: Tailwind CSS + Custom CSS (`index.css`, `App.css`)
- **Icons**: React Icons / Lucide React
- **Default Dev Port**: `5173`

---

## 3. Repository Architecture & Directory Layout

```
petconnect/
├── PROJECT_CONTEXT.md          # Comprehensive AI documentation (Markdown)
├── PROJECT_INFO.txt            # Comprehensive AI documentation (Plain Text)
├── README.md                   # Quickstart instructions
├── backend/
│   ├── Config/
│   │   └── db.js                 # Mongoose DB connection & IPv4 DNS resolution
│   ├── Controllers/
│   │   ├── admin/                # Admin-specific logic
│   │   │   ├── admin.controller.js
│   │   │   ├── adminCaretaker.controller.js
│   │   │   ├── adminPet.controller.js
│   │   │   ├── adminProfileApproval.controller.js # [NEW] Review & approve professional profile versions
│   │   │   └── adminUser.controller.js
│   │   ├── appointment/          # Booking/Service appointment logic
│   │   │   └── booking.controller.js
│   │   ├── auth/                 # User/Admin/Caretaker auth logic
│   │   │   ├── adminAuth.controller.js
│   │   │   ├── auth.controller.js
│   │   │   ├── caretakerAuth.controller.js
│   │   │   └── userAuth.controller.js
│   │   ├── caretaker/            # Caretaker profile & application handling
│   │   │   ├── caretakerApplication.controller.js
│   │   │   ├── caretakerBooking.controller.js
│   │   │   ├── caretakerProfile.controller.js
│   │   │   └── professionalProfile.controller.js # [NEW] Caretaker professional showcase & edit draft handler
│   │   ├── pet/                  # Pet listing & buying logic
│   │   │   └── pet.controller.js
│   │   └── user/                 # User profile & general user actions
│   │       ├── user.controller.js
│   │       ├── userCaretaker.controller.js
│   │       └── userProfile.controller.js
│   ├── Middlewares/               # Authentication & Authorization middlewares
│   ├── Models/                   # Mongoose database models
│   │   ├── adminModel.js         # Admin schema
│   │   ├── bookingRequestModel.js# Caretaker service booking schema
│   │   ├── caretakerApplicationModel.js # Caretaker verification/application schema
│   │   ├── caretakerModel.js     # Caretaker base schema
│   │   ├── caretakerProfileModel.js # [NEW] Professional profile showcase with versioning
│   │   ├── imageModel.js         # Cloudinary image schema helper
│   │   ├── petModel.js           # Pet listing / PetOrder schema
│   │   └── userModel.js          # Core User schema
│   ├── Routes/                   # Express router handlers
│   │   ├── adminRouter.js        # /api/admin
│   │   ├── authRouter.js         # /api/auth
│   │   ├── caretakerRoutes.js    # /api/caretaker
│   │   └── userRouter.js         # /api/user
│   ├── Seed/
│   │   └── adminSeeder.js        # Auto-seeds default admin from .env on backend startup
│   ├── utils/                    # Cloudinary upload helpers, token utilities
│   ├── .env                      # Environment variables (Backend)
│   ├── package.json
│   └── server.js                 # App entry point
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── context/              # Global state contexts (AuthContext, etc.)
│   │   ├── layouts/              # PublicLayout, UserLayout, CaretakerLayout, AdminLayout
│   │   ├── modules/              # Domain-driven modules
│   │   │   ├── admin/            # Pages & components for Admin portal (AdminProfileReview.jsx)
│   │   │   ├── caretaker/        # Pages & components for Caretaker portal (CompleteProfessionalProfile.jsx)
│   │   │   └── user/             # Pages & components for User/Pet Owner portal (UserCaretakerProfile.jsx)
│   │   ├── routes/
│   │   │   └── index.jsx         # App router configuration & route guards
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 4. Database Schemas & Data Models

### 1. `User` Schema (`backend/Models/userModel.js`)
- `name` *(String, required)*
- `email` *(String, required, unique)*
- `password` *(String, required - bcrypt hashed)*
- `mobile` *(String, required, unique)*
- `address` *(String, required)*
- `role` *(String, enum: `["user", "caretaker", "admin"]`, default: `"user"`)*
- `timestamps` *(createdAt, updatedAt)*

### 2. `CaretakerProfile` Schema (`backend/Models/caretakerProfileModel.js`)
- `caretaker` *(ObjectId ref `user`, required)*
- `version` *(Number, default: 1)*
- `status` *(String, enum: `["pending", "approved", "rejected", "archived"]`, default: `"pending"`)*
- `headline` *(String)*
- `profileImage`, `coverBanner` *(String URLs)*
- `city`, `state`, `zipCode` *(Strings)*
- `bio`, `petOwnershipHistory` *(Strings)*
- `yearsOfExperience` *(Number)*, `responseTime` *(String)*
- `hasEmergencyTransport`, `isBackgroundChecked` *(Booleans)*
- `services` *(Array of `{ title, description, price, unit }`)*
- `baseDailyRate`, `additionalPetRate`, `holidayRate` *(Numbers)*
- `availabilityDays` *(Array of Day Strings)*
- `operatingHours` *(`{ start, end }`)*
- `isAcceptingNewClients` *(Boolean)*
- `trustBadges` *(Array of Strings)*, `skills` *(Array of Strings)*
- `acceptedPetTypes`, `acceptedDogSizes` *(Arrays of Strings)*
- `gallery` *(Array of `{ url, caption, publicId }`)*
- `homeEnvironment` *(`{ housingType, yardType, hasOwnPets, hasChildren, nonSmokingHome }`)*
- `safetyInfo` *(`{ emergencyVetContact, hasFirstAidKit, insured }`)*
- `certifications` *(Array of `{ title, issuer, year, credentialUrl }`)*
- `rejectionReason` *(String)*, `reviewedBy` *(ObjectId ref user)*, `reviewedAt` *(Date)*

---

## 5. API Endpoints Reference

### `/api/caretaker` (Professional Profile)
- `GET /api/caretaker/professional-profile` — Get caretaker's live approved profile, pending draft, and rejection feedback
- `POST /api/caretaker/professional-profile` — Submit/update professional profile changes as a pending draft

### `/api/admin` (Profile Approval)
- `GET /api/admin/caretaker-profiles/pending` — Fetch pending profile drafts for side-by-side comparison
- `POST /api/admin/caretaker-profiles/approve` — Approve pending profile (archive old live profile & promote pending to approved)
- `POST /api/admin/caretaker-profiles/reject` — Reject pending profile draft with feedback reason

---
*Updated with Professional Caretaker Profile & Versioning system.*
