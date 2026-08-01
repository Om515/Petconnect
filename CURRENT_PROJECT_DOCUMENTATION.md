# PetConnect-MERN: Complete Project Architecture & Documentation

## 1. Project Overview & Scope
**PetConnect-MERN** is a comprehensive full-stack web application built using the MERN stack (MongoDB, Express.js, React, Node.js). It serves as a dual-purpose platform:
1. **Pet E-Commerce:** Users can buy and sell pets.
2. **Pet Care Service:** Users can find, book, and manage professional pet caretakers. 

**Role-Based Access Control (RBAC):**
The platform distinctly utilizes three roles, which dictate layout, routing, and capabilities:
- **`user` (Default):** Can browse pets, buy pets, list pets for sale, apply to become a caretaker, and book caretaker services.
- **`caretaker`:** A specialized user role that has passed an application process. Has access to a dedicated dashboard, can manage their professional profile, services, and handle booking requests.
- **`admin`:** Has platform-wide control. Can review caretaker applications, manage users (ban/delete), view platform pet listings, and review caretaker profiles.

---

## 2. Technology Stack

### Backend
- **Core:** Node.js, Express.js
- **Database:** MongoDB (via `mongoose` ODM)
- **Authentication:** `jsonwebtoken` (JWT), `bcrypt` (password hashing), `google-auth-library` (Google OAuth)
- **File Uploads & Media:** `multer` (multipart/form-data parsing), `datauri`, `cloudinary` (cloud media storage)
- **Email Services:** `nodemailer`
- **Validation & Parsing:** `validator`, `body-parser`, `cookie-parser`, `cors`

### Frontend
- **Core Engine:** React 19, powered by Vite (`type: module`).
- **Styling UI:** Tailwind CSS (v4), integrating `framer-motion` for animations, and `lucide-react` / `react-icons` for iconography. 
- **Routing:** `react-router-dom` (v7) implementing a modular, multi-layout system.
- **State Management & Data Fetching:** React Context API (`AuthContext`, `AdminContext`), `axios` for HTTP requests.
- **Components:** `react-dropzone` for image uploads, `react-slick` for carousels, `react-hot-toast` for notifications.

---

## 3. Top-Level Directory Structure

The repository is mapped as a monorepo containing two main isolated directories:
```
/PetConnect-MERN
├── backend/                  # Node.js + Express API
│   ├── Config/               # DB and 3rd party service configurations
│   ├── Controllers/          # Business logic organized by domain
│   ├── Middlewares/          # Auth intercepts, upload processing
│   ├── Models/               # Mongoose schemas
│   ├── Routes/               # Express routing layer
│   ├── Seed/                 # Database seeders for initial data
│   ├── utils/                # Helper functions (hashing, formats)
│   └── server.js             # Main entry point for the backend
├── frontend/                 # Vite + React Client
│   ├── src/
│   │   ├── assets/           # Static files
│   │   ├── context/          # React contexts (AuthContext.jsx)
│   │   ├── layouts/          # Wrapper layouts per role (User, Caretaker, Admin)
│   │   ├── modules/          # Business logic isolated by Actor (admin, caretaker, public, user)
│   │   ├── routes/           # Centralized routing definitions (index.jsx)
│   │   ├── shared/           # Cross-module components
│   │   ├── App.jsx           # Main React component
│   │   └── main.jsx          # DOM rendering entry
```

---

## 4. Backend Architecture (Deep Dive)

### 4.1 Data Models (`backend/Models/`)
*These schemas map directly to platform features:*

- **`userModel.js`**: Core account representation. Supports local passwords and Google OAuth (`googleId`, `authProvider`). Defines the `role` enum (`user`, `caretaker`, `admin`).
- **`caretakerApplicationModel.js`**: Submitted when a `user` wants to upgrade their role. Contains form data like `skills`, `experience`, `hourlyRate`, and an applicant reference. Admin uses this to flip the user's role if `isApproved` becomes true.
- **`caretakerProfileModel.js`**: A highly extensive model for approved caretakers to define their public presence. Contains arrays for `services` (prices, descriptions), `gallery`, `availabilityDays`, `certifications`, `homeEnvironment`, and `safetyInfo`. This represents the "Professional Profile".
- **`petModel.js` (exported as `PetOrder`)**: Serves the Pet E-Commerce side. Includes fields for `category`, `breed`, `price`, `owner` (seller), `buyer`, `soldBool`, and `image`. Requires Admin verification before being visible.
- **`bookingRequestModel.js`**: Handles the transaction between a `user` and a `caretaker`. Tracks `date`, `hours`, `totalCost`, and `status` (`pending`, `accepted`, `rejected`, `completed`, `cancelled`).

### 4.2 Controllers Organized by Domain (`backend/Controllers/`)
The controllers isolate logics:
- `admin/`: Operations for reviewing/updating user roles and overriding platform state.
- `appointment/`: Managing the `bookingRequestModel` flows.
- `auth/`: Login, Register, Google OAuth, tokens, forgot password logic.
- `caretaker/`: Creating/Updating the Caretaker profile, handling its visibility.
- `pet/`: Logic to list, update, buy, or remove pets from the store.
- `user/`: Basic user metadata updates, address changes.

---

## 5. Frontend Architecture (Deep Dive)

### 5.1 The `modules/` Architectural Pattern
To prevent a monolithic, confusing React frontend, components and pages are isolated based on the Actor reading them. **AI Agents working on this project must respect this boundary.**

- **`src/modules/user`**: Standard client views. Examples: `BuyPets.jsx`, `SellPets.jsx`, `CaretakerList.jsx`, `UserBookings.jsx`, `PetDetails.jsx`. 
- **`src/modules/caretaker`**: Views strictly for the caretaker actor. Examples: `CaretakerApplicationForm.jsx`, `CaretakerProfile.jsx`, `CompleteProfessionalProfile.jsx`.
- **`src/modules/admin`**: Administrative control panel components. Examples: `ManageUsers.jsx`, `PetList.jsx`, `AdminProfileReview.jsx`.

### 5.2 Layouts & Routing Context
Detailed in `frontend/src/routes/index.jsx`:
- **State Checkers:** `AuthData()` checks `isAuthenticated` and `role`.
- **RBAC Redirection:** 
  - Standard users default to the `/` domain wrapped in `<UserLayout />`. Attempting domain bypass (e.g. visiting `/apply-caretaker` unauthenticated) sends them to `/login`.
  - Caretakers are mapped starting at domain `/caretaker` utilizing default nested routes wrapped in `<CaretakerLayout />`.
  - Admin is mapped at `/admin` utilizing `<AdminLayout />`.

*(e.g., A user viewing caretakers hits `modules/user/pages/CaretakerList.jsx`, but a caretaker editing their own details hits `modules/caretaker/components/CaretakerProfile.jsx`)*

---

## 6. How To Safely Contribute As An AI Agent

To execute modifications perfectly, always respect the following rules:

1. **Verify State Before Writing:** Ensure you are editing the correct target module. If you are modifying a form for the user to buy a pet, look in `frontend/src/modules/user/`.
2. **Utilize Existential Components:** The frontend has centralized components and wrappers (e.g., `toast` from `react-hot-toast` for errors/success).
3. **Backend Schema Matches:** Before altering an Express route, check the specific `Mongoose Model` to ensure payload mapping matches schema types (e.g., ensuring `hourlyRate` parses as `Number`).
4. **Environment Variables:** Local `.env` dictates things like `JWT_SECRET`, `MONGO_URI`, and cloudinary configurations.
5. **Roles Define Capabilities:** Do not inject admin-level deletion functions into `userController`. Keep the separation of concerns pristine.
