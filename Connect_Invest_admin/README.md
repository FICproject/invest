# Connect Invest — Admin Console & Core Financial Engine

Built strictly adhering to **Connect Invest PRD v1.0**.

---

## 1. System Overview

- **Scope:** Dedicated **Admin Dashboard (Website)** and **Core Financial API/Database Engine**.
- **Admin Model:** **Single Admin** with full preparation and approval authority, protected by 2-step verification safeguards.
- **Database:** **100% Local MongoDB** running on `mongodb://127.0.0.1:27017/connect_invest`.
- **Zero Mock / Hardcoded Data:** Every screen, table, form, and metric executes real Mongoose CRUD operations and multi-document ACID transactions against MongoDB.
- **Multi-Developer Handshake:** Pre-configured data schemas and contracts so your teammate's **Investor** and **Company** portals (web & React Native mobile app) plug in seamlessly with zero schema rewrites.

---

## 2. Quick Start Guide

### Step 1: Start Local MongoDB
Ensure your local MongoDB daemon is running on port 27017:
```powershell
mongod --dbpath <your_local_data_directory>
```
*(Optional for Replica Set transactions: `mongod --replSet rs0 --dbpath <data_dir>` then `npm run db:replica` in backend)*

### Step 2: Seed the Local Database
Seed initial real records (Admin account, sample companies with KYB documents, sample investors with KYC submissions, and sample offers):
```powershell
npm run db:seed
```
**Default Admin Credentials:**
- **Email:** `admin@connectinvest.com`
- **Password:** `AdminPassword123!`
- Direct sign-in (2-step authentication removed; eye icon available to view/hide password).

### Step 3: Start the Backend API Server
```powershell
npm run dev:backend
```
Server runs at `http://localhost:5000` (Health check: `http://localhost:5000/api/health`).

### Step 4: Start the Frontend Admin Dashboard (Web)
In a separate terminal:
```powershell
npm run dev:frontend
```
Frontend runs at `http://localhost:5173`.

### Step 5: Start the Admin Mobile App (React Native CLI)
The project also includes a standalone **React Native CLI** admin mobile application in `mobile/`:
```powershell
# In terminal 1: Start Metro bundler
npm run dev:mobile

# In terminal 2: Launch Android application
npm run mobile:android
```
See [`mobile/README.md`](file:///d:/Projects/Connect_Invest_admin/mobile/README.md) for Android emulator and physical device networking setup.

---

## 3. Core Admin Capabilities (PRD v1.0)

| Module | What It Does | PRD Reference |
|---|---|---|
| **Operational Dashboard** | 6 live performance metric tiles (Total Raised, Active Investments, Upcoming Payouts, Overdue Repayments, Pending Approvals, Failed Payments). Each tile supports 1-click drill down. | Section 5.5 M-1 & 6.3 |
| **Work List** | Consolidated actionable queue for pending KYC, pending KYB, submitted project drafts, and failed payout retries. | Section 6.3 |
| **Investors & KYC** | View investor profiles, inspect identity documents and PAN proofs, record Approve/Reject/More-info decisions with **mandatory written reasons**, and block/unblock accounts. | Section 5.1 A-5 & A-7 |
| **Companies & KYB** | Admin creates companies, generates 7-day single-use owner invite links, inspects KYB corporate records, and enforces the 3-day bank cooling-off safeguard. | Section 5.1 A-6 & 5.2 C-1 |
| **Offers & Term Sheets** | Reviews draft proposals, enforces lock-in tenures ($\ge 12$m for projects, $\ge 60$m for companies), configures basis point monthly returns (`rateBps`), publishes, and activates funded offers. | Section 3.1, 5.2 C-4, F-1, F-2 |
| **Fund Releases** | 2-step verification disbursement of raised capital to verified company accounts. Automatically blocked if the account is in 3-day cooling-off (`BANK_IN_COOLING_OFF`). | Section 5.4 F-3 |
| **Repayments Monitor** | Real-time tracker for company monthly return and principal dues, receipt confirmation with bank UTRs, overdue warnings, and 30-day default flags. | Section 5.4 F-6 & 4.7 |
| **Payout Batches** | Group confirmed investor return lines into batches, preview totals, authorize execution, and retry failed bank transfers. | Section 5.4 F-7 & F-8 |
| **Immutable Audit Log** | Tamper-proof add-only log recording every mutation with before/after state diff snapshots. | Section 5.5 M-3 |
| **Reports & Export** | 1-click live CSV export for investors, companies, offers, and payout transactions. | Section 5.5 M-2 |

---

## 4. Investment Models & Teammate Handshake Contracts

Connect Invest supports **3 distinct investment models**:

| Model | Kind Key | Tenure & Maturity | Return Structure | Ownership & Risk |
|---|---|---|---|---|
| **1. Project Investment** | `'project'` | $\ge 12$ months lock-in | Fixed monthly return (`rateBps`), principal returned at maturity | Senior creditor; fixed debt obligation |
| **2. Company Investment** | `'company'` | $\ge 60$ months lock-in | Fixed monthly return (`rateBps`), principal returned at maturity | Senior creditor; corporate debt obligation |
| **3. Equity / Shareholder** | `'equity'` | **Perpetual (No fixed tenure or maturity)** | **Discretionary Dividends + Value Growth** | Subordinated shareholder; direct shares & loss risk |

When your teammate develops the Company and Investor applications:
1. **Currency in Whole Paise**: All monetary figures are passed as 64-bit integers in whole paise (₹1,000 = `100000`).
2. **Debt Monthly Return Formula (Models 1 & 2)**:
   $$\text{monthlyReturnPaise} = \text{round\_half\_up}\left(\frac{\text{principalPaise} \times \text{rateBps}}{10000}\right)$$
3. **Equity Shareholding & Dividend Formula (Model 3)**:
   $$\text{sharesAllotted} = \left\lfloor \frac{\text{amountPaise}}{\text{sharePricePaise}} \right\rfloor$$
   $$\text{investorDividendPaise} = \text{sharesOwned} \times \text{dividendPerSharePaise}$$
4. **Database Unification**: When both developers connect to the same local MongoDB, changes made on company or investor apps immediately appear in real-time on your Admin Dashboard.
