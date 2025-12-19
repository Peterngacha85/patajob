# PataJob - Local Services Marketplace (Kenya)

PataJob is a production-ready, mobile-first marketplace platform designed for the Kenyan market. It connects users with verified local service providers (plumbers, electricians, tutors, cleaners, etc.) and facilitates seamless communication via WhatsApp.

## 🚀 Tech Stack

### Backend
- **Node.js & Express.js**: Server-side logic and RESTful API.
- **MongoDB & Mongoose**: NoSQL database with optimized indexing for location-based search.
- **JWT Authentication**: Secure role-based access control (RBAC).
- **Bcrypt**: Industrial-strength password hashing.
- **MVC Architecture**: Clean separation of concerns.

### Frontend
- **React (Vite)**: Modern, fast frontend development.
- **Tailwind CSS**: Utility-first styling for a sleek, responsive UI.
- **React Router**: Client-side navigation.
- **Axios**: Efficient API communication.
- **Context API**: State management.
- **Lucide React**: Beautiful icons.

## ✨ Core Features

### 👤 Role-Based Portals
- **Clients**: Search for services, view provider profiles, book services, and leave reviews.
- **Service Providers**: Manage professional profiles, set location, provide WhatsApp contacts, and manage booking requests.
- **Admins**: Centralized dashboard to verify providers, manage users, and moderate reviews.

### 📍 Smart Search & Filtering
- Filter providers by service category and location (County + Town).
- Optimized for the Kenyan geographic context.

### 📅 Advanced Booking System
- Complete lifecycle management: Pending → Accepted → Completed/Cancelled.
- Integrated review system upon project completion.

### 📲 WhatsApp Integration
- Dynamic one-click WhatsApp chat links to connect clients and providers instantly.

## 🛠️ Project Structure

```text
LSM/
├── backend/            # Express API
│   ├── src/
│   │   ├── config/     # Database & auth config
│   │   ├── controllers/# Business logic
│   │   ├── middleare/  # Auth & error handlers
│   │   ├── models/     # Mongoose schemas
│   │   └── routes/     # REST routes
├── frontend/           # React App
│   ├── src/
│   │   ├── components/ # Reusable UI
│   │   ├── pages/      # View components
│   │   ├── services/   # API logic
│   │   └── context/    # Global state
```

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account or local MongoDB
- npm or yarn

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and add the following:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 🛡️ Security
- Environment variables for sensitive data.
- JWT-protected private routes.
- Input validation and role-based authorization.
- Password hashing with Bcrypt.
