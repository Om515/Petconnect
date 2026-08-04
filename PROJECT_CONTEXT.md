# PetConnect 🐾 - Comprehensive AI Context & Technical Reference

> **Purpose of this file:** This document provides a complete, structured overview of the PetConnect repository. It is designed to allow any AI assistant (ChatGPT, Claude, Gemini, Copilot, Cursor, etc.) to immediately understand the project architecture, database schemas, authentication flows, API routes, frontend structures, real-time messaging/sockets, and business logic without needing to scan every individual file.

---

## 1. Executive Summary & Project Overview

**PetConnect** is a full-stack **MERN (MongoDB, Express, React 18, Node.js)** web application built as a multi-role ecosystem for pet owners, caretakers, and platform administrators.

### Core Value Proposition & Domains:
1. **Pet Marketplace**: Allows pet owners to list pets for sale/adoption and enables users to browse, search, wishlist, and purchase pets.
2. **Caretaker Marketplace & Professional Showcase**: Allows users to apply to become pet caretakers, manage professional showcase profiles (services, daily/hourly rates, availability calendar, trust badges, home environment, gallery), and accept booking requests from pet owners.
3. **Real-Time Social & Chat System**: Enables connection requests between users/caretakers, real-time 1-on-1 socket.io chat, media sharing, read receipts, typing status, presence tracking, and instant unread notifications.
4. **Admin Supervision & Profile Approval**: Provides a centralized admin control panel to verify pet listings, approve/reject caretaker applications, and review/approve caretaker professional profile edits with side-by-side versioning comparison.

---

## 2. Tech Stack & Infrastructure

### Backend
- **Runtime**: Node.js (ESM modules `"type": "module"`)
- **Framework**: Express.js (`v4.21.2`)
- **Real-Time Engine**: Socket.io (`v4.8.1`) with JWT handshake authentication & room events
- **Database**: MongoDB using Mongoose ORM (`v8.13.0`)
- **Authentication**: JWT (`jsonwebtoken` v9.0.2) + Passwords hashed with `bcrypt` (`v5.1.1`) + Google OAuth (`google-auth-library`)
- **Middleware**: `cookie-parser`, `body-parser`, `cors`
- **File Uploads**: `multer` + `datauri` + `cloudinary` (`v2.6.0`) for media storage
- **Development Tool**: `nodemon` (`v3.1.9`)
- **Default Server Port**: `7001` (configurable via `process.env.PORT`)

### Frontend
- **Framework / Library**: React 18 SPA
- **Build Tool**: Vite
- **Routing**: `react-router-dom` (v6/v7)
- **State Management**: React Context API (`AuthContext.jsx`, `AdminContext.jsx`)
- **Styling**: Tailwind CSS + Custom CSS (`index.css`, `App.css`)
- **Icons**: React Icons / Lucide React
- **Notifications & UI**: `react-hot-toast`, `framer-motion`
- **Default Dev Port**: `5173`

---

## 3. Database Schemas & Data Models

1. **`User` Schema (`backend/Models/userModel.js`)**: Account info, role (`user`, `caretaker`, `admin`), lastSeen timestamp.
2. **`CaretakerApplication` Schema (`backend/Models/caretakerApplicationModel.js`)**: Applicant details, experience, hourly rate, status (`pending`, `approved`, `rejected`).
3. **`CaretakerProfile` Schema (`backend/Models/caretakerProfileModel.js`)**: Versioned professional profile (services, rates, home environment, trust badges, gallery, availability).
4. **`PetOrder` / `Pet` Schema (`backend/Models/petModel.js`)**: Pet category, breed, price, Cloudinary image, verification status, sold state, buyer ref.
5. **`BookingRequest` Schema (`backend/Models/bookingRequestModel.js`)**: User-caretaker booking details, status (`pending`, `accepted`, `rejected`, `completed`, `cancelled`).
6. **`ConnectionRequest` Schema (`backend/Models/connectionRequestModel.js`)**: Connection handshake state (`pending`, `accepted`, `rejected`).
7. **`Conversation` Schema (`backend/Models/conversationModel.js`)**: 1-on-1 chat room tracking participants and last message.
8. **`Message` Schema (`backend/Models/messageModel.js`)**: Message content, Cloudinary attachment image, sender, readBy array.
9. **`Notification` Schema (`backend/Models/notificationModel.js`)**: In-app push notifications with dynamic unread tracking.

---

## 4. Key Endpoints Summary

- **`/api/auth`**: User registration, login, logout, Google OAuth.
- **`/api/user`**: User profile management, pet marketplace (`sell-pet`, `buy-pet`, `book-pet`), caretaker discovery, wishlisting.
- **`/api/caretaker`**: Caretaker application submission, booking status updates, professional profile draft submission (`POST /professional-profile`).
- **`/api/chat`**: Connection requests (`/requests`), conversations (`/conversations`), message history & upload (`/messages`), notifications (`/notifications`).
- **`/api/admin`**: User management, pet approval (`/approve-pet`), caretaker application approval (`/approve-caretaker`), professional profile draft review (`/caretaker-profiles/pending`, `/caretaker-profiles/approve`).

---

## 5. Suggested Platform Improvements

1. **Payment Gateway Integration**: Stripe/Razorpay checkout flows with escrow holding until booking completion.
2. **WebRTC Video Calls**: Virtual pet check-ins and caretaker interviews using existing Socket.io signaling.
3. **Geospatial Search (2dsphere)**: Filter caretakers and pet listings by distance from user location.
4. **Reviews & Rating System**: Verified 1-5 star ratings for caretakers post-service completion.
5. **Input Validation & Rate Limiting**: Zod schema validation + `express-rate-limit` for authentication and posting forms.
