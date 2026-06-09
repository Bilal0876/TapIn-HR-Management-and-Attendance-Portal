# TapIn: HR Portal & Attendance Ecosystem 

TapIn is a high-performance, multi-platform HR and Attendance Management system designed for modern office environments. It combines a robust Node.js backend, a premium React Native mobile experience, and a data-rich Next.js administrative dashboard.

---

## System Architecture

The project is organized as a unified monorepo consisting of three core modules:

### 1. Backend Server (`/server`)
- **Engine**: Node.js & Express (TypeScript).
- **Database**: PostgreSQL with Prisma ORM.
- **Security**: 
  - `express-rate-limit` for API protection.
  - Multi-layer Brute Force protection (5-minute account lockout).
  - Role-based Access Control (RBAC).
- **Real-time**: Socket.io for live workforce status broadcasting.

### 2.  Mobile App (`/mobile`)
- **Framework**: Expo / React Native (TypeScript).
- **Styling**: Uniwind (Tailwind CSS v4) for high-performance, build-time styles.
- **UX Features**:
  - `react-native-reanimated` for super-smooth status transitions.
  - `expo-haptics` for tactile action feedback.
  - Custom Shimmer Skeletons for seamless data hydration.
- **Hardware**: NFC/Biometric support ready.

### 3.  Admin Web Portal (`/web`)
- **Framework**: Next.js 16 (App Router) & Tailwind CSS.
- **State**: Zustand for reactive authentication and UI state.
- **Dashboard**: Real-time "Workforce Pulse" monitor for organization control.

---

##  Quick Start

### Prerequisites
- Node.js v18+
- pnpm (v9+)
- PostgreSQL instance

### Local Development

1. **Install Dependencies**:
   ```bash
   pnpm install
   ```

2. **Database Setup**:
   ```bash
   cd server
   cp .env.example .env # Configure your DATABASE_URL
   npx prisma migrate dev
   npx prisma generate
   ```

3. **Start the Ecosystem**:
   - **Server**: `cd server && pnpm start` (Port 3000)
   - **Web**: `cd web && pnpm dev` (Port 3001)
   - **Mobile**: `cd mobile && npx expo start`

---

##  Production Readiness Checklist

- [x] **Rate Limiting**: Enabled on `/auth` and `/attendance` routes.
- [x] **Brute Force Defense**: 5-attempt limit with automatic cooldown.
- [x] **Real-time Sync**: Bi-directional mobile/web synchronization via Socket.io.
- [x] **Performance**: Build-time CSS compilation on mobile (Uniwind).
- [x] **Security**: Sanitized SQL queries via Prisma and standard JWT flow.

---

##  Tech Stack & Key Libraries
- **Shared**: TypeScript, Socket.io, Axios.
- **Server**: Express, Prisma, Helmet, Morgan, Bcrypt.
- **Mobile**: Expo Router, Reanimated, Lucide Mobile, Haptics, Uniwind (TW v4).
- **Web**: Next.js, Lucide React, Framer Motion, Zustand.

---

##  License
Internal Production Build (Proprietary)
