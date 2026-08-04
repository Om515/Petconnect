# 🐾 PetConnect-MERN: Complete Feature & Technical Architecture Guide

> **Document Purpose:** This document provides a comprehensive, component-by-component explanation of every feature in the **PetConnect** project. It details what each feature does, how it works under the hood (frontend UI, API endpoints, backend controllers, Mongoose schemas, and WebSockets), and offers high-impact recommendations for future enhancements.

---

## 📋 Table of Contents
1. [Executive Overview & System Architecture](#1-executive-overview--system-architecture)
2. [Role-Based Access Control (RBAC) & Authentication](#2-role-based-access-control-rbac--authentication)
3. [Pet E-Commerce & Listing Engine](#3-pet-e-commerce--listing-engine)
4. [Caretaker Onboarding & Verification System](#4-caretaker-onboarding--verification-system)
5. [Professional Caretaker Showcase & Versioning Engine](#5-professional-caretaker-showcase--versioning-engine)
6. [Real-Time Connection Requests & Socket.io Messaging System](#6-real-time-connection-requests--socketio-messaging-system)
7. [Real-Time Notification System & Unread Counters](#7-real-time-notification-system--unread-counters)
8. [Admin Supervision & Platform Control Panel](#8-admin-supervision--platform-control-panel)
9. [Proposed Architectural Changes & Feature Recommendations](#9-proposed-architectural-changes--feature-recommendations)

---

## 1. Executive Overview & System Architecture

**PetConnect** is a full-stack monorepo application built with the **MERN** stack (**M**ongoDB, **E**xpress.js, **R**eact 18, **N**ode.js). It serves as a unified ecosystem for pet care, pet adoption, e-commerce, and real-time community engagement.

```
                  ┌───────────────────────────────────────────┐
                  │            React 18 SPA Client            │
                  │   Vite + Tailwind CSS + Lucide + Sockets  │
                  └─────────────────────┬─────────────────────┘
                                        │ (HTTP REST / WebSocket)
                                        ▼
                  ┌───────────────────────────────────────────┐
                  │            Express.js API Server          │
                  │        Node.js + Socket.io Server         │
                  └──────┬──────────────┬──────────────┬──────┘
                         │              │              │
                         ▼              ▼              ▼
                 ┌──────────────┐ ┌───────────┐ ┌──────────────┐
                 │ MongoDB Atlas│ │Cloudinary │ │ Google OAuth │
                 │ Database     │ │Media Store│ │ API Auth     │
                 └──────────────┘ └───────────┘ └──────────────┘
```

### Core Architecture Highlights:
- **Monorepo Layout**: Dual root folders (`/backend` and `/frontend`).
- **Domain-Driven Frontend**: Frontend components are strictly partitioned by actor in `src/modules/{user|caretaker|admin}`.
- **Bi-directional WebSockets**: Integrated `Socket.io` server attached directly to the Node HTTP server for real-time notifications, typing status, presence tracking, and instant messaging.
- **Media Pipeline**: In-memory `Multer` file buffer parsing combined with `DataURI` and `Cloudinary v2` API for secure image storage.

---

## 2. Role-Based Access Control (RBAC) & Authentication

### 💡 What It Does
Provides secure authentication and user access management across three distinct roles:
1. **User (Default)**: Pet owners looking to buy/sell pets, search caretakers, book services, and send connection requests.
2. **Caretaker**: Verified service providers who showcase professional profiles, set daily/hourly rates, manage service bookings, and interact with pet owners.
3. **Admin**: Platform moderators with root privileges to approve pet listings, review caretaker applications, approve professional profile drafts, and inspect user accounts.

### ⚙️ How It Works (Technical Execution)
- **Password Security**: Passwords are standardly hashed with `bcrypt` (salt rounds = 10).
- **Session Tokens**: Issues JSON Web Tokens (JWT) containing `{ id, role }`. Tokens are transmitted via `Authorization: Bearer <token>` headers or HTTP-Only cookies (`user_token`, `caretaker_token`, `admin_token`).
- **Google OAuth**: Integrated using `@react-oauth/google` on the frontend and `google-auth-library` on the backend. When a user logs in via Google, their profile is verified and synced; if new, an account is automatically created.
- **Backend Guard Middleware**:
  - `isAuth.js`: Validates standard user JWTs.
  - `caretakerIsAuth.js`: Ensures the token holder has role `caretaker`.
  - `isAdmin.js`: Ensures the token holder has role `admin`.
  - `authenticate.js`: Flexible middleware supporting multi-role access checks (e.g. `authenticate(["user", "caretaker"])`).
- **Frontend Route Protection**: Implemented in `src/routes/index.jsx` via `AuthContext.jsx`. Any route violation dynamically redirects the client to the `/login` or unauthorized landing page.

---

## 3. Pet E-Commerce & Listing Engine

### 💡 What It Does
Allows users to list their pets for sale or adoption and enables other users to search, view details, wishlist, and purchase listed pets.

```
[User Posts Pet] ──► [Uploaded to Cloudinary] ──► [Status: Pending Admin Review]
                                                            │
                                                   (Admin Approves)
                                                            │
                                                            ▼
[User Purchases Pet] ◄── [Appears on Marketplace] ◄── [Status: Approved & Verified]
          │
          ▼
[Pet Marked Sold (`soldBool: true`)]
```

### ⚙️ How It Works (Technical Execution)
- **Data Model**: Defined in `backend/Models/petModel.js` (`PetOrder`).
  - Fields: `category`, `type`, `breed`, `age`, `price`, `description`, `owner` (ref `User`), `buyer` (ref `User`), `image` (`{ id, url }`), `isVerified` (Boolean), `isApproved` (Boolean), `soldBool` (Boolean).
- **Selling Flow**:
  1. Frontend form (`SellPets.jsx`) submits `multipart/form-data` with pet details and image.
  2. Backend `userRouter.post("/sell-pet", isAuth, uploadFile, sellPet)` processes the image with Multer and uploads it to Cloudinary.
  3. A new `PetOrder` document is created with `isApproved: false`.
- **Admin Verification Flow**:
  1. Admins fetch pending listings via `GET /api/admin/get-pet-list`.
  2. Approving via `POST /api/admin/approve-pet` sets `isApproved: true` and `isVerified: true`.
- **Marketplace Browsing & Purchasing**:
  1. Users query `GET /api/user/buy-pet` to view verified, unsold listings (`isApproved: true`, `soldBool: false`).
  2. Buying a pet via `POST /api/user/book-pet` sets `soldBool: true` and updates `buyer` to the purchasing user's ID.
- **Wishlist Engine**:
  - `POST /api/user/wishlist/toggle` allows users to bookmark/un-bookmark pets stored in their user profile document.

---

## 4. Caretaker Onboarding & Verification System

### 💡 What It Does
Allows standard `user` account holders to apply for upgrading their role to a verified `caretaker`.

### ⚙️ How It Works (Technical Execution)
- **Data Model**: `backend/Models/caretakerApplicationModel.js`.
  - Fields: `applicant` (ref `User`), `fullName`, `mobile`, `experience` (years), `skills` (Array), `availability` (Full-time/Part-time), `hourlyRate`, `description`, `status` (`pending`, `approved`, `rejected`), `isApproved` (Boolean), `isVerified` (Boolean).
- **Application Submission**:
  - Route: `POST /api/caretaker/apply`.
  - Form validation ensures non-duplicate pending applications per user.
- **Admin Approval**:
  - Admin reviews applications at `GET /api/admin/get-caretaker-list`.
  - Triggering `POST /api/admin/approve-caretaker`:
    1. Sets application `status` to `approved` and `isApproved: true`.
    2. Updates the associated `User` model's `role` field from `"user"` to `"caretaker"`.
    3. Initializes an empty `CaretakerProfile` model so the caretaker can set up their public showcase.

---

## 5. Professional Caretaker Showcase & Versioning Engine

### 💡 What It Does
Provides caretakers with a rich, multi-section showcase (services, rates, home environment, trust badges, gallery, availability calendar, and safety info) and protects platform quality through an **Admin Draft Approval & Version Archiving** flow.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Caretaker Profile Engine                        │
│                                                                        │
│  [Live Approved Profile] (v1)   ◄─── Promoted on Approval ──┐           │
│           ▲                                                │           │
│           │ (Public View)                                  │           │
│           │                                                │           │
│  [Pending Draft Profile] (v2) ──── Submitted by Caretaker ─┘           │
│           │                                                            │
│           ▼                                                            │
│  [Admin Side-by-Side Review] ──► [If Rejected]: Kept as draft with     │
│                                  rejection reason feedback             │
└────────────────────────────────────────────────────────────────────────┘
```

### ⚙️ How It Works (Technical Execution)
- **Data Model**: `backend/Models/caretakerProfileModel.js`.
  - Tracks: `version`, `status` (`pending`, `approved`, `rejected`, `archived`), `headline`, `profileImage`, `coverBanner`, `services` (array of service objects with custom rates/units), `baseDailyRate`, `additionalPetRate`, `holidayRate`, `availabilityDays`, `operatingHours`, `gallery`, `homeEnvironment` (housing, yard, own pets, children), `safetyInfo` (emergency vet, first-aid, insurance), and `rejectionReason`.
- **Draft Creation Flow**:
  - When an approved caretaker updates their showcase (`POST /api/caretaker/professional-profile`), the system checks if a `pending` draft already exists.
  - If a draft exists, it updates the draft. If not, it clones the live profile into a new document with `version = currentVersion + 1` and `status = "pending"`.
  - The live profile remains active on the public site until the new draft is approved.
- **Admin Side-by-Side Approval Flow**:
  1. Admins fetch pending profile drafts via `GET /api/admin/caretaker-profiles/pending`.
  2. The admin portal renders a side-by-side comparison (`AdminProfileReview.jsx`) highlighting changes between the live profile and the proposed draft.
  3. `POST /api/admin/caretaker-profiles/approve`: Archives the old live profile (`status: "archived"`) and promotes the draft (`status: "approved"`).
  4. `POST /api/admin/caretaker-profiles/reject`: Sets draft `status: "rejected"` and records a `rejectionReason` visible to the caretaker.

---

## 6. Real-Time Connection Requests & Socket.io Messaging System

### 💡 What It Does
Facilitates connection building between pet owners and caretakers (or between pet owners). Users must send a Connection Request; once accepted, a 1-on-1 real-time chat room is unlocked featuring instant messaging, file uploads, read receipts, typing indicators, and online/offline status.

### ⚙️ How It Works (Technical Execution)
- **Data Models**:
  - `ConnectionRequest` (`connectionRequestModel.js`): Tracks `requester`, `recipient`, `status` (`pending`, `accepted`, `rejected`), `message`.
  - `Conversation` (`conversationModel.js`): Tracks `participants` (Array of 2 ObjectIds), `lastMessage` (ref `Message`), `updatedAt`.
  - `Message` (`messageModel.js`): Tracks `conversationId`, `sender`, `text`, `image` (`{ id, url }`), `readBy` (Array of ObjectIds), `createdAt`.
- **Connection Handshake**:
  1. User A posts to `POST /api/chat/requests` with `recipientId`.
  2. Recipient receives a notification and responds via `PATCH /api/chat/requests/:id/respond` (`action: "accept"` or `"reject"`).
  3. Upon acceptance, the controller automatically creates or fetches a `Conversation` document.
- **Real-Time WebSocket Architecture (`backend/socket.js`)**:
  - **Socket Authentication**: `io.use()` validates JWT tokens passed via handshake auth or cookies.
  - **Personal User Room**: Upon connecting, every user joins a private Socket room matching their `userId` (`socket.join(socket.user.id)`).
  - **Conversation Rooms**: Opening a chat joins the room `conversationId`.
  - **Real-Time Events**:
    - `send_message`: Emits `new_message` to participants in the room.
    - `typing` / `stop_typing`: Emits real-time typing indicators.
    - `mark_as_read`: Updates database read receipts and emits `chat_messages_read`.
    - `user_online` / `user_offline`: Broadcasts user online status and updates `lastSeen` timestamp in MongoDB upon disconnect.
- **Media Messaging**:
  - `POST /api/chat/messages` accepts `multipart/form-data` (text + optional image attachment via Multer & Cloudinary).

---

## 7. Real-Time Notification System & Unread Counters

### 💡 What It Does
Keeps users instantly notified about connection requests, application approvals, new messages, and booking updates. Displays persistent unread badges on the navigation bar that clear dynamically when read.

### ⚙️ How It Works (Technical Execution)
- **Data Model**: `backend/Models/notificationModel.js`.
  - Fields: `user` (recipient ObjectId), `sender` (triggering user ObjectId), `type` (`connection_request`, `request_accepted`, `request_rejected`, `new_message`, `booking_update`, `profile_approval`), `title`, `message`, `conversationId`, `read` (Boolean, default `false`).
- **Real-Time Triggering**:
  - Whenever a new notification is generated in the controller, it is saved to MongoDB and instantly pushed over WebSockets to the recipient's personal socket room:
    ```javascript
    io.to(recipientId).emit("notification", notificationDoc);
    ```
- **Dynamic Un-Badging**:
  - Opening a chat room triggers `mark_as_read` via WebSockets, which sets `read: true` on both `Message` and `Notification` models, instantly updating the Navbar badge without requiring a page reload.

---

## 8. Admin Supervision & Platform Control Panel

### 💡 What It Does
Equips platform administrators with oversight tools to maintain platform quality, verify listings, audit caretakers, and monitor transactions.

### ⚙️ How It Works (Technical Execution)
- **Admin Authentication**: Uses separate `/api/admin/login` routes and seeds a default admin account from `.env` (`ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`) on server launch via `backend/Seed/adminSeeder.js`.
- **Control Features**:
  - **User Directory**: View all registered users, roles, and registration dates (`GET /api/admin/display-users`).
  - **Pet Moderation**: Approve/reject pet sale listings (`GET /api/admin/get-pet-list`, `POST /api/admin/approve-pet`). View completed pet sales (`GET /api/admin/sold-pets`).
  - **Caretaker Verification**: Approve/reject new caretaker role applications (`GET /api/admin/get-caretaker-list`, `POST /api/admin/approve-caretaker`).
  - **Professional Profile Draft Auditing**: Side-by-side version comparison and approval (`GET /api/admin/caretaker-profiles/pending`).

---

## 9. Proposed Architectural Changes & Feature Recommendations

Based on a thorough review of the codebase, here are the most impactful technical and functional improvements recommended for PetConnect:

### 🚀 1. Payment Gateway Integration (Stripe / Razorpay)
- **Current State**: Pet purchases and caretaker bookings update database status flags immediately without financial settlement.
- **Recommended Change**: Integrate **Stripe** or **Razorpay** checkout flows.
  - Implement an escrow system for Caretaker Bookings: Payment is held when a booking is accepted and released to the caretaker upon marking the booking as `completed`.
  - Integrate webhooks (`/api/webhooks/stripe`) to handle payment confirmations securely.

### 🔐 2. Enhanced Security & Input Validation
- **Current State**: Basic controller checks exist, but schema validation could be tightened.
- **Recommended Change**:
  - Introduce **Zod** or **Joi** request validation middleware on all API endpoints.
  - Implement `express-rate-limit` to prevent brute-force attacks on `/api/auth/login` and `/api/user/sell-pet`.
  - Configure **Helmet.js** middleware for HTTP security header hardening.

### 📱 3. Voice / Video Calls for Pet Owners & Caretakers (WebRTC)
- **Current State**: Real-time chat supports text and images.
- **Recommended Change**: Leverage the existing `Socket.io` signaling server to add **WebRTC peer-to-peer audio/video calling**. This allows pet owners to conduct virtual interviews or check in on their pets via live video.

### 📊 4. Interactive Booking Calendar & Time-Slot System
- **Current State**: Bookings specify date and hours as basic inputs.
- **Recommended Change**: Upgrade `CaretakerProfile` to include interactive time-slot management (e.g., morning/evening slots, blackout dates) with frontend visual calendars (using `FullCalendar` or `react-big-calendar`).

### 🔍 5. Advanced Search, Geospatial Filtering & Reviews System
- **Current State**: Caretaker and pet listings are retrieved in standard lists.
- **Recommended Change**:
  - Add MongoDB **2dsphere Geospatial Indexing** (`location: { type: "Point", coordinates: [lng, lat] }`) to enable "Find Caretakers / Pets Near Me" filtering.
  - Implement a **Review & Rating System** (`Review` schema) so pet owners can leave 1–5 star reviews and verified feedback after completed bookings.

### 🌐 6. Socket.io Scalability with Redis Adapter
- **Current State**: Socket.io uses in-memory Maps (`onlineUsers`) on a single Node process.
- **Recommended Change**: For multi-instance horizontal scaling, connect `@socket.io/redis-adapter` so WebSocket messages and presence states synchronize across multiple backend servers seamlessly.

---
*Documentation generated for PetConnect codebase review & upgrade roadmap.*
