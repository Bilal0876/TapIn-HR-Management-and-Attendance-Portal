# Graph Report - Hr-portal  (2026-06-15)

## Corpus Check
- 273 files · ~330,100 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 990 nodes · 1307 edges · 104 communities (87 shown, 17 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `86938e24`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 92|Community 92]]
- [[_COMMUNITY_Community 93|Community 93]]
- [[_COMMUNITY_Community 94|Community 94]]
- [[_COMMUNITY_Community 95|Community 95]]

## God Nodes (most connected - your core abstractions)
1. `useAuthStore` - 21 edges
2. `AttendanceController` - 18 edges
3. `compilerOptions` - 16 edges
4. `useAuthStore` - 15 edges
5. `Office Attendance App — Implementation Plan v2` - 15 edges
6. `AttendanceService` - 14 edges
7. `compilerOptions` - 13 edges
8. `expo` - 12 edges
9. `api` - 12 edges
10. `apiClient` - 10 edges

## Surprising Connections (you probably didn't know these)
- `LoginScreen()` --calls--> `useAuthStore`  [EXTRACTED]
  mobile/app/(auth)/login.tsx → mobile/src/features/auth/store.ts
- `RegisterScreen()` --calls--> `useAuthStore`  [EXTRACTED]
  mobile/app/(auth)/register.tsx → mobile/src/features/auth/store.ts
- `useDailyLogs()` --calls--> `useSocket()`  [INFERRED]
  mobile/src/hooks/useDailyLogs.ts → mobile/src/hooks/useSocket.ts
- `useEmployees()` --calls--> `useSocket()`  [INFERRED]
  mobile/src/hooks/useEmployees.ts → mobile/src/hooks/useSocket.ts
- `EmployeesPage()` --calls--> `useAuthStore`  [EXTRACTED]
  web/src/app/dashboard/employees/page.tsx → web/src/store/authStore.ts

## Import Cycles
- None detected.

## Communities (104 total, 17 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (38): dependencies, axios, date-fns, date-fns-tz, expo, expo-constants, expo-device, expo-file-system (+30 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (32): Admin, API Endpoints (Final), Attendance, Auth, Auth (updated), Backend Folder Structure (`apps/api/`), Backend — Node.js / Express, Breaks (+24 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (29): dependencies, axios, clsx, date-fns, framer-motion, lucide-react, next, react (+21 more)

