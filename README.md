# 💰 Splitr – Smart Expense Sharing App

![MERN Stack](https://img.shields.io/badge/MERN-Full%20Stack-blue)
![Auth](https://img.shields.io/badge/Auth-Clerk-purple)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success)

Splitr is a modern, full-stack expense sharing application designed to simplify group finances.  
It allows users to create groups, split bills (Equally, Exactly, or by Percentage), and track debts with a built-in **Debt Simplification Algorithm** to minimize transactions.

---

## 🚀 Live Demo

- **Frontend (App):** https://splitr-brown-omega.vercel.app/
- **Backend (API):** https://splitr-backend-f0uj.onrender.com

---

## ✨ Key Features

### 🔐 Authentication & Security
- Secure Google OAuth login using **Clerk**
- Session management handled by Clerk
- Custom middleware syncs Clerk users with MongoDB automatically

---

### 💸 Advanced Expense Logic
- Create and manage groups
- Add expenses with flexible split options:
  - **Equal Split** – evenly divides the total amount
  - **Exact Split** – specify exact amounts per user
  - **Percentage Split** – custom percentages (validated to 100%)
- Real-time balance tracking (who owes whom)
- **Debt Simplification Algorithm** reduces total transactions using graph logic

---

### 📊 Visual Analytics & UX
- Interactive **Bar Charts** using Recharts
- Smooth animations powered by **Framer Motion**
- Fully responsive design (Mobile & Desktop)
- Dark / Light mode support

---

## 🛠️ Tech Stack

### Frontend
- Next.js (React)
- TypeScript
- Tailwind CSS
- Framer Motion
- Recharts

### Backend
- Node.js
- Express.js

### Database
- MongoDB (Mongoose)

### Authentication
- Clerk (Next.js & Express SDK)

### Deployment
- **Frontend:** Vercel
- **Backend:** Render

---

## ⚙️ Local Setup Guide

Follow the steps below to run the project locally.

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/ParthDedhia1304/Splitr.git
cd Splitr
2️⃣ Backend Setup
Navigate to the backend directory and install dependencies:

bash
Copy code
cd server
npm install
Create a .env file inside the server directory:

env
Copy code
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLERK_SECRET_KEY=sk_test_...
Start the backend server:

bash
Copy code
node index.js
Backend will be running at:

text
Copy code
http://localhost:5000
3️⃣ Frontend Setup
Open a new terminal and navigate to the frontend directory:

bash
Copy code
cd client
npm install
Create a .env.local file inside the client directory:

env
Copy code
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_API_URL=http://localhost:5000/api
Start the frontend development server:

bash
Copy code
npm run dev
Open the app in your browser:

text
Copy code
http://localhost:3000
🤝 Contributing
Contributions are welcome!

Fork the repository

Create a new branch

Commit your changes

Open a Pull Request

📄 License
This project is licensed under the MIT License.
