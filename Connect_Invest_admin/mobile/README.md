# Forge Connect - Admin Mobile Application (React Native CLI)

Dedicated mobile application for **Forge Connect Platform Administrators** built with **Bare React Native CLI** (no Expo), connecting directly to the central Express + MongoDB backend.

---

## 📱 Features

1. **Operations Dashboard**:
   - Live KPI cards: Total Invested Capital, Active Capital, Pending Action items.
   - Quick routing to Approvals & Offer Management.
2. **Compliance & Approvals (WorkList)**:
   - Investor KYC approval / rejection / more-info workflow with mandatory decision remarks.
   - Company KYB (entity verification) approval workflow.
   - Badges showing live pending count.
3. **Shareholder Registry**:
   - Full tracking of Equity / Shareholder investments (Model 3).
   - Prominently displays **Shareholding Stake Percentage (%)**, total shares held, and invested capital.
   - On-the-fly allotment status updates, certificate number assignment, and demat/folio tagging.
4. **Investment Opportunities**:
   - Filter by **Equity / Shares**, **Project Asset**, or **Company Debt**.
   - Equity metrics: Share Price, Dilution %, Valuation, Voting Rights.
   - Debt metrics: Annual Yield % p.a., Tenures, Min Ticket.
   - Quick one-tap offer activation.
5. **Configurable Backend Host**:
   - In-app switcher on the Login Screen to seamlessly toggle between Android Emulator (`10.0.2.2:5000`), USB reverse port (`localhost:5000`), or Wi-Fi LAN IP (`192.168.x.x:5000`).

---

## 🛠 Prerequisites

- **Node.js**: >= 18.x
- **Java Development Kit (JDK)**: OpenJDK 17
- **Android Studio**:
  - Android SDK Platform 34 or 35
  - Android SDK Command-line Tools
  - Android SDK Build-Tools
  - Android Virtual Device (AVD) or physical device with USB Debugging enabled
- **Environment Variables** (in Windows User Environment Variables):
  ```
  ANDROID_HOME = C:\Users\<YourUser>\AppData\Local\Android\Sdk
  Path += %ANDROID_HOME%\platform-tools
  Path += %ANDROID_HOME%\emulator
  ```

---

## 🚀 Setup & Execution

### 1. Install Dependencies & Check Environment
From the `mobile/` directory:
```bash
cd mobile
npm install
```

To verify your Android SDK, JDK, and emulator setup:
```bash
npm run doctor
```

### 2. Connect to the Backend
Ensure the backend is running on port 5000:
```bash
# In the root or backend/ directory
npm run dev:backend
```

#### Scenario A: Android Emulator
Android emulator automatically maps `http://10.0.2.2:5000` to your host computer's `localhost:5000`. This is the default setting in the mobile app.

#### Scenario B: Physical Phone via USB Cable
1. Connect phone with USB Debugging turned ON.
2. Run adb reverse command:
   ```bash
   adb reverse tcp:5000 tcp:5000
   ```
3. Set host to `http://localhost:5000` on the app's Login screen.

#### Scenario C: Physical Phone on Same Wi-Fi
1. Find your PC's LAN IP via `ipconfig` (e.g. `192.168.1.15`).
2. Set host to `http://192.168.1.15:5000` on the app's Login screen.

### 3. Launch Metro Bundler
```bash
npm start
```

### 4. Run on Android
In a separate terminal:
```bash
npm run android
```

---

## 🔐 Default Admin Credentials

- **Email**: `admin@connectinvest.com`
- **Password**: `AdminPassword123!`

---

## 📂 Architecture

```
mobile/
├── android/               # Native Android project configuration
│   └── app/src/main/AndroidManifest.xml
├── src/
│   ├── components/        # Reusable UI widgets
│   │   ├── Header.jsx     # Top bar with branding & logout
│   │   └── TabBar.jsx     # Bottom navigation with pending badges
│   ├── context/
│   │   └── AuthContext.jsx # AsyncStorage session & auth state
│   ├── screens/
│   │   ├── LoginScreen.jsx       # Auth & Host IP configurator
│   │   ├── DashboardScreen.jsx   # Live operational metrics
│   │   ├── WorkListScreen.jsx    # KYC / KYB approval workflows
│   │   ├── ShareholdersScreen.jsx# Cap table & % shareholding
│   │   └── OffersScreen.jsx      # Debt & Equity offers
│   ├── services/
│   │   └── api.js         # Axios client, JWT interceptor, formatINR
│   └── App.jsx            # Root component with providers & navigation
├── app.json
├── babel.config.js
├── metro.config.js
└── package.json
```

