# Graph Report - Hr-portal  (2026-06-18)

## Corpus Check
- 238 files · ~311,748 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1164 nodes · 1583 edges · 108 communities (91 shown, 17 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `98d20a09`
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
- [[_COMMUNITY_Community 92|Community 92]]
- [[_COMMUNITY_Community 93|Community 93]]
- [[_COMMUNITY_Community 94|Community 94]]
- [[_COMMUNITY_Community 95|Community 95]]
- [[_COMMUNITY_Community 104|Community 104]]
- [[_COMMUNITY_Community 105|Community 105]]
- [[_COMMUNITY_Community 106|Community 106]]
- [[_COMMUNITY_Community 107|Community 107]]
- [[_COMMUNITY_Community 110|Community 110]]

## God Nodes (most connected - your core abstractions)
1. `useAuthStore` - 23 edges
2. `AttendanceController` - 18 edges
3. `AttendanceController` - 18 edges
4. `authenticate()` - 16 edges
5. `compilerOptions` - 16 edges
6. `useAuthStore` - 15 edges
7. `Office Attendance App — Implementation Plan v2` - 15 edges
8. `expo` - 14 edges
9. `AttendanceService` - 14 edges
10. `createError` - 14 edges

## Surprising Connections (you probably didn't know these)
- `EmployeesPage()` --calls--> `useAuthStore`  [EXTRACTED]
  web/src/app/dashboard/employees/page.tsx → web/src/store/authStore.ts
- `LoginScreen()` --calls--> `useAuthStore`  [EXTRACTED]
  mobile/app/(auth)/login.tsx → mobile/src/features/auth/store.ts
- `RegisterScreen()` --calls--> `useAuthStore`  [EXTRACTED]
  mobile/app/(auth)/register.tsx → mobile/src/features/auth/store.ts
- `DashboardOverview()` --calls--> `useAuthStore`  [EXTRACTED]
  web/src/app/dashboard/page.tsx → web/src/store/authStore.ts
- `useDailyLogs()` --calls--> `useSocket()`  [INFERRED]
  mobile/src/hooks/useDailyLogs.ts → mobile/src/hooks/useSocket.ts

## Import Cycles
- None detected.

## Communities (108 total, 17 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (39): dependencies, axios, date-fns, date-fns-tz, expo, expo-constants, expo-device, expo-file-system (+31 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (32): Admin, API Endpoints (Final), Attendance, Auth, Auth (updated), Backend Folder Structure (`apps/api/`), Backend — Node.js / Express, Breaks (+24 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (29): dependencies, axios, clsx, date-fns, framer-motion, lucide-react, next, react (+21 more)

### Community 3 - "Community 3"
Cohesion: 0.12
Nodes (15): EnvSchema, parsed, startMidnightSweep(), checkinReminder, checkoutReminder, shiftReminders, logFormat, logger (+7 more)

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
Cohesion: 0.07
Nodes (29): backgroundColor, foregroundImage, adaptiveIcon, googleServicesFile, package, permissions, projectId, expo (+21 more)

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
Cohesion: 0.27
Nodes (9): ChangePasswordInput, ChangePasswordSchema, LoginInput, LoginSchema, PushTokenInput, PushTokenSchema, RefreshInput, RefreshSchema (+1 more)

### Community 13 - "Community 13"
Cohesion: 0.25
Nodes (8): scripts, android, eas-build-pre-install, ios, lint, start, test, web

### Community 14 - "Community 14"
Cohesion: 0.21
Nodes (12): C, LeaveApprovalsScreen(), s, LeavesScreen(), LEAVE_TYPES, RequestLeaveScreen(), LeaveRequest, leavesApi (+4 more)

### Community 16 - "Community 16"
Cohesion: 0.32
Nodes (6): TIMEZONE_OPTIONS, TimezoneOption, C, s, TimezoneSelector(), TimezoneSelectorProps

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
Cohesion: 0.12
Nodes (7): EmployeesController, CreateEmployeeInput, CreateEmployeeSchema, UpdateEmployeeInput, UpdateEmployeeSchema, router, EmployeeService

### Community 22 - "Community 22"
Cohesion: 0.18
Nodes (4): ShiftProfileController, CreateShiftProfileInput, UpdateShiftProfileInput, ShiftProfileService

### Community 23 - "Community 23"
Cohesion: 0.15
Nodes (9): ab, C, pr, s, sc, { width: SCREEN_W }, s, Skeleton() (+1 more)

### Community 24 - "Community 24"
Cohesion: 0.10
Nodes (13): AuthController, ChangePasswordInput, ChangePasswordSchema, LoginInput, LoginSchema, PushTokenInput, PushTokenSchema, RefreshInput (+5 more)

### Community 25 - "Community 25"
Cohesion: 0.24
Nodes (8): ForceChangePassword(), LoginPage(), RegisterPage(), formatMinutes(), SettingsPage(), AuthState, useAuthStore, User

### Community 27 - "Community 27"
Cohesion: 0.10
Nodes (6): AnalyticsService, UpdateShiftSettingsInput, AttendanceService, globalForPrisma, emitToCompany(), PushPayload

### Community 28 - "Community 28"
Cohesion: 0.38
Nodes (5): RequestCorrectionInput, RequestCorrectionSchema, ReviewCorrectionInput, ReviewCorrectionSchema, router

### Community 29 - "Community 29"
Cohesion: 0.38
Nodes (4): usePersonalStats(), ProfileScreen(), { width: SCREEN_W }, secureStorage

### Community 30 - "Community 30"
Cohesion: 0.24
Nodes (7): authApi, C, InputProps, LoginScreen(), s, ChangePasswordInput, LoginInput

### Community 31 - "Community 31"
Cohesion: 0.12
Nodes (7): EmployeesController, CreateEmployeeInput, CreateEmployeeSchema, UpdateEmployeeInput, UpdateEmployeeSchema, router, EmployeeService

### Community 33 - "Community 33"
Cohesion: 0.17
Nodes (11): 1. Backend Server (`/server`), 2.  Mobile App (`/mobile`), 3.  Admin Web Portal (`/web`), License, Local Development, Prerequisites, Production Readiness Checklist, Quick Start (+3 more)

### Community 34 - "Community 34"
Cohesion: 0.16
Nodes (5): ShiftProfileController, CreateShiftProfileInput, UpdateShiftProfileInput, router, ShiftProfileService

### Community 35 - "Community 35"
Cohesion: 0.09
Nodes (5): CorrectionController, CorrectionController, CorrectionService, CorrectionService, NotificationService

### Community 36 - "Community 36"
Cohesion: 0.18
Nodes (9): AdminProfileScreen(), C, s, Index(), queryClient, AuthState, secureStorage, useAuthStore (+1 more)

### Community 38 - "Community 38"
Cohesion: 0.27
Nodes (8): AdminUpdateRecordSchema, CheckinSchema, CheckoutSchema, UpdateCompanyProfileInput, UpdateCompanyProfileSchema, UpdateShiftSettingsSchema, attendanceRateLimiter, authRateLimiter

### Community 39 - "Community 39"
Cohesion: 0.19
Nodes (7): UpdateShiftSettingsInput, BreakSessionInput, calculateDelta(), CompanyConfig, DeltaResult, resolveConfig(), baseConfig

### Community 40 - "Community 40"
Cohesion: 0.28
Nodes (8): AVATAR_PALETTE, avatarColors(), C, card, EmployeeCard(), EmployeesScreen(), s, useEmployees()

### Community 42 - "Community 42"
Cohesion: 0.15
Nodes (14): AdminHome(), AdminReportsScreen(), C, s, AdminStats, PulseActivity, useAdminDashboard(), useAdminReports() (+6 more)

### Community 43 - "Community 43"
Cohesion: 0.20
Nodes (5): MainActivity, Bundle, ReactActivity, ReactActivityDelegate, String

### Community 44 - "Community 44"
Cohesion: 0.25
Nodes (6): RegisterCompanyInput, AuthService, issueAccessToken(), issueRefreshToken(), verifyAccessToken(), verifyRefreshToken()

### Community 45 - "Community 45"
Cohesion: 0.15
Nodes (9): AttendanceStatus, C, CFG, CheckInButtonProps, s, ensurePermissions(), fetchFreshLocation(), LocationError (+1 more)

### Community 46 - "Community 46"
Cohesion: 0.29
Nodes (8): AVATAR_COLORS, avatarColor(), CorrectionCard(), CorrectionRequest, formatDate(), formatTo12h(), getInitials(), TimeBlock()

### Community 47 - "Community 47"
Cohesion: 0.24
Nodes (3): api, subscribers, ShiftProfile

### Community 48 - "Community 48"
Cohesion: 0.29
Nodes (5): AVATAR_PALETTES, C, DailyLogsScreen(), s, useDailyLogs()

### Community 50 - "Community 50"
Cohesion: 0.25
Nodes (5): MainApplication, Application, Configuration, ReactApplication, ReactHost

### Community 52 - "Community 52"
Cohesion: 0.22
Nodes (6): C, InputProps, RegisterScreen(), s, STEPS, SafeKeyboardAvoidingView()

### Community 53 - "Community 53"
Cohesion: 0.26
Nodes (5): AppError, createError, errorHandler(), requireSuperAdmin(), router

### Community 54 - "Community 54"
Cohesion: 0.29
Nodes (6): cn(), DashboardLayout(), NavItem(), NavItemProps, navItems, SidebarProps

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
Cohesion: 0.33
Nodes (7): AdminUpdateRecordSchema, CheckinSchema, CheckoutSchema, UpdateCompanyProfileInput, UpdateCompanyProfileSchema, UpdateShiftSettingsSchema, router

### Community 65 - "Community 65"
Cohesion: 0.40
Nodes (3): geistMono, geistSans, metadata

### Community 66 - "Community 66"
Cohesion: 0.24
Nodes (6): C, s, correctionApi, firstParam(), RequestCorrectionScreen(), s

### Community 67 - "Community 67"
Cohesion: 0.19
Nodes (7): attendanceApi, fmtTime(), STATUS_CONFIG, TimeBlock(), C, s, { width: SCREEN_W }

### Community 68 - "Community 68"
Cohesion: 0.50
Nodes (3): config, { getDefaultConfig }, { withUniwindConfig }

### Community 69 - "Community 69"
Cohesion: 0.28
Nodes (6): CACHE_DIR, { cacheDirectory, documentDirectory }, DOC_DIR, download(), ensureReportsDir(), reportsApi

### Community 70 - "Community 70"
Cohesion: 0.18
Nodes (5): useTodayAttendance(), BreakButton(), CheckInButton(), EmployeeHome(), registerForPushNotificationsAsync()

### Community 72 - "Community 72"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 104 - "Community 104"
Cohesion: 0.33
Nodes (6): devDependencies, @babel/core, babel-plugin-module-resolver, @types/react, @types/react-dom, typescript

### Community 105 - "Community 105"
Cohesion: 0.10
Nodes (25): router, router, RequestCorrectionInput, RequestCorrectionSchema, ReviewCorrectionInput, ReviewCorrectionSchema, CreateLeaveRequestSchema, LeaveTypeSchema (+17 more)

### Community 106 - "Community 106"
Cohesion: 0.32
Nodes (3): employeeApi, apiClient, refreshQueue

### Community 107 - "Community 107"
Cohesion: 0.40
Nodes (4): main, name, private, version

## Knowledge Gaps
- **439 isolated node(s):** `C`, `f`, `s`, `C`, `AVATAR_PALETTE` (+434 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createError` connect `Community 53` to `Community 34`, `Community 39`, `Community 44`, `Community 21`, `Community 22`, `Community 24`, `Community 27`, `Community 31`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `authenticate()` connect `Community 105` to `Community 34`, `Community 38`, `Community 12`, `Community 44`, `Community 31`, `Community 21`, `Community 53`, `Community 24`, `Community 28`, `Community 63`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Why does `AttendanceController` connect `Community 15` to `Community 27`, `Community 38`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `C`, `f`, `s` to the rest of the system?**
  _439 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._