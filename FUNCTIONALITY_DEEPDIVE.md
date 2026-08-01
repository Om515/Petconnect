# PetConnect-MERN: Functional Deep Dive
This document explains each and every functional flow of the PetConnect-MERN project.

## 1. Authentication and Access Flow (Auth System)
The platform uses a role-based access control system coupled with JWTs and Google OAuth.
- **Registration (`registerUser`, `registerCaretaker`)**: Users can sign up locally using an email and password. The password is hashed via `bcrypt`.
- **Google OAuth**: A parallel authentication method using `google-auth-library`. If an email is recognized from a Google payload, the platform logs the user in; otherwise, it registers them automatically.
- **Login (`loginUser`, `loginCaretaker`) & Logout**: Local logins cross-reference password hashes. A JWT is issued to the client upon successful validation.
- **Role Assignment**: By default, each new account starts as a `user`. 

## 2. Standard User Functionality
A `user` has access to two main markets: Pet E-Commerce and Caretaker Services.

### A. Profile Management
- **Dashboard (`myProfile`, `userAllInfo`)**: Users have a private dashboard where they can see their basic data.
- **Modification (`updateUser`, `updateAddress`)**: Users can update their general account data and location information via standard edit forms.

### B. Pet E-Commerce (Trading Pets)
- **Selling Pets (`sellPet`)**: Users can list their pets for sale. They must submit details like `category`, `breed`, `age`, `description`, `price`, along with an `image`. The uploaded image is processed by `multer`, converted via `datauri`, and stored on `cloudinary`. A new `PetOrder` document is created with `isVerified: false` and `isApproved: false`. It cannot be bought until an admin approves it.
- **Browsing Pets (`buyPetList`, `petInfo`)**: Users can browse the storefront to see all `PetOrder` documents where `isApproved: true` and `soldBool: false`. They can view detailed information for each listing.
- **Buying Pets (`bookPet`)**: When a user elects to buy a pet, the system creates a transaction binding the buyer to the pet listing and setting `soldBool: true`, preventing further purchases of the same listing.

### C. Interactions with Caretakers
- **Discovering Caretakers (`CaretakerList`)**: Users can browse a directory of all approved caretakers on the platform.
- **Viewing Caretaker Profiles (`getCaretakerProfile`)**: Users can click on a caretaker to view their extensive, public-facing Professional Profile. This includes viewing their `services` (prices and types), `gallery`, `operatingHours`, `certifications`, and `trustBadges`.
- **Booking a Service (`createBookingRequest`)**: Users can initiate a hire request for a caretaker. They specify the `date`, `hours`, and `service`, establishing a `BookingRequest` document in an initial `pending` status.
- **Managing Bookings (`getUserBookings`)**: Users have a panel to review all their past and pending booking requests.

## 3. Caretaker Upgrade & Functional Flow
The `caretaker` is an elevated role designed for users looking to sell their pet care services.

### A. The Application Process
- **Apply to be a Caretaker**: A standard `user` must fill out a `CaretakerApplication` form, submitting their real name, mobile, experience, skills, expected hourly rate, and description.
- **Admin Review**: This application sits in a `pending` status until an Admin reviews it. If approved, the Admin changes the applicant's role from `user` to `caretaker`.

### B. Caretaker Functionality
- **Professional Profile Setup (`myProfile` creation)**: Once upgraded, the caretaker can access the `/caretaker` layout in the frontend. They must fill out their `CaretakerProfile` model, which acts as their storefront window. They input their `services`, `headline`, `coverBanner`, `bio`, `homeEnvironment`, and `safetyInfo`.
- **Booking Management (`updateBookingRequestStatus`)**: Caretakers receive `BookingRequest` entries from users. They can review the requested dates and parameters and subsequently update the status to `accepted`, `rejected`, `completed`, or `cancelled`.

## 4. Administrative Functionality
The `admin` role has overriding authority to maintain the integrity of the platform.

### A. User Management (`adminUser.controller`)
- **Actioning Users**: Admins can view a listing of all users and potentially block, ban, or delete malicious actors.

### B. E-Commerce Moderation (`adminPet.controller`)
- **Approving Pet Listings**: Admins must review `PetOrder` submissions before they become public. This ensures no inappropriate or illegal listings make it to the "Buy Pets" public storefront.

### C. Caretaker Moderation (`adminCaretaker.controller`)
- **Reviewing Applications**: Admins review the `CaretakerApplication` submissions. They either approve or reject them, triggering the role upgrade for approval.
- **Reviewing Public Profiles**: Admins can also audit the `CaretakerProfile` drafts to ensure caretakers aren't putting inappropriate content into their public storefronts before changing the profile visibility to `approved`.
