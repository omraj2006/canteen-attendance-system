# 🍽️ Smart Canteen Attendance & Digital Coupon System

A **Progressive Web Application (PWA)** that digitizes attendance tracking and food-coupon management for hostels and institutional canteens — replacing manual registers and paper coupons with **QR-code based attendance** and a **digital coupon wallet**.

Built as a Project Based Learning (PBL) project by students of the **Department of Information Technology, Pune Institute of Computer Technology (PICT)**.

🔗 **Live Demo:** [canteen-attendance-system-nmis.vercel.app](https://canteen-attendance-system-nmis.vercel.app)

---

## 📌 Table of Contents

- [Problem Statement](#-problem-statement)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Database Schema](#-database-schema)
- [User Roles & Modules](#-user-roles--modules)
- [Screenshots](#-screenshots)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Limitations](#-limitations)
- [Future Enhancements](#-future-enhancements)
- [Contributors](#-contributors)
- [References](#-references)

---

## 🎯 Problem Statement

In most hostels and institutional canteens, attendance tracking and food coupon distribution still rely on **manual paper registers and physical coupons**. This leads to:

- Proxy attendance
- Loss, duplication, or misuse of physical coupons
- No centralized record-keeping
- Time-consuming manual entry and verification
- Zero real-time visibility for administrators

This project replaces that entire manual workflow with a secure, centralized, digital system.

---

## ✨ Key Features

- 🔐 **Role-based authentication** — separate flows for Hostel Students, Day Scholars, and Admins
- 📷 **QR code-based attendance** — students scan/generate a QR to mark meal attendance instantly
- 🚫 **Duplicate attendance prevention** — backend validation blocks multiple entries for the same meal/day
- 🎟️ **Digital coupon wallet** — day scholars can purchase, track, and spend digital meal coupons (no physical tokens)
- 💬 **Meal feedback system** — users rate/comment on lunch & dinner
- 🗓️ **Weekly timetable viewer** — admin uploads, students view
- 📊 **Admin analytics dashboard** — live attendance logs, usage trends, coupon monitoring, active/inactive user tracking
- 📥 **Report generation/export** — attendance & usage data exportable (Excel via `exceljs`, PDF via `pdfkit`)
- 📱 **Installable PWA** — responsive, works across mobile/laptop/desktop with an app-like experience

---

## 🏗️ System Architecture

The system follows a **three-tier architecture**:

```
┌─────────────────────────────────────────────────────────┐
│  FRONTEND LAYER (React PWA)                              │
│  Dashboard · QR Attendance · Coupon Wallet · Reports      │
└───────────────────────┬────────────────────────────────┘
                         │  REST API (HTTPS)
┌───────────────────────▼────────────────────────────────┐
│  BACKEND LAYER (Node.js + Express)                        │
│  Auth · Attendance Logic · Coupon Mgmt · Feedback · API   │
└───────────────────────┬────────────────────────────────┘
                         │  Mongoose ODM
┌───────────────────────▼────────────────────────────────┐
│  DATABASE LAYER (MongoDB Atlas)                            │
│  Users · Attendance · Coupons · Transactions · Feedback   │
└─────────────────────────────────────────────────────────┘
```

**Attendance flow (sequence):**
1. User scans/presents QR code
2. Frontend sends attendance request to backend
3. Backend validates user credentials
4. Backend checks whether attendance is already marked for that meal/day
5. If valid, attendance record is stored with a timestamp
6. Confirmation is returned and displayed to the user

---

## 🛠️ Tech Stack

This project uses the **MERN Stack**:

| Layer | Technology |
|---|---|
| Frontend | React.js, HTML, CSS, JavaScript (PWA) |
| Backend | Node.js, Express.js |
| Database | MongoDB (MongoDB Atlas) |
| Auth | JWT (`jsonwebtoken`) + `bcryptjs` for password hashing |
| Reporting | `exceljs` (Excel export), `pdfkit` (PDF export) |
| Config/Networking | `dotenv`, `cors` |
| Deployment | Vercel (frontend + backend) |
| Version Control | Git & GitHub |
| Dev Tools | VS Code, Chrome DevTools |

**Why MERN?**
- React enables fast, reusable, component-based UI development
- Node.js + Express handle API requests and server logic efficiently
- MongoDB's flexible schema suits dynamic attendance/coupon data
- A single JavaScript stack across frontend & backend simplifies development
- The PWA approach avoids building separate native mobile apps while keeping an app-like feel

---

## 🗄️ Database Schema

| Table | Fields |
|---|---|
| **User** | `user_id` (PK), `name`, `email`, `password`, `role` (hosteler / day scholar / admin) |
| **Attendance** | `attendance_id` (PK), `user_id` (FK), `date`, `time` |
| **Coupon** | `coupon_id` (PK), `user_id` (FK), `balance` |
| **Transaction** | `transaction_id` (PK), `user_id` (FK), `amount`, `date` |
| **Feedback** | `feedback_id` (PK), `user_id` (FK), `meal_type`, `comment` |
| **Timetable** | `timetable_id` (PK), `schedule_data` |

**Relationships**
- `User → Attendance` : one-to-many
- `User → Coupon` : one-to-one
- `User → Feedback` : one-to-many
- `User → Transaction` : one-to-many

---

## 👥 User Roles & Modules

### 1. Hostel Student
- Login
- Mark attendance via QR code
- View attendance history
- View weekly timetable
- Submit meal feedback

### 2. Day Scholar
- Login
- Purchase digital coupons
- View coupon balance & recent transactions
- Submit meal feedback

### 3. Admin
- View live attendance records (with filters/download)
- Scan and mark attendance manually via the admin scanner
- Monitor coupon usage (active/inactive users, balances)
- View analytics dashboard (usage trends, meal distribution)
- Manage & upload the weekly timetable
- View student feedback

---

## 🖼️ Screenshots

> Screenshots below are taken from the deployed application (see full report for more).

| Day Scholar Dashboard | Hosteler Dashboard |
|---|---|
| Coupon wallet, buy coupons, weekly timetable, feedback | QR attendance pass, attendance history, feedback |

| Admin Dashboard | Admin QR Scanner |
|---|---|
| Today's attendance, analytics, coupon monitoring | Live camera-based QR scanning for meal attendance |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm
- A MongoDB connection string (local or MongoDB Atlas)

### Installation

```bash
# Clone the repository
git clone https://github.com/omraj2006/canteen-attendance-system.git
cd canteen-attendance-system

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Running locally

```bash
# Start the backend server
npm start
# Backend runs on the port defined in your .env (default: e.g. 5000)

# In a separate terminal, start the frontend
cd frontend
npm start
```

### Seeding sample data

```bash
node preload-hostelers.js
```

This preloads sample hosteler records into the database (see `dummy_data/` for reference data).

---

## 🔑 Environment Variables

Create a `.env` file in the project root with the following:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

> ⚠️ Never commit your `.env` file. Add it to `.gitignore`.

---

## ☁️ Deployment

- **Frontend & Backend:** Deployed on [Vercel](https://vercel.com) (see `vercel.json`)
- **Database:** MongoDB Atlas (cloud-hosted)
- During development, the locally-run backend was exposed via **ngrok** for testing before full deployment

**Live App:** [canteen-attendance-system-nmis.vercel.app](https://canteen-attendance-system-nmis.vercel.app)

---

## ✅ Testing

The system was validated through:

- **Unit Testing** — login validation, attendance marking logic, coupon balance updates
- **Integration Testing** — frontend↔backend API calls, backend↔database interactions, full login → attendance → storage flow
- **System Testing** — end-to-end testing of QR attendance, coupon purchase/usage, and admin dashboard functionality across devices/browsers

---

## ⚠️ Limitations

- No biometric/face verification — proxy attendance is still technically possible
- Not stress-tested for large-scale/production traffic
- Requires an active internet connection
- Basic UI with room for further polish

---

## 🔮 Future Enhancements

- Face recognition / biometric authentication to eliminate proxy attendance
- Dynamic (time-rotating) QR codes for stronger security
- Dedicated mobile app version
- Online payment gateway integration for coupon purchases
- Real-time push notifications for attendance & coupon events
- Predictive analytics for meal demand forecasting
- Full backend deployment on a dedicated cloud host (Render/Railway) for production scale

---

## 👨‍💻 Contributors

Developed by Second Year B.Tech (Information Technology) students at **PICT, Pune** (AY 2025–2026):

| Roll No. | Name |
|---|---|
| S240503058 (23226) | Prathmesh Fulpagare |
| S240503073 (23233) | Hariom Goley |
| S240503079 (23234) | Omraj Holkar |
| S240503085 (23237) | Anuj Jadhav |

**Project Guide:** Prof. Abhinay G. Dhamankar
**HOD, Information Technology:** Dr. Emmanual Mark

---

## 📚 References

1. [MongoDB Documentation](https://www.mongodb.com/docs/)
2. [React Documentation](https://react.dev/)
3. [Node.js Documentation](https://nodejs.org/en/docs/)
4. [Express.js Documentation](https://expressjs.com/)
5. [Vercel Documentation](https://vercel.com/docs)
6. [Ngrok Documentation](https://ngrok.com/docs)
7. [MDN Web Docs](https://developer.mozilla.org/)
8. [W3Schools](https://www.w3schools.com/)
9. [Google Developers – Progressive Web Apps](https://developers.google.com/web/progressive-web-apps)
10. [GitHub Documentation](https://docs.github.com/)

---

## 📄 License

This project was developed for academic purposes as part of the Project Based Learning (PBL) curriculum at Pune Institute of Computer Technology. Feel free to fork and build upon it for learning purposes.
