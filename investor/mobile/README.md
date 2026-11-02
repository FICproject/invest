# Connect Invest - Android Mobile Application

An institutional-grade React Native Android mobile application built for accredited investors. It connects directly to the existing Connect Invest Express & MongoDB backend without any mock data or separate backend.

---

## 🏗️ Architecture & Folder Structure

```text
invester_mobile/
│
├── android/                         # Native Android project (Gradle, Manifest, Resources)
│   ├── app/
│   │   ├── build.gradle             # Android SDK configs & packaging
│   │   └── src/main/
│   │       ├── AndroidManifest.xml  # Cleartext traffic, Internet & Biometrics permissions
│   │       ├── assets/              # Precompiled JS bundle
│   │       └── res/                 # App icons, splash and drawables
│   └── local.properties             # Android SDK path definition
│
├── src/
│   ├── assets/                      # Static assets (fonts, icons, images, animations)
│   │   ├── fonts/
│   │   ├── icons/
│   │   ├── images/
│   │   └── animations/
│   │
│   ├── components/
│   │   ├── common/                  # Atomic & reusable widgets
│   │   │   ├── CustomButton.tsx     # Primary, Gold, Outline, Secondary buttons
│   │   │   ├── CustomInput.tsx      # Form input with validation and password toggles
│   │   │   ├── Badge.tsx            # Status pills (Confirmed, Pending, Matured)
│   │   │   ├── Loader.tsx           # Loading spinners and full-screen state
│   │   │   ├── EmptyState.tsx       # Zero-state placeholders with action CTA
│   │   │   └── Icon.tsx             # Native SVG icon system (zero font linking issues)
│   │   │
│   │   ├── cards/                   # Business domain cards
│   │   │   ├── OfferCard.tsx        # Deal card: target, return rate, progress bar
│   │   │   ├── PortfolioCard.tsx    # Holding card: certificate ID, principal, returns
│   │   │   └── TransactionItem.tsx  # Inflow / outflow ledger items
│   │   │
│   │   ├── charts/
│   │   │   └── ReturnsChart.tsx     # Native SVG monthly return progression chart
│   │   │
│   │   └── modals/
│   │       ├── InvestModal.tsx      # Real-time return calculator & payment gateway
│   │       ├── FilterModal.tsx      # Sector, risk, and sorting modal
│   │       └── BiometricPrompt.tsx  # Touch ID / Fingerprint unlock simulation
│   │
│   ├── constants/
│   │   ├── colors.ts                # Deep Burgundy & Warm Gold palette
│   │   ├── typography.ts            # Typography scales
│   │   ├── routes.ts                # Screen route identifiers
│   │   └── config.ts                # Android emulator & LAN API endpoints
│   │
│   ├── context/
│   │   ├── authContext.tsx          # JWT Auth, User session & KYC gatekeeper
│   │   ├── portfolioContext.tsx     # Holdings, upcoming payouts & ledger state
│   │   └── themeContext.tsx         # Light / Dark theme toggles
│   │
│   ├── hooks/
│   │   ├── useAuth.ts               # Quick access to current session
│   │   ├── useBiometrics.ts         # Biometric authentication
│   │   ├── useDebounce.ts           # Debounce for live keyword search
│   │   └── useAndroidBackHandler.ts # Android hardware back button handler
│   │
│   ├── navigation/
│   │   ├── AppNavigator.tsx         # Auth vs Authenticated switcher
│   │   ├── AuthNavigator.tsx        # Login, Register, OTP, Forgot Password
│   │   ├── BottomTabNavigator.tsx   # 5-Tab bar: Home, Deals, Portfolio, Wallet, Profile
│   │   ├── navigationRef.ts         # Global navigation ref
│   │   └── Stacks/
│   │       ├── HomeStack.tsx
│   │       ├── DealsStack.tsx
│   │       ├── PortfolioStack.tsx
│   │       ├── WalletStack.tsx
│   │       └── ProfileStack.tsx
│   │
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   ├── OtpVerificationScreen.tsx
│   │   │   └── ForgotPasswordScreen.tsx
│   │   │
│   │   ├── home/
│   │   │   ├── HomeScreen.tsx       # Capital deployed, upcoming payout, featured deals
│   │   │   └── SearchOffersScreen.tsx
│   │   │
│   │   ├── offers/
│   │   │   ├── OfferListScreen.tsx  # Category filter chips & opportunity list
│   │   │   ├── OfferDetailsScreen.tsx # Due diligence highlights, terms, security
│   │   │   └── InvestConfirmScreen.tsx# Official certificate & ledger confirmation
│   │   │
│   │   ├── portfolio/
│   │   │   ├── PortfolioScreen.tsx  # Active vs Matured holdings
│   │   │   ├── InvestmentDetailScreen.tsx # Full certificate view
│   │   │   └── PerformanceAnalyticsScreen.tsx # Sector allocation & status distribution
│   │   │
│   │   ├── wallet/
│   │   │   ├── WalletScreen.tsx     # Yield balance, upcoming schedule, ledger
│   │   │   ├── AddFundsScreen.tsx   # Deposit capital
│   │   │   ├── RequestPayoutScreen.tsx # Payout withdrawal to verified bank
│   │   │   └── TransactionHistoryScreen.tsx # Full filtered ledger
│   │   │
│   │   ├── kyc/
│   │   │   ├── KycStatusScreen.tsx  # Compliance status & Dev testing toggle
│   │   │   └── KycUploadScreen.tsx  # PAN, residence proof & bank account input
│   │   │
│   │   ├── notifications/
│   │   │   └── NotificationsScreen.tsx # Investment, KYC and payout alerts
│   │   │
│   │   └── profile/
│   │       ├── ProfileScreen.tsx    # Investor details & menu
│   │       ├── EditProfileScreen.tsx# Address updates
│   │       ├── BankAccountsScreen.tsx # Payout destination account
│   │       └── SecuritySettingsScreen.tsx # Biometrics & API endpoint selector
│   │
│   ├── services/
│   │   ├── api.ts                   # Axios client with JWT interceptor & auto base URL
│   │   ├── authService.ts           # /api/auth
│   │   ├── offerService.ts          # /api/investments
│   │   ├── investmentService.ts     # /api/investor & /api/payments
│   │   ├── transactionService.ts    # /api/transactions & /api/payouts
│   │   └── notificationService.ts   # /api/notifications & /api/kyc
│   │
│   ├── theme/
│   │   ├── index.ts
│   │   ├── shadows.ts               # Elevation for Android & iOS shadows
│   │   └── spacing.ts               # Spacing tokens & border radii
│   │
│   └── utils/
│       ├── formatters.ts            # Indian currency (₹ / Lakhs / Crores), dates, percentages
│       ├── storage.ts               # AsyncStorage session & preferences wrapper
│       ├── validators.ts            # PAN, IFSC, Mobile, Email, Amount validation
│       └── errorHandler.ts          # Standardized error extraction
│
├── .env                             # Environment endpoints
├── .env.example
├── App.tsx                          # Root providers & status bar
├── index.js                         # React Native registry
├── package.json
└── tsconfig.json
```

