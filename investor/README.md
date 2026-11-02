# Connect Invest – Investor Platform (MERN Stack)

Institutional-grade investor website and real REST API backend built with the **MERN** stack (MongoDB, Express.js, React.js, Node.js).

## System Architecture

```
connect-invest-investor/
│
├── Invester_Website/         # React.js 18 + Vite Frontend
│   ├── public/images/        # Visual assets (City skyline with golden trend arrow)
│   ├── src/
│   │   ├── components/       # Common, layout, and investment cards/charts
│   │   ├── pages/            # Public, Auth (Login, Register), and Investor Dashboard
│   │   ├── services/         # Centralized Axios API client (Zero mock data!)
│   │   ├── context/          # Auth & System Adaptability Contexts
│   │   └── index.css         # Deep Wine (#3B0A11), Warm Beige (#F8F5F0), Gold (#C8963E)
│
└── backend/                  # Express.js + Mongoose Backend
    ├── src/
    │   ├── config/           # MongoDB connection & ENV
    │   ├── models/           # User, Profile, InvestmentOffer, Investment, Transaction, KYC, Payout
    │   ├── controllers/      # Auth, Investments, Dashboard, Payments, KYC, Payouts
    │   ├── routes/           # REST API endpoints
    │   └── seeders/seedData.js # Database seeder
```

## System Adaptability Features
- **Responsive Viewport Adaptability:** Seamlessly transitions between 4K/Desktop, Tablet, and Mobile layouts.
- **Theme & OS Preference Adaptability:** Built-in Light Warm Beige Mode, Dark Mode, and System Theme auto-detection.
- **Network Resilience:** Real-time offline detection and automatic retry on reconnection.
- **KYC Gating Lifecycle:** Investment actions dynamically gate until verified by the backend.

## Quick Start

### 1. Seed & Launch the Backend API
```bash
cd backend
npm install
npm run seed     # Populates verified offers and Rahul Sharma test investor
npm start        # Running on http://localhost:5000/api
```

### 2. Launch the Investor Website
```bash
cd Invester_Website
npm install
npm run dev      # Running on http://localhost:5173
```

### Default Test Credentials
- **Email:** `rahul.sharma@investor.com`
- **Password:** `Password@123`