### Community 3 - "Community 3"
Cohesion: 0.11
Nodes (16): EnvSchema, parsed, startMidnightSweep(), checkinReminder, checkoutReminder, shiftReminders, AppError, logFormat (+8 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (22): artifacts, backtrace, backtraceGraph, commands, files, nodes, compileGroups, dependencies (+14 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (22): artifacts, backtrace, backtraceGraph, commands, files, nodes, compileGroups, dependencies (+14 more)

### Community 6 - "Community 6"
Cohesion: 0.09
Nodes (22): artifacts, backtrace, backtraceGraph, commands, files, nodes, compileGroups, dependencies (+14 more)

### Community 7 - "Community 7"
Cohesion: 0.09
Nodes (22): artifacts, backtrace, backtraceGraph, commands, files, nodes, compileGroups, dependencies (+14 more)

### Community 8 - "Community 8"
Cohesion: 0.09
Nodes (21): backgroundColor, foregroundImage, adaptiveIcon, googleServicesFile, package, permissions, expo, android (+13 more)

### Community 9 - "Community 9"
Cohesion: 0.10
Nodes (21): dependencies, bcryptjs, cors, date-fns, date-fns-tz, dotenv, exceljs, expo-server-sdk (+13 more)

### Community 10 - "Community 10"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 11 - "Community 11"
Cohesion: 0.16
Nodes (11): C, CreateEmployeeScreen(), f, s, C, s, ShiftColor, ShiftSettingsScreen() (+3 more)

### Community 12 - "Community 12"
Cohesion: 0.14
Nodes (10): AuthController, ChangePasswordInput, ChangePasswordSchema, LoginInput, LoginSchema, PushTokenInput, PushTokenSchema, RefreshInput (+2 more)

### Community 13 - "Community 13"
Cohesion: 0.11
Nodes (17): devDependencies, @babel/core, babel-plugin-module-resolver, @types/react, @types/react-dom, typescript, main, name (+9 more)

### Community 14 - "Community 14"
Cohesion: 0.21
Nodes (12): C, LeaveApprovalsScreen(), s, LeavesScreen(), LEAVE_TYPES, RequestLeaveScreen(), LeaveRequest, leavesApi (+4 more)

### Community 16 - "Community 16"
Cohesion: 0.24
Nodes (9): createError, authenticate(), requireAdmin(), requirePasswordChanged(), requireSuperAdmin(), DownloadReportInput, DownloadReportSchema, router (+1 more)

### Community 17 - "Community 17"
Cohesion: 0.12
Nodes (16): devDependencies, jest, prisma, ts-jest, ts-node, ts-node-dev, @types/bcryptjs, @types/cors (+8 more)

### Community 18 - "Community 18"
Cohesion: 0.12
Nodes (15): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules, lib, module, moduleResolution, outDir (+7 more)

### Community 19 - "Community 19"
Cohesion: 0.21
Nodes (8): AdminLayout(), AnimatedSvgBar(), buildPath(), C, CustomTabBar(), styles, EmployeeLayout(), usePushNotifications()

### Community 20 - "Community 20"
Cohesion: 0.17
Nodes (12): ActiveBreak, ActiveBreakCard(), BreakButtonProps, C, CARD_W, formatTime(), IdleBreak(), pd (+4 more)

### Community 21 - "Community 21"
Cohesion: 0.19
Nodes (5): EmployeesController, CreateEmployeeInput, CreateEmployeeSchema, UpdateEmployeeInput, UpdateEmployeeSchema

### Community 22 - "Community 22"
Cohesion: 0.18
Nodes (4): ShiftProfileController, CreateShiftProfileInput, UpdateShiftProfileInput, ShiftProfileService

### Community 23 - "Community 23"
Cohesion: 0.15
Nodes (9): ab, C, pr, s, sc, { width: SCREEN_W }, s, Skeleton() (+1 more)

### Community 24 - "Community 24"
Cohesion: 0.27
Nodes (5): RegisterCompanyInput, AuthService, issueAccessToken(), issueRefreshToken(), verifyRefreshToken()

### Community 25 - "Community 25"
Cohesion: 0.24
Nodes (8): ForceChangePassword(), LoginPage(), RegisterPage(), formatMinutes(), SettingsPage(), AuthState, useAuthStore, User

### Community 26 - "Community 26"
Cohesion: 0.21
Nodes (8): AdminHome(), AdminStats, PulseActivity, useAdminDashboard(), SOCKET_URL, useSocket(), apiClient, refreshQueue

### Community 27 - "Community 27"
Cohesion: 0.18
Nodes (3): UpdateShiftSettingsInput, AttendanceService, emitToCompany()

### Community 28 - "Community 28"
Cohesion: 0.19
Nodes (10): router, router, RequestCorrectionInput, RequestCorrectionSchema, ReviewCorrectionInput, ReviewCorrectionSchema, router, router (+2 more)

### Community 29 - "Community 29"
Cohesion: 0.19
Nodes (4): useTodayAttendance(), BreakButton(), EmployeeHome(), registerForPushNotificationsAsync()

### Community 30 - "Community 30"
Cohesion: 0.22
Nodes (8): authApi, C, InputProps, LoginScreen(), styles, { width, height }, ChangePasswordInput, LoginInput

### Community 31 - "Community 31"
Cohesion: 0.23
Nodes (9): AVATAR_PALETTE, avatarColors(), C, card, EmployeeCard(), EmployeesScreen(), s, employeeApi (+1 more)

### Community 33 - "Community 33"
Cohesion: 0.17
Nodes (11): 1. Backend Server (`/server`), 2.  Mobile App (`/mobile`), 3.  Admin Web Portal (`/web`), License, Local Development, Prerequisites, Production Readiness Checklist, Quick Start (+3 more)

### Community 34 - "Community 34"
Cohesion: 0.24
Nodes (6): C, s, correctionApi, firstParam(), RequestCorrectionScreen(), s

### Community 35 - "Community 35"
Cohesion: 0.24
Nodes (6): C, s, usePersonalStats(), ProfileScreen(), { width: SCREEN_W }, secureStorage

### Community 36 - "Community 36"
Cohesion: 0.25
Nodes (7): AdminProfileScreen(), Index(), queryClient, AuthState, secureStorage, useAuthStore, Employee

### Community 38 - "Community 38"
Cohesion: 0.27
Nodes (8): AdminUpdateRecordSchema, CheckinSchema, CheckoutSchema, UpdateCompanyProfileInput, UpdateCompanyProfileSchema, UpdateShiftSettingsSchema, attendanceRateLimiter, authRateLimiter

### Community 39 - "Community 39"
Cohesion: 0.24
Nodes (6): BreakSessionInput, calculateDelta(), CompanyConfig, DeltaResult, resolveConfig(), baseConfig

### Community 40 - "Community 40"
Cohesion: 0.22
Nodes (3): CorrectionService, NotificationService, PushPayload

### Community 42 - "Community 42"
Cohesion: 0.24
Nodes (8): AdminReportsScreen(), C, s, useAdminReports(), s, StatCard(), StatCardProps, { width: SCREEN_W }

### Community 43 - "Community 43"
Cohesion: 0.20
Nodes (5): MainActivity, Bundle, ReactActivity, ReactActivityDelegate, String

### Community 44 - "Community 44"
Cohesion: 0.24
Nodes (4): attendanceApi, C, s, { width: SCREEN_W }

### Community 45 - "Community 45"
Cohesion: 0.20
Nodes (6): AttendanceStatus, C, CFG, CheckInButton(), CheckInButtonProps, s

### Community 46 - "Community 46"
Cohesion: 0.29
Nodes (8): AVATAR_COLORS, avatarColor(), CorrectionCard(), CorrectionRequest, formatDate(), formatTo12h(), getInitials(), TimeBlock()

### Community 47 - "Community 47"
Cohesion: 0.24
Nodes (3): api, subscribers, ShiftProfile

### Community 48 - "Community 48"
Cohesion: 0.28
Nodes (5): AVATAR_PALETTES, C, DailyLogsScreen(), s, useDailyLogs()

### Community 50 - "Community 50"
Cohesion: 0.25
Nodes (5): MainApplication, Application, Configuration, ReactApplication, ReactHost

### Community 51 - "Community 51"
Cohesion: 0.25
Nodes (5): C, InputProps, RegisterScreen(), STEPS, styles

### Community 52 - "Community 52"
Cohesion: 0.32
Nodes (6): TIMEZONE_OPTIONS, TimezoneOption, C, s, TimezoneSelector(), TimezoneSelectorProps

### Community 53 - "Community 53"
Cohesion: 0.32
Nodes (6): CACHE_DIR, { cacheDirectory, documentDirectory }, DOC_DIR, download(), ensureReportsDir(), reportsApi

### Community 54 - "Community 54"
Cohesion: 0.29
Nodes (6): cn(), DashboardLayout(), NavItem(), NavItemProps, navItems, SidebarProps

### Community 55 - "Community 55"
Cohesion: 0.36
Nodes (5): CreateLeaveRequestSchema, LeaveTypeSchema, ReviewLeaveRequestSchema, router, validate()

### Community 57 - "Community 57"
Cohesion: 0.29
Nodes (3): AVATAR_COLORS, DashboardOverview(), PulseItem

### Community 58 - "Community 58"
Cohesion: 0.29
Nodes (3): AVATAR_COLORS, Employee, EmployeesPage()

### Community 60 - "Community 60"
Cohesion: 0.29
Nodes (6): compilerOptions, paths, strict, extends, include, @/*

### Community 61 - "Community 61"
Cohesion: 0.29
Nodes (6): description, main, name, prisma, seed, version

### Community 62 - "Community 62"
Cohesion: 0.29
Nodes (7): scripts, build, dev, lint, start, test, typecheck

### Community 63 - "Community 63"
Cohesion: 0.40
Nodes (4): ensurePermissions(), fetchFreshLocation(), LocationError, LocationFix

### Community 65 - "Community 65"
Cohesion: 0.40
Nodes (3): geistMono, geistSans, metadata

### Community 67 - "Community 67"
Cohesion: 0.50
Nodes (3): fmtTime(), STATUS_CONFIG, TimeBlock()

### Community 68 - "Community 68"
Cohesion: 0.50
Nodes (3): config, { getDefaultConfig }, { withUniwindConfig }

### Community 72 - "Community 72"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

## Knowledge Gaps
- **426 isolated node(s):** `artifacts`, `backtrace`, `commands`, `files`, `nodes` (+421 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAuthStore` connect `Community 36` to `Community 35`, `Community 51`, `Community 26`, `Community 29`, `Community 30`, `Community 31`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `apiClient` connect `Community 26` to `Community 34`, `Community 11`, `Community 44`, `Community 14`, `Community 19`, `Community 53`, `Community 30`, `Community 31`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `AttendanceController` connect `Community 15` to `Community 37`, `Community 38`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **What connects `artifacts`, `backtrace`, `commands` to the rest of the system?**
  _426 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05263157894736842 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._