---

## 🔌 API Integration Mapping

| Mobile Feature | Backend Endpoint | Method |
|---|---|---|
| Investor Login | `/api/auth/login` | POST |
| Investor Register | `/api/auth/register` | POST |
| OTP Verification | `/api/auth/verify-otp` | POST |
| Profile & Identity | `/api/auth/me` & `/api/investor/profile` | GET / PUT |
| Bank Details | `/api/investor/bank-details` | PUT |
| KYC Status & Submit | `/api/kyc/status` & `/api/kyc/submit` | GET / POST |
| KYC Dev Toggle | `/api/kyc/toggle-status` | POST |
| Explore Deals | `/api/investments` | GET |
| Return Calculator | `/api/investments/calculate` | POST |
| Create Investment Order | `/api/payments/create-order` | POST |
| Verify Investment Order | `/api/payments/verify` | POST |
| Investor Dashboard | `/api/investor/dashboard` | GET |
| My Holdings | `/api/investor/my-investments` | GET |
| Wallet & Payouts | `/api/payouts` | GET |
| Ledger History | `/api/transactions` | GET |
| Notifications | `/api/investor/notifications` | GET / PUT |

---

## 🚀 Running on Android

### 1. Ensure Backend is Running
The backend must be running on port 5000:
```sh
cd D:\Investor\backend
npm run dev
```

### 2. Connect Android Device or Start Emulator
Verify connection using ADB:
```sh
adb devices
```

If using the Android Studio emulator (`Pixel_9a`):
```powershell
& "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -avd Pixel_9a
```

### 3. Start Metro Dev Server & Launch App
From `D:\Investor\invester_mobile`:
```sh
npm start
```
In a new terminal:
```sh
npx react-native run-android
```

> **Android Emulator Tip**: The app is pre-configured to use `http://10.0.2.2:5000/api` which automatically routes from the Android emulator to `localhost:5000` on your host PC. If testing on a physical Android device over Wi-Fi, change `API_BASE_URL` in `.env` or in the in-app **Profile > Security & Settings > API Base URL** field to your computer's local network IP.
