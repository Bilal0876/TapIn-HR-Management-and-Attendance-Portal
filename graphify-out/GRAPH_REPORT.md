# Graph Report - Hr-portal  (2026-06-24)

## Corpus Check
- 232 files · ~370,441 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 670 nodes · 911 edges · 51 communities (45 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f3b34978`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]

## God Nodes (most connected - your core abstractions)
1. `AttendanceController` - 18 edges
2. `AttendanceController` - 18 edges
3. `authenticate()` - 16 edges
4. `Office Attendance App — Implementation Plan v2` - 15 edges
5. `AttendanceService` - 14 edges
6. `createError` - 14 edges
7. `AttendanceService` - 13 edges
8. `requireAdmin()` - 13 edges
9. `validate()` - 13 edges
10. `compilerOptions` - 13 edges

## Surprising Connections (you probably didn't know these)
- `authenticate()` --calls--> `verifyAccessToken()`  [EXTRACTED]
  server/src/middleware/authenticate.ts → server/src/services/tokenService.ts

## Import Cycles
- None detected.

## Communities (51 total, 6 thin omitted)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (32): Admin, API Endpoints (Final), Attendance, Auth, Auth (updated), Backend Folder Structure (`apps/api/`), Backend — Node.js / Express, Breaks (+24 more)

### Community 3 - "Community 3"
Cohesion: 0.10
Nodes (16): EnvSchema, parsed, startMidnightSweep(), checkinReminder, checkoutReminder, AppError, logFormat, logger (+8 more)

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

### Community 9 - "Community 9"
Cohesion: 0.06
Nodes (34): dependencies, bcryptjs, cors, date-fns, date-fns-tz, dotenv, exceljs, expo-server-sdk (+26 more)

### Community 12 - "Community 12"
Cohesion: 0.14
Nodes (10): AuthController, ChangePasswordInput, ChangePasswordSchema, LoginInput, LoginSchema, PushTokenInput, PushTokenSchema, RefreshInput (+2 more)

### Community 17 - "Community 17"
Cohesion: 0.12
Nodes (16): devDependencies, jest, prisma, ts-jest, ts-node, ts-node-dev, @types/bcryptjs, @types/cors (+8 more)

### Community 18 - "Community 18"
Cohesion: 0.12
Nodes (15): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules, lib, module, moduleResolution, outDir (+7 more)

### Community 21 - "Community 21"
Cohesion: 0.12
Nodes (6): EmployeesController, CreateEmployeeInput, CreateEmployeeSchema, UpdateEmployeeInput, UpdateEmployeeSchema, EmployeeService

### Community 22 - "Community 22"
Cohesion: 0.15
Nodes (4): ShiftProfileController, CreateShiftProfileInput, UpdateShiftProfileInput, ShiftProfileService

### Community 24 - "Community 24"
Cohesion: 0.13
Nodes (3): AuthController, RegisterCompanyInput, AuthService

### Community 28 - "Community 28"
Cohesion: 0.13
Nodes (7): CorrectionController, RequestCorrectionInput, RequestCorrectionSchema, ReviewCorrectionInput, ReviewCorrectionSchema, router, CorrectionService

### Community 29 - "Community 29"
Cohesion: 0.06
Nodes (48): AdminUpdateRecordSchema, CheckinSchema, CheckoutSchema, UpdateCompanyProfileInput, UpdateCompanyProfileSchema, UpdateShiftSettingsSchema, router, router (+40 more)

### Community 31 - "Community 31"
Cohesion: 0.12
Nodes (7): EmployeesController, CreateEmployeeInput, CreateEmployeeSchema, UpdateEmployeeInput, UpdateEmployeeSchema, router, EmployeeService

### Community 33 - "Community 33"
Cohesion: 0.22
Nodes (8): 1. Backend Server (`/Hr-Portal-BE`), 2.  Mobile App (`/mobile`), 3.  Admin Web Portal (`/Hr-Portal-Web-FE`), Core Implementations, License, System Architecture, TapIn: HR Portal & Attendance Portal, Tech Stack & Key Libraries

### Community 34 - "Community 34"
Cohesion: 0.16
Nodes (5): ShiftProfileController, CreateShiftProfileInput, UpdateShiftProfileInput, router, ShiftProfileService

### Community 35 - "Community 35"
Cohesion: 0.13
Nodes (7): CorrectionController, RequestCorrectionInput, RequestCorrectionSchema, ReviewCorrectionInput, ReviewCorrectionSchema, router, CorrectionService

### Community 37 - "Community 37"
Cohesion: 0.10
Nodes (4): UpdateShiftSettingsInput, AnalyticsService, formatDuration(), AttendanceService

### Community 43 - "Community 43"
Cohesion: 0.20
Nodes (5): MainActivity, Bundle, ReactActivity, ReactActivityDelegate, String

### Community 44 - "Community 44"
Cohesion: 0.06
Nodes (21): AnalyticsService, UpdateShiftSettingsInput, AttendanceService, RegisterCompanyInput, AuthService, shiftReminders, createError, globalForPrisma (+13 more)

### Community 50 - "Community 50"
Cohesion: 0.25
Nodes (5): MainApplication, Application, Configuration, ReactApplication, ReactHost

## Knowledge Gaps
- **208 isolated node(s):** `1. Backend Server (`/Hr-Portal-BE`)`, `2.  Mobile App (`/mobile`)`, `3.  Admin Web Portal (`/Hr-Portal-Web-FE`)`, `Core Implementations`, `Tech Stack & Key Libraries` (+203 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createError` connect `Community 44` to `Community 34`, `Community 29`, `Community 31`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Why does `authenticate()` connect `Community 29` to `Community 34`, `Community 35`, `Community 12`, `Community 44`, `Community 21`, `Community 28`, `Community 31`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `validate()` connect `Community 29` to `Community 35`, `Community 12`, `Community 21`, `Community 28`, `Community 31`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **What connects `1. Backend Server (`/Hr-Portal-BE`)`, `2.  Mobile App (`/mobile`)`, `3.  Admin Web Portal (`/Hr-Portal-Web-FE`)` to the rest of the system?**
  _208 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.10256410256410256 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._