# TapIn: HR Portal & Attendance Portal

TapIn is a high-performance, multi-platform HR and Attendance Management system designed for modern office environments. It combines a robust Node.js backend, a premium React Native mobile experience, and a data-rich Next.js administrative dashboard.

---

## System Architecture

The project is organized as a unified monorepo consisting of three core modules:

### 1. Backend Server (`/Hr-Portal-BE`)
- **Engine**: Node.js & Express (Layered MVC Architecture).
- **Database**: PostgreSQL with Prisma ORM.
- **Automation**: 
  - **Absentee Engine**: Automated "Midnight Sweep" to mark absences while respecting holidays and weekends.
  - **Holiday & Weekend Hub**: Company-wide configuration for non-working days.
- **Security**: 
  - `express-rate-limit` for API protection.
  - Case-Insensitive Email handling (Industry Standard Normalization).
  - Multi-layer Brute Force protection (5-minute account lockout).
- **Real-time**: Socket.io "Live Pulse" broadcasting for instant workforce visibility.

### 2.  Mobile App (`/mobile`)
- **Framework**: Expo / React Native (TypeScript).
- **Hardened Features**:
  - **Precision Geofencing**: High-accuracy GPS enforcement for check-ins with metadata auditing.
  - **Push Notification Engine**: Integrated `expo-notifications` for shift reminders and admin alerts.
- **Performance**:
  - **Memoized Rendering**: Optimized UI logic with `useMemo` for complex time calculations.
  - `react-native-reanimated` for smooth status transitions.
- **UX**: Dynamic Shimmer Skeletons for seamless data hydration.

### 3.  Admin Web Portal (`/Hr-Portal-Web-FE`)
- **Framework**: Next.js 16 (App Router) & Tailwind CSS.
- **Security**: 
  - **Server-Side Middleware**: Professional-grade route protection using cookie-based session signaling.
- **Features**:
  - **Holiday Manager**: Interactive UI for managing organization holidays.
  - **Analytics Dash**: Real-time workforce metrics and attendance logs.

---

##  Core Implementations

- [x] **Precision GPS**: Enforced Location accuracy (High) and coordinate auditing.
- [x] **Push Notifications**: Real-time shift reminders and leave/correction alerts.
- [x] **Absentee Engine**: Automated attendance cleanup via Daily Cron Jobs.
- [x] **Security Hardening**: Case-insensitive authentication, Middleware Guards, and Brute Force defense.
- [x] **Timezone Precision**: Company-specific timezone formatting across all dashboards.
- [ ] **Multi-Department Scoping**: (Planned) Hierarchy for Department Head management.

---

##  Tech Stack & Key Libraries
- **Shared**: TypeScript, Socket.io, Axios, Date-fns.
- **Server**: Express, Prisma, Bcrypt, Node-Cron, Date-fns-tz.
- **Mobile**: Expo Router, Reanimated, Lucide Mobile, Haptics, React Query.
- **Web**: Next.js, Lucide React, Framer Motion, Zustand, Cookies-Next.

---

##  License
Internal Production Build (Proprietary)
