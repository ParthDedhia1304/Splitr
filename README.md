# 💰 Splitr - Smart Expense Sharing App

![MERN Stack](https://img.shields.io/badge/MERN-Full%20Stack-blue)
![Auth](https://img.shields.io/badge/Auth-Clerk-purple)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success)

A modern, full-stack expense sharing application designed to simplify group finances. Splitr allows users to create groups, split bills (Equally, Exactly, or by Percentage), and track debts with a built-in **Debt Simplification Algorithm** to minimize transactions.

## 🚀 Live Demo
- **Frontend (App):** [Click Here to View App](https://splitr-brown-omega.vercel.app/) 
- **Backend (API):** [Click Here to View API](https://splitr-backend-f0uj.onrender.com)

---

## ✨ Key Features

### 🔐 Authentication & Security
- **Secure Login:** Integrated with **Clerk** for robust Google OAuth and session management.
- **Smart Sync:** Custom middleware syncs Clerk users with the internal MongoDB database seamlessly.

### 💸 Advanced Expense Logic
- **Flexible Splits:** Support for three splitting modes:
  - **Equal:** Auto-divides amount among selected members.
  - **Exact:** Specify exact amounts for each person.
  - **Percentage:** Split by custom percentages (validated to 100%).
- **Debt Simplification:** Uses a graph algorithm to reduce the number of transactions needed to settle up.

### 📊 Visual Analytics & UX
- **Interactive Charts:** Real-time **Bar Charts** (using Recharts) visualize spending breakdowns per user.
- **Smooth Animations:** Powered by **Framer Motion** for a premium, app-like feel.
- **Dark Mode:** Fully responsive UI with toggleable Dark/Light themes.
- **Responsive Design:** Optimized for Mobile and Desktop views.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js (React), TypeScript, Tailwind CSS, Framer Motion, Recharts
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Auth:** Clerk (Next.js & Express SDKs)
- **Deployment:** Vercel (Client) + Render (Server)

---

## ⚙️ Local Setup Guide

Follow these steps to run the project locally on your machine.

## 1. Clone the Repository

git clone [https://github.com/ParthDedhia1304/Splitr.git](https://github.com/ParthDedhia1304/Splitr.git)
-cd Splitr

## 2. Backend Setup
Navigate to the server folder and install dependencies:
-cd server
-npm install
-Create a .env file in the server root:
-PORT=5000
-MONGO_URI=your_mongodb_connection_string
-CLERK_SECRET_KEY=sk_test_... (Get from Clerk Dashboard)
Run the server:
-node index.js

## 3. Frontend Setup
Open a new terminal, navigate to the client folder, and install dependencies:
cd client
npm install
Create a .env.local file in the client root:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_API_URL=http://localhost:5000/api
Run the frontend:
npm run dev
Visit http://localhost:3000 to see the app!

## 🤝 Contributing
Contributions are welcome! Please fork the repository and submit a pull request.

## 📄 License
This project is licensed under the MIT License.
