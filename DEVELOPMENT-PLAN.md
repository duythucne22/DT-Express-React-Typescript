# DTEx — Development Plan & Architecture Document

> **Project:** DTEx (DT Express TMS Frontend)
> **Framework:** React 18 + Vite + TypeScript + Tailwind CSS
> **Backend API:** `http://localhost:5198` (C# .NET — see api-reference.md)

---

## Table of Contents

1. [Current State Assessment](#1-current-state-assessment)
2. [Project Vision & Scope](#2-project-vision--scope)
3. [Architecture & Design Patterns](#3-architecture--design-patterns)
4. [Tech Stack & Dependencies](#4-tech-stack--dependencies)
5. [File Structure](#5-file-structure)
6. [Phase Plan](#6-phase-plan)
7. [Page-by-Page Specification](#7-page-by-page-specification)
8. [Role Permission Matrix](#8-role-permission-matrix)
9. [Design System (LIGHT ONLY)](#9-design-system)
10. [Data Layer Strategy](#10-data-layer-strategy)
11. [Design Patterns Implementation](#11-design-patterns-implementation)
12. [Reuse Map — Deep Adaptation Guide](#12-reuse-map-from-other-codebases)
13. [Source Code Architecture Deep Reference](#13-source-code-architecture-deep-reference)
14. [Development Agent Quick Reference](#14-development-agent-quick-reference)

---

## 1. Current State Assessment

### What EXISTS in logistics2 today

| Layer | Status | Details |
|-------|--------|---------|
| **Public pages** | ✅ Done | Home, Services, About, Contact, Track — 5 fully styled pages |
| **Routing** | ✅ Basic | React Router with 5 routes, Navbar + Footer wrapping |
| **Theme** | ✅ Partial | Orange (`orange-500`) + Blue (`blue-600/700/800`) on white background |
| **Branding** | ⚠️ Inconsistent | Navbar says "DTEx", Footer says "FastCourier" — needs unification to **DTEx** |
| **Auth** | ❌ Empty | `src/app/auth/` exists but empty |
| **Dashboard** | ❌ Empty | `src/app/dashboard/` exists but empty |
| **Orders** | ❌ Empty | `src/app/orders/` exists but empty |
| **Tracking** | ❌ Empty | `src/app/tracking/` exists but empty |
| **Carriers** | ❌ Empty | `src/app/carriers/` exists but empty |
| **Routing calc** | ❌ Empty | `src/app/routing/` exists but empty |
| **Components/ui** | ❌ Empty | No reusable UI components beyond layout |
| **Hooks** | ❌ Empty | No custom hooks |
| **Lib/api** | ❌ Empty | No API layer |
| **Lib/patterns** | ❌ Empty | No design patterns |
| **Stores** | ❌ Missing | No state management directory |
| **Types** | ❌ Missing | No TypeScript types |
| **Mock data** | ❌ Missing | No generators or mock services |
| **Tailwind config** | ⚠️ Default | Zero customization — no custom colors, fonts, animations |
| **Dependencies** | ⚠️ Minimal | Only React, React Router, Lucide, Tailwind |

### What WORKS well

- Clean orange + blue landing page design — professional, modern
- Good responsive layout with mobile hamburger menu
- Track page has working mock with loading states + timeline
- Contact page has working form state management
- Consistent section structure across all public pages

### What NEEDS fixing

- Unify branding to "DTEx" everywhere (Footer, page content)
- Tailwind config needs custom theme (DTEx orange, DTEx blue, custom fonts)
- Track page mock needs alignment with real API contract
- "Get Quote" buttons are non-functional

---

## 2. Project Vision & Scope

### What We're Building

A **showcase TMS (Transportation Management System)** frontend for DTEx — a logistics company focused on China ↔ US Pacific shipping. Not production-ready, but a **complete, beautiful, functional application** that demonstrates:

- Professional landing + marketing pages
- JWT authentication with role-based access
- Full order lifecycle management
- Real-time tracking with interactive maps
- Route comparison with strategy patterns
- Carrier management
- Dashboard analytics
- Design patterns (Strategy, Factory, Adapter, Observer, State Machine, CQRS, Decorator)

### What It Is NOT

- Not a production deployment
- Not database-heavy (small data, no pagination urgency)
- Not mobile-optimized (desktop-first, responsive nice-to-have)
- Not i18n-ready (English primary, Chinese data supported)

### Primary Users

| Role | Primary Actions | Dashboard Landing |
|------|----------------|-------------------|
| **Admin** | Full access — all features, user management, revenue data | Full analytics dashboard |
| **Dispatcher** | Create/manage orders, book carriers, route planning | Orders & dispatch dashboard |
| **Driver** | View assigned orders only, update delivery status | My shipments view |
| **Viewer** | Read-only — personal orders, personal spending stats | Limited personal dashboard |

### MVP Definition (2-week sprint)

**Must have (Phase 1):**
- Landing pages (polish existing)
- Auth (login only, no registration in UI)
- Dashboard (role-based)
- Orders list + detail + create
- Tracking page with map

**Should have (Phase 2):**
- Carriers comparison
- Route calculator
- Reports / CSV export
- Settings page

**Nice to have (Phase 3):**
- Exceptions management
- Audit trail viewer
- Notification toasts for real-time events

---

## 3. Architecture & Design Patterns

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  Pages (React Router)                                           │ │
│  │  Public: Home │ Services │ About │ Contact │ Track              │ │
│  │  Auth: Login                                                    │ │
│  │  App: Dashboard │ Orders │ OrderDetail │ CreateOrder │          │ │
│  │       Tracking │ Carriers │ Routing │ Reports │ Settings        │ │
│  └──────────────────────────┬──────────────────────────────────────┘ │
│                             │ use                                    │
│  ┌──────────────────────────▼──────────────────────────────────────┐ │
│  │  Custom Hooks (business logic bridge)                           │ │
│  │  useAuth │ useOrders │ useTracking │ useCarriers │ useRouting   │ │
│  │  useDashboard │ useAudit                                        │ │
│  └──────────┬───────────────────────────────────┬──────────────────┘ │
│             │ read/write                        │ fetch              │
│  ┌──────────▼──────────┐  ┌─────────────────────▼──────────────────┐ │
│  │  Zustand Stores     │  │  lib/api/ (HTTP + WS client)           │ │
│  │  authStore          │  │  Base axios instance with JWT          │ │
│  │  ordersStore        │  │  auth.ts │ orders.ts │ carriers.ts     │ │
│  │  agentsStore        │  │  routing.ts │ tracking.ts │ audit.ts   │ │
│  │  uiStore            │  │                                        │ │
│  └─────────────────────┘  │  ──── OR (mock mode) ────              │ │
│                           │  services/mockApi.ts + generators.ts   │ │
│                           └────────────────────────────────────────┘ │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────────┐│
│  │  lib/patterns/ (Design Patterns)                                 ││
│  │  Strategy (routing) │ Factory (carriers) │ Adapter (carrier API) ││
│  │ Observer (tracking) │ State (order lifecycle) │ Decorator (audit)││
│  │  CQRS (order commands/queries)                                   ││
│  └──────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────┘
```

### Routing Architecture

```
/                           → Home (public)
/services                   → Services (public)
/about                      → About (public)
/contact                    → Contact (public)
/track                      → Track package (public, basic)

/auth/login                 → Login page

/dashboard                  → Dashboard (auth required, role-based content)
/dashboard/analytics        → Analytics charts (Admin/Dispatcher)

/orders                     → Orders list (auth required)
/orders/:id                 → Order detail (auth required)
/orders/create              → Create order (Admin/Dispatcher only)

/tracking                   → Live map tracking (auth required)
/tracking/:trackingNo       → Single shipment tracking

/carriers                   → Carrier comparison (auth required)

/routing                    → Route calculator (auth required)

/reports                    → Reports & CSV export (Admin/Dispatcher)

/settings                   → Profile & preferences (auth required)
```

### Layout Strategy

Two distinct layouts:

1. **Public Layout** (current): `Navbar` + content + `Footer`
   - Used for: Home, Services, About, Contact, Track, Login

2. **Dashboard Layout** (new): `Sidebar` + `Header` + content area
   - Used for: Dashboard, Orders, Tracking, Carriers, Routing, Reports, Settings
   - Sidebar: white bg, collapsible, role-based menu items, orange active indicator
   - Header: white bg with border-bottom, breadcrumb, user info, notifications
   - Content area: `bg-slate-100` page background, white cards for content

---

## 4. Tech Stack & Dependencies

### Current (keep)
- React 18 + TypeScript
- Vite 5
- React Router DOM 7
- Tailwind CSS 3
- Lucide React (icons)

### To Add

| Package | Purpose | From |
|---------|---------|------|
| `zustand` | State management (auth, orders, agents, UI) | logistics1 |
| `@tanstack/react-query` | Server state, caching, mutations | logistics1 |
| `@tanstack/react-virtual` | Virtualized order list (10K rows) | logistics1 |
| `axios` | HTTP client with interceptors | note.md architecture |
| `react-map-gl` + `maplibre-gl` | Interactive maps for tracking | logistics1 |
| `recharts` | Dashboard charts (line, bar, pie) | Logistics (Next.js) |
| `clsx` + `tailwind-merge` | Conditional class utility | logistics1 |
| `date-fns` | Date formatting & manipulation | logistics1 |
| `sonner` | Toast notifications | note.md |
| `framer-motion` | Page transitions, scroll animations | Logistics (Next.js) |
| `zod` | Form validation | Logistics (Next.js) signin |

### Optional / Phase 2+
- `@microsoft/signalr` — Real SignalR client
- `react-hook-form` — Complex forms (order create)

---

## 5. File Structure

```
src/
├── App.tsx                           # Root: Router + QueryClient + providers
├── main.tsx                          # Vite entry point
├── index.css                         # Tailwind + custom CSS
├── vite-env.d.ts
│
├── app/                              # Route-level page components
│   ├── auth/
│   │   └── LoginPage.tsx             # JWT login form
│   ├── dashboard/
│   │   ├── DashboardPage.tsx         # Main dashboard (role-based)
│   │   └── AnalyticsPage.tsx         # Charts & analytics (Admin/Dispatcher)
│   ├── orders/
│   │   ├── OrdersPage.tsx            # Filterable order list
│   │   ├── OrderDetailPage.tsx       # Single order with timeline
│   │   └── CreateOrderPage.tsx       # Multi-step create form
│   ├── tracking/
│   │   └── TrackingPage.tsx          # Live map + agent locations
│   ├── carriers/
│   │   └── CarriersPage.tsx          # Carrier comparison table + quotes
│   ├── routing/
│   │   └── RoutingPage.tsx           # Route calculator (strategy comparison)
│   ├── reports/
│   │   └── ReportsPage.tsx           # Monthly reports + CSV export
│   └── settings/
│       └── SettingsPage.tsx          # Profile & preferences
│
├── pages/                            # Public landing pages (existing)
│   ├── Home.tsx                      # ✅ exists
│   ├── Services.tsx                  # ✅ exists
│   ├── About.tsx                     # ✅ exists
│   ├── Contact.tsx                   # ✅ exists
│   └── Track.tsx                     # ✅ exists (needs API alignment)
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx                # ✅ exists (public pages)
│   │   ├── Footer.tsx                # ✅ exists (needs brand fix)
│   │   ├── DashboardLayout.tsx       # NEW — sidebar + header + outlet
│   │   ├── Sidebar.tsx               # NEW — collapsible, role-based nav
│   │   └── DashboardHeader.tsx       # NEW — breadcrumb, user, notifications
│   ├── ui/
│   │   ├── Button.tsx                # Variant: primary, secondary, ghost, danger
│   │   ├── Card.tsx                  # Glass + bordered variants
│   │   ├── Input.tsx                 # With validation + icon prefix
│   │   ├── Select.tsx               # Searchable select
│   │   ├── StatusBadge.tsx           # Color-coded order status
│   │   ├── PriorityBadge.tsx         # Priority indicator
│   │   ├── Spinner.tsx               # Loading spinner + skeleton
│   │   ├── Toast.tsx                 # Sonner wrapper
│   │   ├── Modal.tsx                 # Generic modal
│   │   ├── Timeline.tsx              # Order state timeline (horizontal + vertical)
│   │   ├── DataTable.tsx             # Reusable table with sort headers
│   │   └── EmptyState.tsx            # Empty list placeholder
│   ├── orders/
│   │   ├── OrderRow.tsx              # Virtualized row
│   │   ├── OrderFilters.tsx          # Status/priority/search/date filters
│   │   ├── OrderForm.tsx             # Create/edit form (multi-step)
│   │   ├── OrderTimeline.tsx         # Visual timeline component
│   │   └── VirtualizedOrderList.tsx  # @tanstack/react-virtual wrapper
│   ├── tracking/
│   │   ├── InteractiveMap.tsx        # MapLibre map wrapper
│   │   ├── AgentMarker.tsx           # Map marker with pulse
│   │   └── AgentCard.tsx             # Agent info card
│   ├── dashboard/
│   │   ├── StatCard.tsx              # KPI metric card
│   │   ├── RevenueChart.tsx          # Line chart (Recharts)
│   │   ├── StatusDistribution.tsx    # Pie/donut chart
│   │   └── RecentOrders.tsx          # Quick order list
│   └── carriers/
│       ├── CarrierCard.tsx           # Carrier info + quote
│       └── QuoteComparison.tsx       # Side-by-side quote view
│
├── hooks/
│   ├── useAuth.ts                    # Login, logout, token, permissions
│   ├── useOrders.ts                  # Fetch, create, update, cancel orders
│   ├── useTracking.ts               # Agent subscriptions + location updates
│   ├── useCarriers.ts               # Fetch carriers, get quotes
│   ├── useRouting.ts                 # Route calculation with strategy selection
│   ├── useDashboard.ts              # Dashboard stats fetching
│   ├── useAudit.ts                   # Audit trail queries
│
├── stores/
│   ├── authStore.ts                  # user, token, role, isAuthenticated
│   ├── ordersStore.ts                # Orders Map, filters, sort, selection
│   ├── agentsStore.ts                # Delivery agents Map, locations
│   └── uiStore.ts                    # Sidebar, modals, notifications, real-time toggle
│
├── types/
│   ├── auth.ts                       # User, LoginRequest, LoginResponse, Role
│   ├── order.ts                      # Order, OrderItem, OrderAddress, OrderStatus, etc.
│   ├── carrier.ts                    # Carrier, CarrierQuote
│   ├── routing.ts                    # Route, RouteStrategy, RouteComparison
│   ├── tracking.ts                   # DeliveryAgent, AgentUpdate
│   ├── dashboard.ts                  # DashboardStats, RegionStats
│   ├── audit.ts                      # AuditEntry
│   ├── api.ts                        # ApiResponse<T>, PaginatedResponse<T>, ApiError
│   └── index.ts                      # Re-export all
│
├── lib/
│   ├── api/
│   │   ├── index.ts                  # Base axios instance with JWT + correlationId
│   │   ├── auth.ts                   # POST /api/auth/login, register, refresh
│   │   ├── orders.ts                 # CRUD orders endpoints
│   │   ├── carriers.ts               # GET carriers, quotes, book
│   │   ├── routing.ts                # POST /api/routing/calculate, compare
│   │   ├── tracking.ts              # GET /api/tracking/*, subscribe
│   │   ├── dashboard.ts              # GET /api/dashboard/*
│   │   ├── audit.ts                  # GET /api/audit/*
│   │   └── reports.ts                # GET /api/reports/*
│   │
│   ├── constants/
│   │   ├── roles.ts                  # Role enum + labels
│   │   ├── orderStatuses.ts          # Status enum + config (color, icon, label)
│   │   ├── serviceLevels.ts          # Express, Standard, Economy
│   │   ├── carriers.ts               # Carrier codes + names
│   │   └── mapConfig.ts              # Map style URL, initial coordinates
│   │
│   ├── utils/
│   │   ├── cn.ts                     # clsx + tailwind-merge
│   │   ├── format.ts                 # Currency (CNY/USD), weight, date formatting
│   │   ├── validation.ts             # Zod schemas for forms
│   │   └── uuid.ts                   # correlationId generator
│   │
│   └── patterns/
│       ├── strategy/
│       │   ├── RouteStrategy.ts      # Interface: calculateRoute()
│       │   ├── FastestStrategy.ts    # Prioritize speed
│       │   ├── CheapestStrategy.ts   # Prioritize cost
│       │   └── BalancedStrategy.ts   # Balance speed + cost
│       ├── factory/
│       │   └── CarrierFactory.ts     # Returns typed carrier adapter
│       ├── adapter/
│       │   ├── CarrierAdapter.ts     # Base adapter interface
│       │   ├── SFExpressAdapter.ts   # SF Express API adapter
│       │   └── JDLogisticsAdapter.ts # JD Logistics API adapter
│       ├── observer/
│       │   └── TrackingObserver.ts   # Event emitter for tracking updates
│       ├── state/
│       │   └── OrderStateMachine.ts  # Valid transitions: Created→Confirmed→Shipped→Delivered
│       ├── decorator/
│       │   └── AuditDecorator.ts     # Wraps API calls with audit logging
│       └── cqrs/
│           ├── commands/
│           │   └── CreateOrderCommand.ts
│           └── queries/
│               └── GetOrdersQuery.ts
│
├── services/
│   ├── mockApi.ts                    # Mock API (adapted from logistics1/api.ts)
│   └── generators.ts                # Mock data generators (from logistics1)
│
└── assets/
    └── images/
        └── logo.svg                  # DTEx logo
```

---

## 6. Phase Plan

### Phase 0 — Foundation & Cleanup (Current → Day 1-2)

**Goal:** Set up infrastructure & unify branding

| # | Task | Priority | Source |
|---|------|----------|--------|
| 0.1 | Install all dependencies (zustand, tanstack, axios, maplibre, recharts, etc.) | HIGH | — |
| 0.2 | Customize tailwind.config.js (DTEx colors, fonts, animations) | HIGH | logistics1 config |
| 0.3 | Fix branding: "FastCourier" → "DTEx" in Footer + all pages | HIGH | — |
| 0.4 | Create `lib/utils/cn.ts` utility | HIGH | logistics1 |
| 0.5 | Create all TypeScript types in `types/` | HIGH | api-reference.md + logistics1/types |
| 0.6 | Create constants files in `lib/constants/` | HIGH | note.md |
| 0.7 | Create base UI components (Button, Card, Input, Select, StatusBadge, Spinner, Toast) | HIGH | logistics1/components/ui |
| 0.8 | Set up `lib/api/index.ts` base axios instance | HIGH | note.md |
| 0.9 | Set up Zustand stores (auth, orders, agents, UI) | HIGH | logistics1/stores |
| 0.10 | Set up mock data generators + mock API service | MEDIUM | logistics1/services + mocks |
| 0.11 | Add `index.css` custom styles (glass-panel, grid-pattern, animations) | MEDIUM | logistics1 |

**Deliverable:** Fully typed, themed infrastructure ready for feature development.

---

### Phase 1 — Core Features (Day 3-7)

**Goal:** Auth + Dashboard + Orders + Tracking — the "wow" features

#### 1A. Auth & Layout System

| # | Task | Details |
|---|------|---------|
| 1.1 | Create `LoginPage.tsx` | Username + password form, role-based redirect, Zod validation, JWT storage |
| 1.2 | Create `DashboardLayout.tsx` | Sidebar + Header + Outlet, auth guard (redirect to /auth/login if not authenticated) |
| 1.3 | Create `Sidebar.tsx` | Collapsible, role-based menu items, DTEx logo, active route indicator, logout button |
| 1.4 | Create `DashboardHeader.tsx` | Page title, breadcrumb, user avatar + role badge |
| 1.5 | Wire up `authStore` with `lib/api/auth.ts` | Login → store token + user → redirect by role |
| 1.6 | Update `App.tsx` routing | Add auth routes, dashboard layout, protected routes |

**Design inspiration:**
- Login: Logistics/signin — custom tabs, Zod validation, icon-prefixed inputs, background image
- Sidebar: logistics1/Sidebar — collapsible, orange accent (adapted from amber), role badge → **ALL ON WHITE BG**
- Header: logistics1/Header — real-time indicator, refresh button → **white bg with border-b**

#### 1B. Dashboard

| # | Task | Details |
|---|------|---------|
| 1.7 | Create `StatCard.tsx` | Animated KPI card with icon, value, trend |
| 1.8 | Create `RevenueChart.tsx` | Recharts LineChart for revenue over time |
| 1.9 | Create `StatusDistribution.tsx` | Recharts PieChart for order status breakdown |
| 1.10 | Create `RecentOrders.tsx` | Quick list of recent 5 orders with status badges |
| 1.11 | Create `DashboardPage.tsx` | Compose stat cards + charts + recent orders, role-based content |

**Design inspiration:**
- logistics1/DashboardPage — 4 stat cards, status bar, recent orders → **white cards on slate-100 bg**
- Logistics/Analytics — Recharts with custom tooltip, KPI grid, tabbed views → **adapt charts for light bg**

**Role-based dashboard content:**

| Widget | Admin | Dispatcher | Driver | Viewer |
|--------|-------|------------|--------|--------|
| Revenue stats | ✅ | ✅ | ❌ | ❌ |
| Total orders | ✅ | ✅ | ❌ (shows own count) | ✅ (own count) |
| Status chart | ✅ | ✅ | ❌ | ❌ |
| Recent orders | ✅ (all) | ✅ (all) | ✅ (own) | ✅ (own) |
| In-transit count | ✅ | ✅ | ✅ (own) | ✅ (own) |
| Performance metrics | ✅ | ✅ | ✅ (own stats) | ❌ |

#### 1C. Orders

| # | Task | Details |
|---|------|---------|
| 1.12 | Create `OrderFilters.tsx` | Debounced search, status chips, priority chips, date range |
| 1.13 | Create `OrderRow.tsx` | Memoized row with status badge, mini-timeline, amount |
| 1.14 | Create `VirtualizedOrderList.tsx` | @tanstack/react-virtual wrapper |
| 1.15 | Create `OrdersPage.tsx` | Filters + virtualized list + CSV export button |
| 1.16 | Create `OrderTimeline.tsx` | Horizontal + vertical timeline with state machine |
| 1.17 | Create `OrderDetailPage.tsx` | Full detail: customer info, items, timeline, status actions |
| 1.18 | Create `CreateOrderPage.tsx` | Multi-step form: customer → addresses → items → review → submit |
| 1.19 | Wire `useOrders` hook | TanStack Query + Zustand bridge + real-time subscription |

**Design inspiration:**
- logistics1/OrdersPage — filters, virtualized list, CSV export
- logistics1/OrderDetailPage — 3-column detail, timeline, status actions
- logistics1/OrderTimeline — gradient progress bar, pulse on current step

**State machine enforcement:**
```
Created → Confirmed → Shipped → Delivered
                    ↘ Cancelled (from Created or Confirmed only)
```
- UI disables invalid transition buttons
- Backend also validates (dual guard)

#### 1D. Tracking

| # | Task | Details |
|---|------|---------|
| 1.20 | Create `InteractiveMap.tsx` | MapLibre wrapper with controls |
| 1.21 | Create `AgentMarker.tsx` | Colored marker with pulse animation |
| 1.22 | Create `AgentCard.tsx` | Agent info: name, status, vehicle, rating |
| 1.23 | Create `TrackingPage.tsx` | Split/map/list view modes, agent selection, popup |
| 1.24 | Wire `useTracking` hook | Fetch agents + subscribe to location updates |
| 1.25 | Create `agentsStore` | Map-based store with O(1) lookups |

**Design inspiration:**
- logistics1/TrackingPage — Basemap with markers and pulse animations, popup on click, 3 view modes → **light legend overlay, white agent panel**
- note2.md — subscription → store → UI render flow

**Map configuration:**
- Basemap: CARTO Positron (light, free, no API key) — or dark-matter for map contrast (dev choice)
- Initial center: Pacific region (between China and US)
- Markers: Color by status (green=available, orange=on_delivery, gray=offline, blue=break)
- Real-time: Auto-subscribe when page loads, unsubscribe on unmount
- Map legend: white card with shadow-lg, not dark overlay

---

### Phase 2 — Extended Features (Day 8-11)

#### 2A. Carriers

| # | Task | Details |
|---|------|---------|
| 2.1 | Create `CarriersPage.tsx` | Carrier list + quote comparison |
| 2.2 | Create `CarrierCard.tsx` | Carrier info, rating, price range |
| 2.3 | Create `QuoteComparison.tsx` | Side-by-side quote table |
| 2.4 | Wire `useCarriers` hook + `lib/api/carriers.ts` | Fetch carriers, get quotes |
| 2.5 | Implement Factory + Adapter patterns | `CarrierFactory.ts`, `CarrierAdapter.ts` |

**API endpoints used:**
- `GET /api/carriers` — list all carriers
- `GET /api/carriers/:code` — carrier detail
- `POST /api/carriers/:code/quote` — get quote for shipment
- `POST /api/carriers/:code/book` — book a carrier

#### 2B. Route Calculator

| # | Task | Details |
|---|------|---------|
| 2.6 | Create `RoutingPage.tsx` | Origin/destination inputs, strategy selector, map visualization, results comparison |
| 2.7 | Implement Strategy pattern files | `RouteStrategy.ts`, `FastestStrategy.ts`, `CheapestStrategy.ts`, `BalancedStrategy.ts` |
| 2.8 | Wire `useRouting` hook + `lib/api/routing.ts` | Calculate + compare routes |

**API endpoints used:**
- `POST /api/routing/calculate` — single strategy route
- `POST /api/routing/compare` — all strategies side-by-side
- `GET /api/routing/strategies` — list available strategies

**UI:** Map showing route overlay, comparison table (Fastest vs Cheapest vs Balanced), cost/time/distance columns

#### 2C. Reports

| # | Task | Details |
|---|------|---------|
| 2.9 | Create `ReportsPage.tsx` | Monthly reports with chart visualization + CSV download |
| 2.10 | Add CSV export utility | Download as file via Blob |

**API endpoints used:**
- `GET /api/reports/monthly-shipments?year=&month=` (Accept: application/json OR text/csv)
- `GET /api/reports/revenue-by-carrier?startDate=&endDate=`

---

### Phase 3 — Polish, Patterns & Production Readiness (Day 12-14)

> **Goal:** Transform the functional app into a polished, pattern-rich showcase. This phase has 6 sub-layers that build quality from inside-out.

#### 3A. Settings & Profile Page (Day 12 morning)

| # | Task | Details |
|---|------|---------|
| 3.1 | Create `SettingsPage.tsx` | Two-column layout: left = profile card, right = permissions grid |
| 3.2 | Profile card section | Avatar placeholder (User icon in circle), name, email, role badge (colored pill) |
| 3.3 | Region display | Ops users see their assigned region; Admin sees "All Regions" |
| 3.4 | Permission grid | 6 permission rows with checkmark/X icons, green/gray coloring per role |
| 3.5 | Real-time toggle | Toggle switch (custom, not checkbox) to enable/disable live tracking updates |
| 3.6 | Role matrix (Admin only) | Full table: rows = permissions, columns = roles, with colored header pills |

**Source adaptation:** logistics1 `SettingsPage.tsx` (297 lines) has the exact structure. Adaptation:
- Remove dark colors: `bg-slate-700` → `bg-slate-100`, `text-slate-100` → `text-slate-800`
- Role badge colors: keep amber/blue/slate mapping but on light bg (`bg-amber-50 text-amber-700 border-amber-200`)
- Permission rows: `bg-emerald-500/5` → `bg-emerald-50`, `bg-slate-800/30` → `bg-slate-50`
- Toggle switch: `bg-emerald-500` (on) / `bg-slate-300` (off) — white knob stays
- Table: `border-slate-700/50` → `border-slate-200`, hover: `hover:bg-slate-50`

**Source adaptation:** Logistics `Profile.tsx` (491 lines) has the form editing pattern. Adaptation:
- Borrow the edit/save toggle pattern (isEditing state → button text changes)
- Borrow the `framer-motion` AnimatePresence for save confirmation toast
- Don't copy: its sidebar (we have our own), its session/auth (we use JWT store)
- Profile picture: skip for now (our API doesn't support image upload)

#### 3B. Design Patterns Implementation (Day 12 afternoon)

| # | Task | Details |
|---|------|---------|
| 3.7 | `OrderStateMachine.ts` | Static class with `transitions` map, `canTransition()`, `getAvailableActions()` |
| 3.8 | Wire state machine to OrderDetail | Disable buttons via `OrderStateMachine.canTransition(current, target)` |
| 3.9 | `TrackingObserver.ts` | EventEmitter-style class: `subscribe(agentId, cb)`, `notify(agentId, data)`, `unsubscribeAll()` |
| 3.10 | Wire observer to TrackingPage | Replace direct store updates with observer → store pattern |
| 3.11 | `AuditDecorator.ts` | HOF wrapper: `withAudit(apiCall, actionName)` → logs correlationId + timing |
| 3.12 | Wire decorator to order mutations | Wrap `createOrder`, `confirmOrder`, `cancelOrder` with audit |
| 3.13 | CQRS separation | `CreateOrderCommand.ts` (validate → api → store) and `GetOrdersQuery.ts` (cache check → api → filter) |

**Implementation depth for state machine:**
```
File: lib/patterns/state/OrderStateMachine.ts
- transitions Map: Created→[Confirmed,Cancelled], Confirmed→[Shipped,Cancelled], Shipped→[Delivered], Delivered→[], Cancelled→[]
- canTransition(from, to): returns boolean
- getAvailableActions(status): returns OrderStatus[]
- getActionLabel(status): returns human-readable string ("Confirm Order", "Ship Order", etc.)
- getActionColor(status): returns tailwind class for the action button
- Used in: OrderDetailPage action buttons, OrderRow context menu
```

**Implementation depth for observer:**
```
File: lib/patterns/observer/TrackingObserver.ts
- Private listeners: Map<string, Set<callback>>
- subscribe(agentId, callback): adds listener, returns unsubscribe function
- notify(agentId, data): calls all listeners for that agent
- unsubscribeAll(): cleanup method for page unmount
- Integration: useTracking hook creates observer → mock API calls observer.notify() → store updates
- This replaces the direct setInterval→store pattern from logistics1
```

**Implementation depth for decorator:**
```
File: lib/patterns/decorator/AuditDecorator.ts
- withAudit<T>(fn: () => Promise<T>, action: string): () => Promise<T>
- Generates correlationId (UUID v4)
- Logs: [AUDIT] {action} START | correlationId={id} | timestamp={iso}
- On success: [AUDIT] {action} SUCCESS | correlationId={id} | duration={ms}
- On error: [AUDIT] {action} FAILED | correlationId={id} | error={msg}
- Dev mode: also shows toast with correlationId for debugging
```

#### 3C. Animation & Polish Layer (Day 13 afternoon)

| # | Task | Details |
|---|------|---------|
| 3.19 | Route transition animation | `framer-motion` `AnimatePresence` + `motion.div` on route outlet |
| 3.20 | Dashboard stat cards entrance | Staggered `whileInView` with `y: 20 → 0, opacity: 0 → 1` delay 0.1s each |
| 3.21 | Sidebar expand/collapse animation | Width transition `w-16 ↔ w-64` with `transition-all duration-300` |
| 3.22 | Public pages scroll animations | `whileInView` staggered reveals on: Hero, Features, Services, Stats, Testimonials, CTA |
| 3.23 | Order status transition | Pulse + scale animation when status changes in real-time |
| 3.24 | Map marker appearance | Scale from 0 with spring physics when agent appears |
| 3.25 | Toast notifications | Slide-in from top-right with sonner's built-in animation |
| 3.26 | Loading skeletons | Skeleton components for: stat cards, order rows, agent cards, chart areas |

**Skeleton implementation detail:**
```
Components to create:
- SkeletonStatCard: rounded-xl bg-slate-100 h-24, inner bars animate-pulse
- SkeletonOrderRow: flex of rounded bars at 64px height, matching OrderRow column widths
- SkeletonAgentCard: circle + 2 text lines + status bar, animate-pulse
- SkeletonChart: rounded-xl bg-slate-100 h-64, inner shimmer
- Used: wrap each page's fetch with isLoading ? <Skeleton... /> : <ActualContent />
```

**Framer-motion patterns from Logistics Next.js to adapt:**
- `Profile.tsx`: `motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}` → use for card entrances
- `Profile.tsx`: `motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}` → use for primary CTAs
- Public pages: `whileInView={{ opacity: 1, y: 0 }}` with `viewport={{ once: true }}` for scroll reveals

#### 3D. Error Handling & Edge Cases (Day 14 morning)

| # | Task | Details |
|---|------|---------|
| 3.27 | API error interceptor | Axios response interceptor: 401 → logout, 4xx → toast, 5xx → toast with retry |
| 3.28 | Network error handling | "Connection lost" banner at top, auto-retry with exponential backoff |
| 3.29 | Empty states | Custom `EmptyState.tsx`: icon + title + subtitle + optional action button |
| 3.30 | Error boundary | React error boundary wrapping dashboard layout, fallback UI with "Reload" |
| 3.31 | 404 page | Branded page: DTEx logo, "Page not found", orange + blue gradient accent, "Go Home" button |
| 3.32 | Improve Track page (public) | Align mock data format with real API `GET /api/tracking/:trackingNo` response |
| 3.33 | Form validation errors | Red border + shake animation + error text below field (Zod error messages) |
| 3.34 | Optimistic update rollback | On mutation failure: revert store, show "Update failed" toast, refetch from server |

**Empty state designs:**
```
Orders (no orders): Package icon + "No orders found" + "Try adjusting your filters" + "Clear filters" button
Tracking (no agents): Map icon + "No active deliveries" + "Agents will appear when on delivery"
Carriers (no quotes): Calculator icon + "No quotes available" + "Enter shipment details to get quotes"
Dashboard (no data): BarChart icon + "No data yet" + "Orders will appear as they're created"
```

#### 3E. Responsive & Accessibility (Day 14 afternoon)

| # | Task | Details |
|---|------|---------|
| 3.35 | Dashboard responsive | Sidebar auto-collapse on < 1024px, stat cards stack to 2-col on tablet |
| 3.36 | Orders page responsive | Filters collapse to dropdown on mobile, order list becomes card view |
| 3.37 | Tracking responsive | Map goes full-width on mobile, agent list moves below |
| 3.38 | Table responsive | DataTable scrolls horizontally on small screens |
| 3.39 | Touch targets | All clickable elements min 44×44px on mobile |
| 3.40 | Focus indicators | Visible focus ring (`focus:ring-2 ring-orange-500 ring-offset-2`) on all interactive elements |
| 3.41 | Keyboard navigation | Tab order through sidebar, filters, table rows |
| 3.42 | Branding final check | Ensure "DTEx" everywhere, consistent logo usage, favicon |

**Responsive breakpoints:**
```
sm (640px):  Stack most grids, mobile nav
md (768px):  2-column grids, sidebar collapses
lg (1024px): 3-column grids, sidebar expands
xl (1280px): Full layout, wider content area
```

---

## 7. Page-by-Page Specification

### 7.1 Login Page (`/auth/login`)

**Layout:** Public layout (no sidebar). Centered card on blurred background.

**Elements:**
- DTEx logo + tagline at top
- Username input (icon prefix: User icon)
- Password input (icon prefix: Lock icon, show/hide toggle)
- "Sign In" button (orange-500, full width)
- Error display (red border, shake animation)
- Test account hint (collapsible section showing demo credentials)

**Behavior:**
- `POST /api/auth/login` with `{ username, password }`
- On success: store JWT + user in authStore → redirect by role
- On error: show error message from API (`AUTH_FAILED`)
- Redirect mapping: Admin → `/dashboard`, Dispatcher → `/orders`, Driver → `/orders`, Viewer → `/dashboard`

**Validation (Zod):**
- Username: required, min 3 chars
- Password: required, min 6 chars

---

### 7.2 Dashboard (`/dashboard`)

**Layout:** Dashboard layout with sidebar.

**Admin/Dispatcher view:**
- 4 KPI stat cards (Total Orders, In Transit, Delivered Today, Revenue)
- Revenue trend line chart (past 30 days)
- Order status pie chart
- Top carriers bar chart
- Recent orders table (5 latest, clickable)

**Driver view:**
- 2 stat cards (My Active Deliveries, Completed Today)
- My assigned orders list
- Quick status update buttons

**Viewer view:**
- 2 stat cards (My Orders, My Spending)
- Personal order list
- Spending trend chart (personal)

---

### 7.3 Orders Page (`/orders`)

**Layout:** Dashboard layout.

**Elements:**
- Header: "Orders" title + "Create Order" button (Admin/Dispatcher only) + "Export CSV" button
- Filters bar: search input (debounced), status chips, priority chips, date range
- Virtualized order list (handles 10K+ rows)
- Each row: order#, customer, status badge, priority badge, amount, date, region

**Behavior:**
- Fetch all orders via `GET /api/orders`
- Client-side filtering & sorting (server returns all)
- Click row → navigate to `/orders/:id`
- CSV export generates and downloads file
- Driver: only sees own assigned orders
- Viewer: only sees own orders

---

### 7.4 Order Detail (`/orders/:id`)

**Layout:** Dashboard layout.

**Elements:**
- Back button → `/orders`
- Header: Order # + status badge + priority badge
- **Left column:**
  - Customer info card (name, phone, email)
  - Items table (description, qty, weight, dimensions)
  - Order metadata (service level, carrier, tracking #, dates)
- **Right column:**
  - Status timeline (horizontal stepper with progress bar)
  - Action buttons (Confirm, Ship, Deliver, Cancel — based on current state)
  - Address cards (origin + destination with map link)
  - Audit trail (if available)

**State machine actions:**
| Current Status | Available Actions |
|----------------|-------------------|
| Created | Confirm, Cancel |
| Confirmed | Ship, Cancel |
| Shipped | Mark Delivered |
| Delivered | (none — terminal) |
| Cancelled | (none — terminal) |

---

### 7.5 Create Order (`/orders/create`)

**Layout:** Dashboard layout.

**Multi-step form (4 steps):**

1. **Customer Info:** Name, phone (Chinese format), email
2. **Addresses:** Origin (street, city, province, postal) + Destination (same)
3. **Items:** Add/remove items with description, quantity, weight (Kg/G/Jin/Lb), dimensions
4. **Review & Submit:** Service level select (Express/Standard/Economy), summary, submit

**Validation:** Zod schemas per step. Can navigate back without losing data.

**API:** `POST /api/orders` with full request body.

---

### 7.6 Tracking Page (`/tracking`)

**Layout:** Dashboard layout (full-width, minimal padding).

**Elements:**
- View mode toggle: Split | Map Only | List Only
- **Map area:** MapLibre with CARTO basemap, agent markers, popups
- **Agent list panel:** Scrollable cards showing name, status, vehicle, rating, active orders count
- **Selected agent detail:** Bottom/right panel showing full agent info + assigned orders

**Behavior:**
- On mount: fetch all agents + auto-subscribe to location updates
- On unmount: unsubscribe (cleanup interval/websocket)
- Markers colored by status, pulse animation on selected
- Click marker or card → select agent → zoom to agent → show detail
- Map legend overlay

---

### 7.7 Carriers Page (`/carriers`)

**Layout:** Dashboard layout.

**Elements:**
- Carrier cards grid (name, code, services, rating, price range)
- "Get Quote" button per carrier → expandable quote form
- Quote comparison table (side-by-side when multiple quotes received)
- Book button → `POST /api/carriers/:code/book`

---

### 7.8 Routing Page (`/routing`)

**Layout:** Dashboard layout.

**Elements:**
- Origin input (city/province autocomplete)
- Destination input (same)
- Weight & dimensions inputs
- Service level select
- "Calculate Routes" button
- **Results area:**
  - 3-column comparison card (Fastest | Cheapest | Balanced)
  - Each shows: carrier, cost, estimated time, distance
  - Map visualization with route overlay (optional, via API response coords)

---

### 7.9 Reports Page (`/reports`)

**Layout:** Dashboard layout.

**Elements:**
- Month/year selector
- Shipment volume chart (bar chart by week)
- Revenue by carrier (pie chart)
- Summary stats (total shipments, total revenue, avg cost)
- "Download CSV" button

---

### 7.10 Settings Page (`/settings`)

**Layout:** Dashboard layout.

**Elements:**
- Profile card (name, email, role badge)
- Your permissions grid (checkmarks for what role can do)
- Real-time updates toggle
- Role comparison matrix (Admin only — shows all roles side-by-side)

---

## 8. Role Permission Matrix

| Feature | Admin | Dispatcher | Driver | Viewer |
|---------|-------|------------|--------|--------|
| View all orders | ✅ | ✅ | ❌ (own only) | ❌ (own only) |
| Create order | ✅ | ✅ | ❌ | ❌ |
| Confirm order | ✅ | ✅ | ❌ | ❌ |
| Ship order | ✅ | ✅ | ❌ | ❌ |
| Cancel order | ✅ | ✅ | ❌ | ❌ |
| Mark delivered | ✅ | ✅ | ✅ (own) | ❌ |
| Edit destination | ✅ | ✅ | ❌ | ❌ |
| View revenue/analytics | ✅ | ✅ | ❌ | ❌ |
| View personal spending | ✅ | ✅ | ✅ | ✅ |
| Export CSV | ✅ | ✅ | ❌ | ❌ |
| View tracking map | ✅ | ✅ | ✅ | ✅ |
| Compare carriers | ✅ | ✅ | ❌ | ❌ |
| Book carrier | ✅ | ✅ | ❌ | ❌ |
| Calculate routes | ✅ | ✅ | ❌ | ✅ (view only) |
| View reports | ✅ | ✅ | ❌ | ❌ |
| Manage settings | ✅ | ✅ | ✅ (own) | ✅ (own) |
| View role matrix | ✅ | ❌ | ❌ | ❌ |

---

## 9. Design System

> **LIGHT THEME ONLY.** No dark mode. The entire dashboard is bright, minimal color mix orange,yellow blue, purple, professional. This is NOT a dark dashboard. Every component must be designed for light system backgrounds.

### Color Palette

```
DTEx Brand Colors:
├── Primary Orange:    #F97316 (orange-500)  — CTAs, active states, primary accent
├── Primary Blue:      #2563EB (blue-600)    — Hero gradients, links, info states
├── Deep Blue:         #1D4ED8 (blue-700)    — Gradient mid
├── Darker Blue:       #1E40AF (blue-800)    — Gradient end

Dashboard Light Theme:
├── Page Background:   #F1F5F9 (slate-100)   — Main page bg behind content
├── Surface:           #FFFFFF (white)        — Cards, sidebar, modals, dropdowns
├── Surface Hover:     #F8FAFC (slate-50)     — Hover states on white surfaces
├── Surface Elevated:  #FFFFFF (white)        — Cards with shadow-sm for elevation
├── Border Primary:    #E2E8F0 (slate-200)    — Card borders, dividers
├── Border Secondary:  #CBD5E1 (slate-300)    — Input borders, stronger dividers

Sidebar (LIGHT):
├── Background:        #FFFFFF (white)        — Clean white sidebar
├── Border:            #E2E8F0 (slate-200)    — Right border to separate from content
├── Item Hover:        #FFF7ED (orange-50)    — Warm hover on nav items
├── Item Active:       #F97316 (orange-500)   — Active item text/indicator
├── Item Active BG:    #FFF7ED (orange-50)    — Active item background

Semantic Colors:
├── Success:           #22C55E (green-500)    — Delivered, available
├── Success Light:     #F0FDF4 (green-50)     — Success badge/pill bg
├── Warning:           #F59E0B (amber-500)    — In-transit, pending
├── Warning Light:     #FFFBEB (amber-50)     — Warning badge/pill bg
├── Error:             #EF4444 (red-500)      — Failed, cancelled
├── Error Light:       #FEF2F2 (red-50)       — Error badge/pill bg
├── Info:              #3B82F6 (blue-500)     — Created, informational
├── Info Light:        #EFF6FF (blue-50)      — Info badge/pill bg

Text (ON LIGHT BACKGROUNDS):
├── Primary:           #0F172A (slate-900)    — Headings, important text
├── Secondary:         #334155 (slate-700)    — Body text, descriptions
├── Tertiary:          #64748B (slate-500)    — Labels, captions, timestamps
├── Muted:             #94A3B8 (slate-400)    — Placeholder text, disabled
├── Accent:            #F97316 (orange-500)   — Order numbers, highlighted data
├── Link:              #2563EB (blue-600)     — Clickable links
```

### Typography

```
Headings:   Inter (or system sans-serif) — clean, modern
Body:       Inter — readable at all sizes
Monospace:  JetBrains Mono — order numbers, tracking codes, amounts
```

### Component Variants (ALL LIGHT THEME mionimal color tounge orange and blue)

**Buttons:**
- Primary: `bg-orange-500 hover:bg-orange-600 text-white shadow-sm`
- Secondary: `bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200`
- Ghost: `hover:bg-slate-100 text-slate-600`
- Danger: `bg-red-50 text-red-600 hover:bg-red-100 border border-red-200`
- Outline: `border border-slate-300 hover:bg-slate-50 text-slate-700`

**Source adaptation from logistics1 Button.tsx:**
- `focus:ring-offset-[#0a0e17]` → `focus:ring-offset-white` (ring offset matches bg)
- `bg-amber-500 text-slate-900` → `bg-orange-500 text-white` (primary)
- `bg-slate-700 text-slate-100` → `bg-slate-100 text-slate-700` (secondary — inverted for light)
- `hover:bg-slate-800` → `hover:bg-slate-100` (ghost hover)
- `border-slate-600` → `border-slate-300` (outline border)

**Cards (ALL on light bg):**
- Default: `bg-white rounded-xl shadow-sm`
- Bordered: `bg-white rounded-xl border border-slate-200`
- Accent: `bg-white rounded-xl border-l-4 border-l-orange-500 shadow-sm`
- Stat: `bg-white rounded-xl shadow-sm p-6` with icon circle in `bg-orange-50`

**Source adaptation from logistics1 Card.tsx:**
- `bg-[#151d2e]` → `bg-white` (default)
- `glass-panel` → `bg-white/80 backdrop-blur-sm` (glass effect on light — rarely needed)
- `bg-[#151d2e] border border-slate-700/50` → `bg-white border border-slate-200` (bordered)
- `text-slate-100` (CardTitle) → `text-slate-900`

**Status badges (ON LIGHT BG — colored pill with light fill):**
| Status | Light Theme Style |
|--------|-------------------|
| Created | `bg-blue-50 text-blue-700 border border-blue-200` |
| Confirmed | `bg-cyan-50 text-cyan-700 border border-cyan-200` |
| Shipped | `bg-amber-50 text-amber-700 border border-amber-200` |
| Out for Delivery | `bg-purple-50 text-purple-700 border border-purple-200` |
| Delivered | `bg-green-50 text-green-700 border border-green-200` |
| Failed | `bg-red-50 text-red-700 border border-red-200` |
| Cancelled | `bg-gray-100 text-gray-600 border border-gray-200` |

**Source adaptation from logistics1 StatusBadge.tsx:**
- STATUS_CONFIG colors change: all `*-400` text → `*-700`, all `*-400/10` bg → `*-50`
- PRIORITY_CONFIG same pattern
- `border-current/20` stays (works on both themes)

**Priority badges:**
| Priority | Light Theme Style |
|----------|-------------------|
| Low | `bg-slate-100 text-slate-600 border border-slate-200` |
| Normal | `bg-blue-50 text-blue-700 border border-blue-200` |
| High | `bg-orange-50 text-orange-700 border border-orange-200` |
| Urgent | `bg-red-50 text-red-700 border border-red-200` |

**Input fields:**
- Default: `bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500`
- Search: same + search icon inside (`Search` lucide, text-slate-400)
- Error: `border-red-500 focus:ring-red-500` + red text below

**Timeline (OrderTimeline.tsx adaptation):**
- Progress bar bg: `bg-slate-200` (was `bg-slate-700/50`)
- Progress fill: `bg-gradient-to-r from-orange-500 to-green-500` (was amber-to-emerald)
- Step circles completed: `bg-white border-2 border-green-500 text-green-600` (was `bg-slate-800 border-emerald-500 text-emerald-400`)
- Step circles current: `bg-white border-2 border-orange-500 text-orange-500 animate-pulse` (was `bg-slate-800 border-amber-500`)
- Step circles pending: `bg-slate-100 border-slate-300 text-slate-400` (was `bg-slate-800/50 border-slate-700`)
- Step labels: `text-slate-600` completed, config.color current, `text-slate-400` pending

**MiniTimeline dots:**
- Completed: `bg-green-500` (stays)
- Current: `bg-orange-500 animate-pulse` (was amber)
- Pending: `bg-slate-200` (was `bg-slate-700`)
- Failed: `bg-red-500` (stays)

### Tailwind Config Extensions

```js
// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'dtex-orange': {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',  // primary
          600: '#EA580C',
          700: '#C2410C',
        },
        'dtex-blue': {
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#3B82F6',
          600: '#2563EB',  // primary
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#8a2de0',

        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        slideUp: { '0%': { transform: 'translateY(10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideInRight: { '0%': { transform: 'translateX(10px)', opacity: '0' }, '100%': { transform: 'translateX(0)', opacity: '1' } },
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        pulseGlow: { '0%, 100%': { boxShadow: '0 0 0 0 rgba(249, 115, 22, 0.3)' }, '50%': { boxShadow: '0 0 0 8px rgba(249, 115, 22, 0)' } },
      },
    }
  },
  plugins: [],
};
```

### Layout Principles (LIGHT)

- **Public pages:** `max-w-7xl mx-auto`, white bg, `py-16` sections
- **Dashboard:** Full viewport, `bg-slate-100` page bg, white cards for content
- **Sidebar:** White bg, `border-r border-slate-200`, 64px collapsed / 256px expanded
- **Header:** White bg, `border-b border-slate-200`, breadcrumb + user info
- **Cards:** White bg, `rounded-xl`, `shadow-sm` or `border border-slate-200`, 16px padding
- **Modals:** White bg, `rounded-xl`, `shadow-xl`, dark overlay `bg-black/50`
- **Spacing:** 8px base unit (p-2, p-4, p-6, p-8)

### Global Color Remapping Reference

This table maps EVERY dark color from logistics1 to its DTEx light equivalent:

| logistics1 Dark | DTEx Light | Usage |
|-----------------|------------|-------|
| `#0a0e17` | `#F1F5F9` (slate-100) | Page background |
| `#0d1117` | `#FFFFFF` (white) | Sidebar background |
| `#151d2e` | `#FFFFFF` (white) | Card background |
| `bg-slate-800/30` | `bg-slate-50` | Subtle nested bg (rows, info boxes) |
| `bg-slate-800/50` | `bg-slate-100` | Filter chips inactive bg |
| `bg-slate-800` | `bg-slate-100` | Headers, table header bg |
| `bg-slate-700` | `bg-slate-200` | Avatar placeholder circles |
| `bg-slate-700/50` | `border-slate-200` | Borders and dividers |
| `border-slate-800/50` | `border-slate-200` | Card/section borders |
| `border-slate-700/50` | `border-slate-200` | Inner section dividers |
| `text-slate-100` | `text-slate-900` | Primary headings |
| `text-slate-200` | `text-slate-800` | Secondary headings, important text |
| `text-slate-300` | `text-slate-700` | Body text |
| `text-slate-400` | `text-slate-500` | Labels, captions |
| `text-slate-500` | `text-slate-400` | Timestamps, muted text |
| `text-slate-600` | `text-slate-400` | Disabled/pending text |
| `text-amber-400` | `text-orange-500` | Order numbers, accent data |
| `text-amber-500` | `text-orange-600` | Primary accent text |
| `text-emerald-400` | `text-green-600` | Success text |
| `bg-amber-500` | `bg-orange-500` | Primary buttons, active pills |
| `bg-amber-500/20` | `bg-orange-50` | Active badge/pill background |
| `bg-emerald-500` | `bg-green-500` | Success indicators |
| `bg-emerald-500/5` | `bg-green-50` | Permission granted row bg |
| `bg-red-500/10` | `bg-red-50` | Error/danger background |
| `bg-red-500/20` | `bg-red-50` | Failed status background |
| `bg-blue-500/20` | `bg-blue-50` | Info background |
| `bg-slate-900/90` | `bg-white shadow-lg` | Map legend overlay |
| `hover:bg-slate-800` | `hover:bg-slate-100` | Row/item hover |
| `hover:bg-slate-800/30` | `hover:bg-slate-50` | Subtle hover |

---

## 10. Data Layer Strategy

### Dual-Mode API Layer

The app supports TWO modes, controlled by environment variable:

```ts
// .env
VITE_API_MODE=mock    # 'mock' | 'live'
VITE_API_BASE_URL=http://localhost:5198
```

**Mock mode:** Uses `services/mockApi.ts` with seeded generators (from logistics1). No network calls.

**Live mode:** Uses `lib/api/*.ts` with real axios HTTP calls to backend.

### API Client (live mode)

```ts
// lib/api/index.ts
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: inject JWT + correlationId
// Response interceptor: unwrap ApiResponse<T> envelope, handle 401
```

### State Management Strategy

| Store | Purpose | Persistence |
|-------|---------|-------------|
| `authStore` | User, token, role | localStorage (persist) |
| `ordersStore` | Orders Map, filters, sort | Memory only |
| `agentsStore` | Agents Map, locations, selection | Memory only |
| `uiStore` | Sidebar, modals, notifications, real-time toggle | Memory only |

### Data Flow

```
Page → useHook() → { TanStack Query fetch → API layer → response }
                    → { Zustand store write → re-render }
                    → { subscription → store update → re-render }
```

### Real-Time Strategy

- WebSocket/subscription ONLY on Tracking page (not global)
- Subscribe on mount, unsubscribe on unmount (via `useEffect` cleanup)
- Mock mode: `setInterval` emitting location updates every 1-2s
- Live mode: SignalR hub connection (future) or SSE

### Error Handling

```
API Error → {
  show: toast notification with friendly message
  log: correlationId to console (dev mode)
  401: auto-logout + redirect to /auth/login
  network: "Connection error" toast with retry
}
```

---

## 11. Design Patterns Implementation

### Strategy Pattern — Route Calculation

```ts
// lib/patterns/strategy/RouteStrategy.ts
interface RouteStrategy {
  name: string;
  calculate(origin: Address, destination: Address, weight: number): RouteResult;
}

// FastestStrategy.ts — prioritize delivery speed
// CheapestStrategy.ts — prioritize lowest cost
// BalancedStrategy.ts — weighted combination

// Usage in useRouting hook:
const strategy = getStrategy(selectedStrategy); // factory function
const result = strategy.calculate(origin, dest, weight);
```

**Where it shows in UI:** Routing page — user selects strategy, sees comparison of all three.

### Factory Pattern — Carrier Creation

```ts
// lib/patterns/factory/CarrierFactory.ts
class CarrierFactory {
  static create(code: string): CarrierAdapter {
    switch (code) {
      case 'SF': return new SFExpressAdapter();
      case 'JD': return new JDLogisticsAdapter();
      default: throw new Error(`Unknown carrier: ${code}`);
    }
  }
}
```

**Where it shows in UI:** Carriers page + booking flow — factory returns the right adapter for the selected carrier.

### Adapter Pattern — Carrier API Normalization

```ts
// lib/patterns/adapter/CarrierAdapter.ts
interface CarrierAdapter {
  getQuote(shipment: ShipmentDetails): Promise<Quote>;
  book(shipment: ShipmentDetails): Promise<BookingConfirmation>;
  track(trackingNo: string): Promise<TrackingInfo>;
}

// SFExpressAdapter normalizes SF's API response to our Quote type
// JDLogisticsAdapter normalizes JD's API response to our Quote type
```

### Observer Pattern — Tracking Updates

```ts
// lib/patterns/observer/TrackingObserver.ts
class TrackingObserver {
  private listeners: Map<string, Set<(data: AgentUpdate) => void>>;

  subscribe(agentId: string, callback: (data: AgentUpdate) => void): () => void;
  notify(agentId: string, data: AgentUpdate): void;
}
```

**Where it shows in UI:** Tracking page — observers get notified of location changes → store update → marker moves.

### State Pattern — Order Lifecycle

```ts
// lib/patterns/state/OrderStateMachine.ts
class OrderStateMachine {
  private static transitions: Record<OrderStatus, OrderStatus[]> = {
    'Created': ['Confirmed', 'Cancelled'],
    'Confirmed': ['Shipped', 'Cancelled'],
    'Shipped': ['Delivered'],
    'Delivered': [],
    'Cancelled': [],
  };

  static canTransition(from: OrderStatus, to: OrderStatus): boolean;
  static getAvailableActions(status: OrderStatus): OrderStatus[];
}
```

**Where it shows in UI:** Order detail page — action buttons are enabled/disabled based on state machine.

### Decorator Pattern — Audit Logging

```ts
// lib/patterns/decorator/AuditDecorator.ts
function withAudit<T>(apiCall: () => Promise<T>, action: string): () => Promise<T> {
  return async () => {
    const correlationId = generateUUID();
    console.log(`[AUDIT] ${action} started — ${correlationId}`);
    const result = await apiCall();
    console.log(`[AUDIT] ${action} completed — ${correlationId}`);
    return result;
  };
}
```

### CQRS — Separate Read/Write Paths

```ts
// Commands (write operations)
// lib/patterns/cqrs/commands/CreateOrderCommand.ts
class CreateOrderCommand {
  constructor(private data: CreateOrderRequest) {}
  async execute(): Promise<Order> {
    // Validate → call API → update store
  }
}

// Queries (read operations)
// lib/patterns/cqrs/queries/GetOrdersQuery.ts
class GetOrdersQuery {
  constructor(private filters: OrderFilters) {}
  async execute(): Promise<Order[]> {
    // Check cache → call API if stale → return
  }
}
```

---

## 12. Reuse Map from Other Codebases

> **CRITICAL:** We ADAPT from these sources, we do NOT copy. Every file needs structural and color changes to fit DTEx light theme. The tables below specify exactly what to keep, what to change, and how.

### From logistics1 (→ logistics2) — Deep Adaptation Guide

#### Stores Layer

| Source File | Lines | Keep | Change |
|-------------|-------|------|--------|
| `stores/authStore.ts` (66 lines) | Zustand + persist middleware pattern | Replace `generateMockUser()` with real JWT decode. Remove mock login. Add `setToken(jwt)`, `clearAuth()`. Keep `isAuthenticated` derived state. Keep `hasPermission()` with ROLE_PERMISSIONS lookup. Keep `persist` to localStorage. Add cross-store reset pattern on logout (calls `useOrdersStore.getState().reset()` etc). |
| `stores/ordersStore.ts` (344 lines) | Map-based `orders: Map<string, Order>` with O(1) lookup. Keep `filterAndSortOrders()` pure function. Keep filter types (status[], priority[], region[], search, dateRange). Keep sort with 7 fields. Keep `getStats()` computed method. Keep `getOrder(id)` direct lookup. | Replace `initialProcessingQueue` with empty map (data comes from API). Align `Order` type with our API response contract (different field names — see types section). Status values: `created/packed/shipped/out_for_delivery/delivered/failed` → our API uses `Created/Confirmed/Shipped/Delivered/Cancelled`. |
| `stores/agentsStore.ts` (75 lines) | Map-based `agents: Map<string, DeliveryAgent>`. Keep `updateAgentLocation(id, lat, lng)` for real-time. Keep `selectedAgentId` state. Keep `getAllAgents()`, `getAgentsByStatus()`, `getAgentsByRegion()` selectors. | Type alignment — our API may not have agents endpoint. For mock mode, keep the structure. Remove mock initialization. |
| `stores/uiStore.ts` (85 lines) | Keep sidebar state (`isCollapsed`, `toggleSidebar`). Keep notification system (`notifications[]`, `addNotification`, auto-remove via `setTimeout`). Keep `isRealTimeEnabled` toggle. Keep modal state pattern. | Remove `lastUpdateTime` (not needed for light dashboard). Notification type: keep `{id, type, title, message, duration}`. |

#### Hooks Layer

| Source File | Lines | Keep | Change |
|-------------|-------|------|--------|
| `hooks/useOrders.ts` (183 lines) | Keep the full TanStack Query + Zustand bridge pattern. Keep `useQuery({ queryKey: ['orders'], queryFn, staleTime: 5min })`. Keep `useMutation` with optimistic update pattern. Keep real-time subscription toggle (`isRealTimeEnabled` → subscribe/unsubscribe). Keep `useOrder(orderId)` single-order hook with store-first-then-API fallback. Keep `filterOrdersByUser()` for role-based filtering. | Change `api.fetchAllOrders` → `ordersApi.getAll()` (our axios-based API). Change subscription from `api.subscribeToOrderUpdates` → observer pattern or mock setInterval. Add invalidation on user change (the `lastUserRef` pattern). Change notification emojis to plain text. |
| `hooks/useAgents.ts` (67 lines) | Keep TanStack Query fetch + store sync pattern. Keep real-time subscription with cleanup. Keep `isRealTimeEnabled` gate. | Change API import to our api layer. |
| `hooks/useExceptions.ts` (46 lines) | Keep `useQuery` + `useMutation` for resolve action. Keep notification on success/error. Keep `isResolving` pending state. | This may be mock-only (no backend endpoint). |

#### UI Components Layer

| Source Component | Lines | Keep | Adapt Colors |
|-----------------|-------|------|--------------|
| `Button.tsx` (48 lines) | Keep `forwardRef` pattern. Keep 5 variants + 4 sizes. Keep `isLoading` with Loader2 spinner. Keep `cn()` usage. | **Every variant changes** — see Section 9 "Component Variants". Primary: amber→orange, dark text→white text. Secondary: slate-700→slate-100, light text→dark text. Ghost: slate-800 hover→slate-100 hover. Focus ring offset: `#0a0e17`→`white`. |
| `Card.tsx` (70 lines) | Keep `forwardRef`. Keep 3 variants + 4 paddings. Keep CardHeader (flex between) + CardTitle. | Default: `bg-[#151d2e]`→`bg-white shadow-sm`. Bordered: add `border border-slate-200`. Glass: rarely needed on light. CardTitle: `text-slate-100`→`text-slate-900`. |
| `StatusBadge.tsx` (100 lines) | Keep `memo` optimization. Keep size variants (sm/md/lg) with different paddings and icon sizes. Keep config-driven approach. Keep both StatusBadge and PriorityBadge exports. | All `STATUS_CONFIG` colors change: `text-*-400`→`text-*-700`, `bg-*-400/10`→`bg-*-50`. See Section 9 Status Badges table. |
| `Input.tsx` | Keep icon prefix (isSearch) pattern. Keep focus ring. | Dark bg→white bg. `border-slate-700`→`border-slate-300`. `text-slate-100`→`text-slate-900`. `placeholder:text-slate-500`→`placeholder:text-slate-400`. |
| `Select.tsx` | Keep basic select wrapper. | Same color adaptation as Input. |
| `Spinner.tsx` | Keep PageLoader overlay pattern. | `bg-[#0a0e17]`→`bg-slate-100`. Spinner color: amber→orange. |

#### Page Components Layer

| Source Page | Lines | Keep Structure | Adapt for Light + DTEx |
|-------------|-------|---------------|------------------------|
| `LoginPage.tsx` (154 lines) | Keep centered card layout. Keep form with icon-prefixed inputs. Keep error display. | **Major change:** Remove role-selector cards (we use username/password). Replace `bg-[#0a0e17]` page bg → white or light gradient. Card: `bg-[#0d1117]` → `bg-white shadow-xl`. Input fields: dark→light. Button: amber→orange. Error: keep red border + shake. Add Zod validation (from Logistics/signin pattern). Add test credentials hint section. |
| `DashboardPage.tsx` (235 lines) | Keep 4-stat-card layout. Keep status distribution section. Keep recent orders table. Keep stats computation pattern. | All `bg-slate-800/30`→`bg-white`. Stat card borders: `border-l-4 border-amber-500`→`border-l-4 border-orange-500`. Text: all slate-100/200/300→slate-900/700/500. Chart tooltip: dark bg tooltip stays (looks good on light too) or change to white. Bar heights: keep the percentage-width bars but orange instead of amber. |
| `OrdersPage.tsx` (113+ lines) | Keep CSV export function (Blob download). Keep page structure: Header + Filters + VirtualizedList. Keep `handleExportCSV` pattern with `useCallback`. | Header actions: style for light. CSV button: outline style on light bg. |
| `OrderDetailPage.tsx` (465 lines) | Keep full 3-column layout: Header → Timeline card → 2-col (items+history | customer+address+delivery). Keep all status action handlers (advance, markFailed, retry). Keep edit mode with Select dropdowns. Keep `isUpdating` loading state on buttons. | **Significant color changes throughout**: every `bg-slate-800/30`→`bg-slate-50`, every `text-slate-200`→`text-slate-800`, `text-amber-400`→`text-orange-500` (order numbers, amounts). Customer card avatar: `bg-slate-700`→`bg-slate-200`. Mark Failed button: `text-red-400 hover:bg-red-500/10`→`text-red-600 hover:bg-red-50`. |
| `TrackingPage.tsx` (443 lines) | Keep 3-component architecture: AgentCard + AgentMarker + InteractiveMap. Keep view mode toggle (split/map/list). Keep agent selection flow (click marker/card → zoom → show detail). Keep Popup component for map markers. | **Map legend overlay:** `bg-slate-900/90`→`bg-white shadow-lg border border-slate-200`. **Selected agent panel:** `bg-slate-900/95`→`bg-white shadow-xl border border-slate-200`. **View mode toggle:** `bg-slate-800/50`→`bg-slate-100`, active: `bg-amber-500 text-slate-900`→`bg-orange-500 text-white`. **Agent status dots:** keep green/blue/amber/gray colors. **Map basemap:** Consider CARTO positron (light) instead of dark-matter, OR keep dark-matter for map contrast. |
| `ExceptionsPage.tsx` (286 lines) | Keep `exceptionConfig` typed config object. Keep severity color coding with `border-l-4`. Keep resolution flow (expand input → submit). Keep filter bar with type/severity/resolved toggles. Keep stats row. | All dark bg→white. Exception cards: `bg-slate-800/30`→`bg-white border border-slate-200`. Severity border stays (colored left border on white card). Filter chips: `bg-slate-800/50`→`bg-slate-100`. |
| `SettingsPage.tsx` (297 lines) | Keep profile card + permissions grid layout. Keep role badge styling pattern. Keep permissions matrix table (Admin only). Keep real-time toggle. | Profile card: `bg-slate-700` avatar→`bg-slate-200`. Permission rows: `bg-emerald-500/5`→`bg-green-50`. Role badges: `bg-amber-500/10`→`bg-amber-50`, text+border equivalent. Table: `border-slate-700/50`→`border-slate-200`. |

#### Layout Components Layer

| Source Component | Lines | Keep | Adapt |
|-----------------|-------|------|-------|
| `Sidebar.tsx` (156 lines) | Keep collapsible architecture (64px↔256px). Keep role-based menu items. Keep active route detection with `useLocation`. Keep tooltip labels when collapsed. Keep logout at bottom. | **Complete retheme:** `bg-[#0d1117]`→`bg-white border-r border-slate-200`. Nav items: `text-slate-400 hover:text-slate-200 hover:bg-slate-800`→`text-slate-600 hover:text-slate-900 hover:bg-orange-50`. Active: `bg-amber-500/10 text-amber-400 border-l-amber-500`→`bg-orange-50 text-orange-600 border-l-orange-500`. Role badge: `bg-amber-500/20 text-amber-400`→`bg-orange-50 text-orange-700 border border-orange-200`. Logo area: white bg, DTEx orange logo. |
| `Header.tsx` (56 lines) | Keep title + subtitle + actions slot. Keep real-time indicator dot (green pulse when enabled). | `bg-transparent`→could add `bg-white border-b border-slate-200`. Title: `text-slate-100`→`text-slate-900`. Subtitle: `text-slate-400`→`text-slate-500`. Real-time dot: keep green pulse. |
| `Layout.tsx` (35 lines) | Keep auth guard pattern (`if !isAuthenticated → Navigate to /login`). Keep sidebar + main content flex layout. Keep dynamic `margin-left` for collapsed/expanded sidebar. | Background: page area `bg-slate-100`. Content padding: `p-6`. |

#### Utility & Data Layer

| Source File | Lines | Keep | Adapt |
|-------------|-------|------|-------|
| `lib/utils.ts` (164 lines) | Keep `cn()` function (clsx + twMerge). Keep `STATUS_CONFIG` and `PRIORITY_CONFIG` objects (but change colors). Keep `ROLE_PERMISSIONS` mapping. Keep `formatCurrency()`, `formatDate()`, `formatWeight()`. Keep `debounce()` and `throttle()`. Keep `getNextStatus()` helper. | **STATUS_CONFIG colors all change** — every `text-*-400` → `text-*-700`, every `bg-*-400/10` → `bg-*-50`. Change `REGIONS` array to match our API data. Add `formatDateCN()` for Chinese format. Add CNY currency support in `formatCurrency()`. |
| `types/index.ts` (237 lines) | Keep `Order`, `OrderItem`, `OrderTimeline`, `OrderStatus`, `OrderPriority`, `OrderFilters`, `SortConfig` types. Keep `DeliveryAgent`, `AgentStatus`. Keep `User`, `UserRole`. | **Extend with:** `Carrier`, `CarrierQuote`, `Route`, `RouteStrategy`, `AuditEntry` (from api-reference.md). **Align:** OrderStatus enum must match our API (`Created/Confirmed/Shipped/Delivered/Cancelled` not `created/packed/shipped/out_for_delivery/delivered/failed`). Add `ApiResponse<T>` envelope type. Add pagination types. |
| `services/api.ts` (305 lines) | Keep lazy cache initialization pattern. Keep `generateSyntheticOrders()` idea for mock mode. Keep subscription pattern (`setInterval` + callback → return unsubscribe). Keep simulated latency (100-300ms). Keep 5% failure rate for realism. | **Restructure:** wrap in `if (VITE_API_MODE === 'mock')` conditional. Reduce to maybe 500-1000 orders (not 10K) for demo. Align generated mock data with our API response format. Keep `subscribeToOrderUpdates` and `subscribeToAgentUpdates` for mock live tracking. |

### From Logistics/Next.js (→ logistics2) — Design Pattern Extraction

> **Backend NOT used.** Only UI/UX patterns extracted for adaptation.

| Pattern | Source | How to Adapt |
|---------|--------|--------------|
| **Recharts dashboard** | `Analytics.tsx` (456 lines) | Reuse: BarChart+LineChart+PieChart pattern, CustomTooltip component, ResponsiveContainer wrapper, time-range Select, KPI metric cards grid (4-col). Adapt: `bg-[#1A1A1A]` cards → `bg-white`. Chart colors: `#22c55e`→our orange/blue palette. Tooltip: `bg-[#1A1A1A]`→`bg-white shadow-lg border`. Grid: `strokeDasharray="3 3" stroke="#333"`→`stroke="#e2e8f0"`. Remove: sidebar (reuse ours), CreditCard display, green accent → orange accent. |
| **Orders table** | `Orders.tsx` (362 lines) | Reuse: status color function pattern (`getStatusColor`, `getPaymentStatusColor`), search+filter bar layout, table structure (TableHeader/TableBody/TableRow). Adapt: our status values differ, use our StatusBadge component instead of inline class function. Our approach: virtualized list (from logistics1) > standard table. Can borrow the Popover date range pattern for OrderFilters. |
| **Profile editing** | `Profile.tsx` (491 lines) | Reuse: edit/save toggle (isEditing→Save Changes / Edit Profile), form grid (2-col with labels), image upload placeholder pattern, AnimatePresence for save confirmation. Adapt: remove NextAuth session handling (we use Zustand authStore). Remove sidebar. Light theme already partially compatible (their `bg-[#1A1A1A]`/`bg-black/30` forms → our white bg). Borrow: disabled-input styling when not editing, bio textarea, social links section (if needed). |
| **Login with Zod** | `app/signin/page.tsx` | Reuse: Zod schema validation pattern, icon-prefixed inputs, error display per field. Adapt: our login is username+password (not the tab component from Logistics). Button: green→orange. |
| **Framer-motion animations** | Profile + various | Reuse: `motion.div initial/animate` for card entrances, `whileHover/whileTap` for button press effects, `AnimatePresence` for mount/unmount transitions. These are universally applicable, no color adaptation needed. |
| **Zod data validation** | `Analytics.tsx` | Reuse: Zod schema for runtime data validation before using API response data. Pattern: define schema → parse → catch → fallback. Good practice even if our API is controlled. |
| **Content externalization** | `constants/constants.ts` | Reuse: pattern of moving all display strings (section titles, descriptions, feature lists) into constants file. Adapt: our content is different but the architecture pattern is valuable for maintainability. |

---

## 13. Source Code Architecture Deep Reference

> **This section serves as the "knowledge pool" for the development agent.** It documents the internal architecture of each source file so the agent understands HOW the code works, not just what it does.

### 13.1 logistics1/stores/ordersStore.ts — Map-Based Order Management (344 lines)

**Architecture:**
```
OrdersStore {
  // State
  orders: Map<string, Order>       // O(1) lookup by ID
  isInitialized: boolean           // guards against empty-state renders
  filters: OrderFilters            // { status[], priority[], region[], search, dateRange }
  sortConfig: SortConfig           // { field: keyof Order, direction: 'asc'|'desc' }

  // Actions
  setOrders(orders: Order[])       // bulk set from API fetch → clears map, repopulates
  updateOrder(id, partial)         // merge partial into existing order
  setFilters(partial)              // merge partial filters
  clearFilters()                   // reset to defaults
  setSortConfig(config)            // set sort field + direction
  reset()                          // clear everything (called on logout)

  // Computed (via get)
  getFilteredOrders()              // calls filterAndSortOrders() pure function
  getStats()                       // computed: total, byStatus counts, byPriority counts
  getOrder(id)                     // direct Map.get()
}
```

**Key pattern — filterAndSortOrders():**
```
Pure function, NOT a store method. Takes (orders Map, filters, sortConfig) → returns Order[]
1. Convert Map.values() to array
2. Filter chain: status → priority → region → search (name/email/orderNumber) → dateRange
3. Sort: compare function handles string/number/date fields + direction
4. Returns new array every time (no mutation)
```

**Why this matters:** The agent should preserve this pure-function filtering pattern. It's testable, composable, and doesn't couple to Zustand.

### 13.2 logistics1/hooks/useOrders.ts — Query-Store Bridge (183 lines)

**Architecture:**
```
useOrders() {
  1. TanStack Query: fetch all orders (staleTime: 5min)
  2. useEffect: when rawOrders changes → filter by user role/region → setOrders to store
  3. useEffect: when user changes → invalidate query → refetch (handles role switch)
  4. useEffect: real-time subscription (gated by isRealTimeEnabled + isInitialized)
     - On update: updateOrder in store + setLastUpdateTime + notification toast
     - Cleanup: unsubscribe on unmount or when disabled
  5. useMutation: update order with OPTIMISTIC update
     - onMutate: immediately update store
     - onError: refetch (revert)
     - onSuccess: invalidateQueries
  6. Returns: { orders, stats, isLoading, filters, sortConfig, setFilters, clearFilters, updateOrder, refetch }
}

useOrder(orderId) {
  1. Try store.getOrder(id) first (instant, no network)
  2. Fallback: TanStack Query fetch by ID (staleTime: 30s)
  3. Returns: { order: storeOrder || fetchedOrder, isLoading }
}
```

**Why this matters:** This is the main data pipeline pattern. The agent should replicate this Query→Store→Component flow for every data domain (carriers, routing, dashboard).

### 13.3 logistics1/services/api.ts — Mock API Service (305 lines)

**Architecture:**
```
Module-level lazy caches:
  let ordersCache: Map<string, Order> | null = null
  let agentsCache: DeliveryAgent[] | null = null

Functions:
  initOrdersCache()    → generates 10,000 orders, stores in Map
  initAgentsCache()    → generates 50 agents with random positions

  fetchAllOrders()     → await delay(200-500ms) → return Array.from(ordersCache.values())
  fetchOrderById(id)   → await delay(100-200ms) → return ordersCache.get(id) || throw
  updateOrderStatus()  → await delay(100-300ms) → mutate cache + return updated
  fetchDeliveryAgents()→ await delay(200ms) → return agents array
  fetchExceptions()    → await delay(200ms) → generate from failed orders

  subscribeToOrderUpdates(callback) → setInterval(3000ms) {
    pick random order → random status change → callback({ orderId, changes })
    5% chance of failure → skip
    return unsubscribe function (clearInterval)
  }

  subscribeToAgentUpdates(callback) → setInterval(1500ms) {
    for each on_delivery agent → small random lat/lng offset → callback({ agentId, lat, lng })
    return unsubscribe function
  }
```

**Adaptation for DTEx:**
- Reduce to 500-1000 mock orders (demo doesn't need 10K)
- Align order format with our API response (different field names)
- Keep the lazy cache pattern (good for performance)
- Keep subscription pattern for mock real-time
- Wrap in conditional: `if (import.meta.env.VITE_API_MODE === 'mock')` so live mode uses axios

### 13.4 logistics1 Component Hierarchy & Data Flow

```
App.tsx
├── QueryClientProvider (staleTime: 5min default)
├── BrowserRouter
│   ├── /login → LoginPage
│   │   └── useAuthStore.login() → redirect
│   └── /* → Layout (auth guard)
│       ├── Sidebar (useAuthStore.user.role → filter menu items)
│       ├── Header (title slot, actions slot)
│       └── <Outlet /> ← matched route component
│           ├── DashboardPage
│           │   ├── useOrders().stats
│           │   ├── 4x StatCard
│           │   ├── StatusDistribution (computed from stats)
│           │   └── RecentOrders (orders.slice(0,5))
│           ├── OrdersPage
│           │   ├── useOrders() (full hook)
│           │   ├── OrderFilters (filters, onFilterChange)
│           │   └── VirtualizedOrderList
│           │       └── OrderRow (per item, memoized)
│           │           ├── StatusBadge
│           │           ├── MiniTimeline
│           │           └── PriorityBadge
│           ├── OrderDetailPage
│           │   ├── useOrder(orderId)
│           │   ├── OrderTimeline (horizontal)
│           │   ├── Order items list
│           │   ├── Customer info card
│           │   └── Action buttons (state machine gated)
│           ├── TrackingPage
│           │   ├── useAgents()
│           │   ├── useOrders() (for agent's assigned orders)
│           │   ├── AgentCard list (left panel)
│           │   ├── InteractiveMap (right panel)
│           │   │   ├── Marker per agent
│           │   │   ├── Popup on click
│           │   │   └── Legend overlay
│           │   └── SelectedAgent panel (bottom-right fixed)
│           ├── ExceptionsPage
│           │   ├── useExceptions()
│           │   ├── Stats row (4 cards)
│           │   ├── Filter bar
│           │   └── ExceptionCard list (with resolve flow)
│           └── SettingsPage
│               ├── useAuthStore.user
│               ├── Profile card
│               ├── Permissions grid
│               └── Role matrix (Admin only)
```

### 13.5 logistics1 Memoization & Performance Patterns

| Pattern | Where Used | Why |
|---------|-----------|-----|
| `memo(Component)` | StatusBadge, PriorityBadge, OrderRow, OrderTimeline, MiniTimeline, OrderFilters, VirtualizedOrderList | Prevents re-render when parent re-renders but props haven't changed |
| Custom `areEqual` in `memo` | OrderRow | Only re-renders if `order.id`, `order.status`, `order.updatedAt`, `isSelected`, or `style.top` change. Ignores other order fields → huge perf win in virtualized list |
| `useCallback` for handlers | Every page component | Prevents handler recreation → prevents child re-render (especially important for list items) |
| `useMemo` for debounce | OrderFilters | Creates debounced search function once, not on every render |
| `Map<string, T>` stores | ordersStore, agentsStore | O(1) lookups instead of array.find() — critical at 10K items |
| `useVirtualizer` | VirtualizedOrderList | Only renders visible rows (~20 out of 10K), 64px row height estimate, 20 items overscan |
| `useRef` for subscriptions | useOrders, useAgents | Stores unsubscribe function without causing re-renders |
| `subscribeWithSelector` | (potential) | Zustand middleware for selecting specific store slices to listen to |

**The agent MUST preserve these patterns.** They're not optional — they're essential for the app to feel responsive, especially with the virtualized order list.

### 13.6 Logistics/Next.js Design Patterns Worth Adapting

#### Recharts Pattern (from Analytics.tsx, 456 lines)
```
Structure:
1. Mock data arrays with Zod validation
2. Computed aggregates: totalSales, totalRevenue, avgOrderValue
3. CustomTooltip component (inline, receives {active, payload, label})
4. Tabs component switching between chart types (Sales/Revenue/Categories)
5. Each tab: Card → CardHeader → CardContent → ResponsiveContainer → Chart

Specific charts:
- BarChart: data, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar(s)
- LineChart: same structure, Line with strokeWidth=2, dot={r:4}, activeDot={r:6}
- PieChart: Pie with labelLine=false, Cell per data item with custom colors, outerRadius=120

For DTEx light theme:
- CartesianGrid: stroke="#e2e8f0" (was "#333")
- XAxis/YAxis: stroke="#94a3b8" (was "#888")
- Bar fill: "#F97316" (orange), "#2563EB" (blue) instead of "#22c55e"+"#10b981"
- Line stroke: "#F97316" (orange)
- PieChart colors: ['#F97316', '#2563EB', '#22C55E', '#8B5CF6', '#EC4899']
- Tooltip bg: "bg-white shadow-lg border border-slate-200" (was bg-[#1A1A1A])
```

#### Profile Form Pattern (from Profile.tsx, 491 lines)
```
State management:
- isEditing: boolean (toggle between view/edit modes)
- isSaving: boolean (disable button, show spinner during save)
- showSavedMessage: boolean (temporary success indicator)

Form pattern:
- 2-column grid of Input fields
- Each Input: disabled={!isEditing}
- Conditional classes: isEditing ? 'border-gray-700' : 'border-transparent'
- Save button appears only in edit mode (with AnimatePresence)
- Cancel button reverts state

For DTEx: Strip NextAuth session, strip image upload (no API), keep form pattern structure.
```

#### Sidebar Pattern (from Logistics pages — repeated in every component)
```
ANTI-PATTERN to avoid: Logistics Next.js repeats the full sidebar markup in every page component
(Analytics.tsx, Orders.tsx, Profile.tsx all have <aside> with nav links duplicated).
Our approach: Single Sidebar.tsx component in DashboardLayout.tsx, never repeated.
```

### 13.7 Design Decisions Log

| Decision | Chosen Approach | Rationale |
|----------|----------------|-----------|
| Theme | **LIGHT ONLY** | User requirement — bright, clean, professional. No dark mode. |
| JWT storage | localStorage | Simple, not production — keep it straightforward |
| State management | Zustand + TanStack Query | From logistics1 — lightweight, proven |
| Refresh token | No auto-refresh interceptor | Keep simple, re-login if expired |
| Optimistic updates | No — wait for server | State transitions are business-critical |
| Pagination | Client-side for now | Small dataset, no server pagination yet |
| Real-time scope | Tracking page only | Reduce memory, simpler lifecycle |
| WebSocket | Auto-subscribe on page load | No manual subscribe/unsubscribe UI |
| Dashboard refresh | Manual only | No auto-polling |
| Revenue charts | Line + circular (pie) | Per user preference |
| Date display | Both US + China timezone | Pacific shipping focus |
| Currency | CNY + USD | Dual currency formatting |
| Invalid state buttons | Disabled (not hidden) | User sees what's possible but locked |
| Cancel confirmation | Yes — modal dialog | Destructive action guard |
| Login redirect | Role-based | Admin→Dashboard, Driver→Orders |
| Role overlap | No — single role per user | Simple enum, no array roles |
| i18n | English UI, Chinese data supported | Not multilingual, but UTF-8 ready |
| Notifications | Toast only (sonner) | No notification center, no badge counter |
| Map tiles | CARTO Positron (light) preferred | Matches light theme; dark-matter optional for contrast |
| Sidebar | White bg, not dark | Consistent with overall light theme |

### 13.8 API Contract Alignment — Backend Response Shapes

> Reference: `api-reference.md` in workspace root

**Every API response is wrapped:**
```ts
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  correlationId?: string;
}
```

**Key endpoint response shapes the agent needs to know:**

```ts
// POST /api/auth/login → ApiResponse<LoginResponse>
LoginResponse { token: string; user: { id, username, email, role, fullName } }

// GET /api/orders → ApiResponse<Order[]>
Order { id, orderNumber, customerId, customerName, origin: Address, destination: Address,
        items: OrderItem[], status: 'Created'|'Confirmed'|'Shipped'|'Delivered'|'Cancelled',
        totalWeight, totalAmount, currency, serviceLevel, carrierId, trackingNumber,
        estimatedDelivery, createdAt, updatedAt }

// GET /api/dashboard/summary → ApiResponse<DashboardSummary>
DashboardSummary { totalOrders, totalRevenue, ordersInTransit, ordersDeliveredToday,
                   statusDistribution: { status: string, count: number }[],
                   recentOrders: Order[] }

// GET /api/carriers → ApiResponse<Carrier[]>
Carrier { code, name, services: string[], rating, priceRange: { min, max, currency } }

// POST /api/routing/compare → ApiResponse<RouteComparison>
RouteComparison { origin, destination, strategies: RouteResult[] }
RouteResult { strategy, carrier, cost, estimatedDays, distance, route: Coordinate[] }
```

**Status enum mismatch — CRITICAL:**
- logistics1 uses: `created, packed, shipped, out_for_delivery, delivered, failed`
- Our API uses: `Created, Confirmed, Shipped, Delivered, Cancelled`
- DTEx must use OUR API's values everywhere
- The timeline steps become: Created → Confirmed → Shipped → Delivered (4 steps, not 5)
- "failed" concept → "Cancelled" in our API

---

## 14. Development Agent Quick Reference

### Before Starting Any File

1. Check Section 9 for the correct DTEx light color
2. Check the Global Color Remapping table for dark→light translation
3. Check Section 13 for the source file's architecture details
4. Check Section 12 for specific adaptation notes per file

### Color Decision Flowchart

```
Is it a background?
├── Page bg → bg-slate-100
├── Card/Surface bg → bg-white
├── Nested area bg → bg-slate-50
├── Input bg → bg-white + border-slate-300
└── Active/selected bg → bg-orange-50

Is it text?
├── Heading → text-slate-900
├── Body → text-slate-700
├── Label/caption → text-slate-500
├── Muted/disabled → text-slate-400
├── Accent/highlight → text-orange-500 (order numbers, amounts)
└── Link → text-blue-600

Is it a border?
├── Card border → border-slate-200
├── Divider → border-slate-200
├── Input border → border-slate-300
├── Active border → border-orange-500
└── Error border → border-red-500

Is it interactive?
├── Primary button → bg-orange-500 text-white
├── Secondary button → bg-slate-100 text-slate-700
├── Hover → bg-slate-100 (most elements)
├── Active nav → bg-orange-50 text-orange-600
└── Focus → ring-orange-500
```

### File Creation Order (Dependency-Safe)

```
Layer 1: Foundation (no deps on each other)
  lib/utils/cn.ts
  types/*.ts
  lib/constants/*.ts

Layer 2: Infrastructure (depends on Layer 1)
  stores/authStore.ts
  stores/uiStore.ts
  stores/ordersStore.ts
  stores/agentsStore.ts
  lib/api/index.ts (base axios)

Layer 3: API Layer (depends on Layer 1 + 2)
  lib/api/auth.ts
  lib/api/orders.ts
  lib/api/carriers.ts
  lib/api/tracking.ts
  lib/api/dashboard.ts
  services/mockApi.ts

Layer 4: UI Components (depends on Layer 1)
  components/ui/Button.tsx
  components/ui/Card.tsx
  components/ui/Input.tsx
  components/ui/StatusBadge.tsx
  components/ui/Spinner.tsx
  components/ui/Toast.tsx

Layer 5: Hooks (depends on Layer 2 + 3)
  hooks/useAuth.ts
  hooks/useOrders.ts
  hooks/useTracking.ts
  hooks/useDashboard.ts

Layer 6: Layout (depends on Layer 4 + 5)
  components/layout/DashboardLayout.tsx
  components/layout/Sidebar.tsx
  components/layout/DashboardHeader.tsx

Layer 7: Feature Components (depends on Layer 4 + 5)
  components/orders/OrderFilters.tsx
  components/orders/OrderRow.tsx
  components/orders/OrderTimeline.tsx
  components/orders/VirtualizedOrderList.tsx
  components/tracking/InteractiveMap.tsx
  components/dashboard/StatCard.tsx

Layer 8: Pages (depends on everything)
  app/auth/LoginPage.tsx
  app/dashboard/DashboardPage.tsx
  app/orders/OrdersPage.tsx
  app/orders/OrderDetailPage.tsx
  app/tracking/TrackingPage.tsx
  ...etc

Layer 9: Patterns (depends on Layer 1 + 2, wire into Layer 5 + 8)
  lib/patterns/state/OrderStateMachine.ts
  lib/patterns/observer/TrackingObserver.ts
  lib/patterns/decorator/AuditDecorator.ts
  lib/patterns/strategy/*.ts
  lib/patterns/factory/CarrierFactory.ts
```

---

## Summary — Development Priority Order

```
Week 1:                                    Week 2:
┌──────────────────────────────────────┐  ┌──────────────────────────────────────┐
│ Day 1-2: FOUNDATION                  │  │ Day 8-9: CARRIERS + ROUTING          │
│ • Install deps                       │  │ • Carriers page + factory pattern    │
│ • Tailwind theme (LIGHT)             │  │ • Route calculator + strategy pattern│
│ • Types + constants                  │  │ • Quote comparison UI                │
│ • UI components (all light)          │  │                                      │
│ • API layer + stores                 │  │ Day 10-11: REPORTS + EXTRAS          │
│ • Mock data service                  │  │ • Reports page + CSV                 │
│                                      │  │ • Settings page + profile            │
│ Day 3-4: AUTH + LAYOUT               │  │ • Design patterns implementation     │
│ • Login page (white card, orange CTA)│  │                                      │
│ • Dashboard layout (white sidebar)   │  │ Day 12-13: POLISH                    │
│ • Sidebar + Header (all light)       │  │ • Exceptions page                    │
│ • Route protection                   │  │ • Animations (framer-motion)         │
│                                      │  │ • Loading skeletons                  │
│ Day 5-6: DASHBOARD + ORDERS          │  │ • Error handling + empty states      │
│ • Dashboard (role-based, white cards)│  │                                      │
│ • Orders list + filters              │  │ Day 14: FINAL POLISH                 │
│ • Order detail + timeline            │  │ • Responsive fixes                   │
│ • Create order form                  │  │ • Branding final check               │
│                                      │  │ • 404 page                           │
│ Day 7: TRACKING                      │  │ • Accessibility pass                 │
│ • MapLibre map (light or dark tiles) │  │                                      │
│ • Agent markers + popups             │  │                                      │
│ • Real-time subscription             │  │                                      │
└──────────────────────────────────────┘  └──────────────────────────────────────┘
```

---

## Quick Reference — API Endpoints Mapped to Pages

| Page | Endpoints Used |
|------|----------------|
| Login | `POST /api/auth/login` |
| Dashboard | `GET /api/dashboard/summary`, `GET /api/dashboard/trends`, `GET /api/dashboard/top-customers` |
| Orders List | `GET /api/orders` (with query filters) |
| Order Detail | `GET /api/orders/:id`, `POST /api/orders/:id/confirm`, `POST /api/orders/:id/ship`, `POST /api/orders/:id/deliver`, `POST /api/orders/:id/cancel` |
| Create Order | `POST /api/orders` |
| Tracking | `GET /api/tracking/:trackingNo`, SignalR hub `TrackingHub` |
| Carriers | `GET /api/carriers`, `GET /api/carriers/:code`, `POST /api/carriers/:code/quote`, `POST /api/carriers/:code/book` |
| Routing | `POST /api/routing/calculate`, `POST /api/routing/compare`, `GET /api/routing/strategies` |
| Reports | `GET /api/reports/monthly-shipments`, `GET /api/reports/revenue-by-carrier` |
| Settings | (local store only — profile from auth response) |

---
