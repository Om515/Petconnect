# PetConnect 🐾

PetConnect is a full-stack MERN (MongoDB, Express, React, Node.js) application designed to bridge the gap between pet owners, caretakers, and administrators. It provides a comprehensive platform for managing pet services, user roles, and administrative tasks.

## 🚀 Features

* **Multi-Role Authentication**: Distinct access and dashboards for Users (Pet Owners), Caretakers, and Admins.
* **User Dashboard**: Manage pet profiles, request services, and find caretakers.
* **Caretaker Dashboard**: Offer services, manage bookings, and interact with pet owners.
* **Admin Platform**: Modularized administrative interface to manage users, caretakers, and monitor all platform activity.
* **Responsive Design**: Fast and intuitive UI built with React and modern styling tools.

## 🛠️ Tech Stack

* **Frontend**: React.js, Vite, React Router DOM.
* **Backend**: Node.js, Express.js.
* **Database**: MongoDB (Mongoose).
* **Security**: JWT (JSON Web Tokens) for authentication.

## 📋 Prerequisites

Before you begin, ensure you have met the following requirements:

* [Node.js](https://nodejs.org/en/) installed
* [MongoDB](https://www.mongodb.com/) installed or a MongoDB Atlas cluster setup
* Git

## ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YourUsername/PetConnect-MERN.git
   cd PetConnect-MERN
   ```

2. **Setup the Backend:**
   ```bash
   cd backend
   npm install
   ```
   * Create a `.env` file in the `backend/` directory. You will need to add environment variables such as your MongoDB connection string (`MONGO_URI`) and your JWT signature secret (`JWT_SECRET`).

3. **Setup the Frontend:**
   ```bash
   cd ../frontend
   npm install
   ```

## 🏃‍♂️ Running the Application Locally

You will need to run the frontend and backend servers in separate terminal instances.

**1. Start the Backend Server:**
```bash
cd backend
npm run dev
```

**2. Start the Frontend Server:**
```bash
cd frontend
npm run dev
```

The frontend will typically be accessible at `http://localhost:5173` (depending on Vite's allocation), while the backend API will run on the port specified in your configuration (commonly `http://localhost:5000`).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
