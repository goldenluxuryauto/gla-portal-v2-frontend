# GLA Portal V2 — Frontend

**Golden Luxury Auto Portal V2** — A modern React SPA for luxury car fleet management. Features a dark-themed admin dashboard, client/owner portal, staff portal, public-facing pages, and comprehensive financial/operations tooling.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Build | Vite 5 |
| Framework | React 18 |
| Language | TypeScript 5.6 |
| Styling | Tailwind CSS 3 + tailwindcss-animate |
| UI Components | Radix UI primitives + shadcn/ui |
| Charts | Recharts 2 |
| Routing | Wouter 3 |
| Data Fetching | TanStack React Query 5 |
| Forms | React Hook Form + Zod validation |
| Calendar | FullCalendar 6 |
| PDF | pdf-lib, pdfjs-dist, react-pdf |
| Icons | Lucide React, React Icons |
| Animation | Framer Motion |
| E2E Testing | Playwright |

## Theme

- **Dark theme** throughout — dark grays, black backgrounds
- **GLA Gold**: `#D4A843` — primary accent color for buttons, highlights, active states
- **⚠️ NO BLUE** — all blue has been purged; gold/amber/gray/white only
- Tailwind custom colors: `gold-500: #D4A843`, `gold-400: #E0BC6A`, `gold-600: #B8902F`

## Features by Phase

### Phase 1 — Foundation
- Public landing page with hero, services, featured cars, CTA
- Admin login with session-based auth
- Responsive navbar and footer

### Phase 2 — Client Onboarding
- Multi-step onboarding form (public)
- Contract signing page with e-signature (SignatureCanvas)
- reCAPTCHA integration
- Signup and password reset flows

### Phase 3 — Fleet Management
- Car listing with photos, specs, status badges
- Car detail page with tabbed sections (earnings, expenses, depreciation, purchase, graphs, maintenance, records)
- Car onboarding/offboarding forms
- Photo management (upload, set main, delete)
- NADA depreciation tracking

### Phase 4 — Financial Core
- Income & expense tables per car per month (inline editable)
- Payment management (create, edit, search, receipt uploads)
- Payment calculator
- Payment status tracking
- Totals overview with aggregations
- Banking info management

### Phase 5 — Operations
- Operations dashboard (deliveries, cleanings, maintenance)
- Logistics tracking
- Task management
- Notification bell with real-time counts
- Maintenance module

### Phase 6 — HR & Payroll
- HR portal with employee management
- Employee onboarding form (public)
- Employee detail view (basic info, job, pay, family, emergency, documents)
- Rate history & employment history
- Work schedule calendar
- Payroll management

### Phase 7 — Client (Owner) Portal
- Owner dashboard with car stats
- Earnings view with charts
- Activity feed
- Document management
- Maintenance request submission
- Onboarding wizard for new owners

### Phase 8 — Intelligence
- Business intelligence dashboard
- Vehicle performance rankings
- Revenue analytics charts
- Guest/booking analytics
- Pricing insights & recommendations
- Fleet composition breakdown
- Seasonal pattern analysis

### Phase 9 — Calendar & Fleet Dashboard
- FullCalendar integration with trip events
- Fleet dashboard with vehicle cards
- Financials summary page
- Graphs & charts with Recharts

### Phase 10 — Polish
- Error boundaries (global + page-level)
- Loading skeletons
- PWA support (vite-plugin-pwa)
- Onboarding tutorial system
- Training manual pages
- QR code generation (qrcode.react)
- Excel export/import (xlsx)

## Setup

### Prerequisites

- Node.js 20+
- npm or yarn

### Environment Variables

Create a `.env` file:

```env
# Backend API URL (empty = use Vite proxy in dev, Vercel rewrites in prod)
VITE_API_URL=http://localhost:3000

# Optional
VITE_APP_NAME=GLA Management Portal
VITE_APP_VERSION=2.0.0
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
VITE_ENABLE_PWA=true
VITE_ENABLE_ANALYTICS=false
```

### Running Locally

```bash
npm install
npm run dev     # Starts on http://localhost:5173
```

### Building

```bash
npm run build   # Output to dist/
npm run preview # Preview production build
```

## Page / Route Reference

### Public Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Landing page — hero, services, featured cars, CTA |
| `/fleet` | Fleet | Browse available vehicles |
| `/onboarding` | Onboarding | Multi-step client onboarding form |
| `/contact` | Contact | Contact form |
| `/sign-contract/:token` | Sign Contract | E-signature contract signing |
| `/signup` | Signup | Account creation |
| `/reset-password` | Reset Password | Password reset flow |
| `/employee-form` | Employee Form | Employee onboarding form (public) |
| `/tutorial` | Training Manual | Client-facing training guide |

### Admin Pages

| Route | Page | Description |
|-------|------|-------------|
| `/admin/login` | Login | Admin authentication |
| `/dashboard` | Dashboard | Main admin dashboard — stats, quick links |
| `/admin/admins` | Admins | Manage admin users |
| `/admin/clients` | Clients | Client list & management |
| `/admin/clients/:id` | Client Detail | Individual client view |
| `/admin/forms` | Forms | Form submissions overview |
| `/cars` | Cars | Full car inventory |
| `/admin/view-car/:id` | View Car | Read-only car view |
| `/admin/cars/:id` | Car Detail | Car details with tabbed sub-pages |
| `/admin/cars/:id/earnings` | Earnings | Per-car earnings |
| `/admin/cars/:id/expenses` | Total Expenses | Per-car expenses |
| `/admin/cars/:id/depreciation` | NADA Depreciation | Depreciation tracking |
| `/admin/cars/:id/purchase` | Purchase Details | Purchase/acquisition info |
| `/admin/cars/:id/graphs` | Graphs & Charts | Visual analytics per car |
| `/admin/cars/:id/calculator` | Payment Calculator | Payment calculations |
| `/admin/cars/:id/maintenance` | Maintenance | Per-car maintenance |
| `/admin/cars/:id/totals` | Totals | Per-car totals |
| `/admin/cars/:id/records` | Records | Per-car record files |
| `/admin/cars/:id/payments` | Payments | Per-car payments |
| `/admin/cars/:id/income-expense` | Income/Expense | Per-car I/E table |
| `/admin/cars/:id/income-expense/log` | I/E Log | Change history |
| `/admin/income-expenses` | Income/Expenses | All cars I/E view |
| `/admin/payments` | Payments Main | Payment management hub |
| `/admin/payment-status` | Payment Status | Payment status tracking |
| `/admin/totals/all` | All Totals | Aggregated totals |
| `/admin/totals-overview` | Totals Overview | Totals dashboard |
| `/admin/settings` | Settings | App settings, Slack config |
| `/admin/operations` | Operations | Operations dashboard |
| `/admin/logistics` | Logistics | Delivery tracking |
| `/admin/maintenance-module` | Maintenance | Maintenance module |
| `/admin/tasks` | Tasks | Task management |
| `/admin/car-rental-mgmt` | Car Rental | Rental management |
| `/admin/payroll-mgmt` | Payroll | Payroll management |
| `/admin/hr-portal` | HR Portal | HR overview |
| `/admin/hr` | Human Resources | HR module index |
| `/admin/hr/employees` | Employees | Employee list |
| `/admin/hr/employees/view` | Employee View | Employee detail |
| `/admin/hr/work-schedule` | Work Schedule | Work schedule calendar |
| `/admin/calendar` | Calendar | Trip calendar (FullCalendar) |
| `/admin/fleet-dashboard` | Fleet Dashboard | Fleet overview cards |
| `/admin/financials` | Financials | Financial summary |
| `/admin/intelligence` | Intelligence | BI dashboard |
| `/admin/training-manual` | Training Manual | Admin training guide |
| `/profile` | Profile | Current user profile |

### Staff Portal

| Route | Page | Description |
|-------|------|-------------|
| `/staff/dashboard` | Staff Dashboard | Staff home |
| `/staff/my-info` | My Info | Personal info sections |
| `/staff/my-info/:section` | Info Section | Specific info tab |
| `/staff/forms` | Forms | Staff forms |
| `/staff/task-management` | Tasks | Task list |
| `/staff/time` | Time | Time tracking |
| `/staff/time-off` | Time Off | Time off requests |
| `/staff/turo-guide` | Turo Guide | Turo platform guide |
| `/staff/training-manual` | Training | Staff training |
| `/staff/client-testimonials` | Testimonials | Client testimonials |
| `/staff/car-rental/trips` | Rental Trips | Rental trip log |
| `/staff/car-rental/forms` | Rental Forms | Car going out / coming back |
| `/staff/car-rental/forms/submit` | Submit Form | Submit rental form |

### Owner Portal

| Route | Page | Description |
|-------|------|-------------|
| `/owner/dashboard` | Dashboard | Owner overview with car stats |
| `/owner/earnings` | Earnings | Revenue charts & breakdowns |
| `/owner/activity` | Activity Feed | Recent activity |
| `/owner/documents` | Documents | Document management |
| `/owner/maintenance` | Maintenance | Maintenance requests |
| `/owner/onboarding` | Onboarding | Onboarding wizard |

## Deployment (Vercel)

The frontend deploys on **Vercel** with the `vercel.json` in the repo root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://your-render-backend.onrender.com/api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Required Environment Variables on Vercel

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend URL (e.g. `https://your-backend.onrender.com`) — or leave empty to use Vercel rewrites |
| `VITE_RECAPTCHA_SITE_KEY` | _(optional)_ Google reCAPTCHA v2 site key |
| `VITE_ENABLE_PWA` | `true` or `false` |

## Project Structure

```
src/
├── App.tsx                    # Router + providers
├── main.tsx                   # Entry point
├── index.css                  # Global styles + Tailwind
├── components/
│   ├── ui/                    # shadcn/ui primitives (57 components)
│   ├── home/                  # Landing page sections
│   │   ├── hero.tsx
│   │   ├── services.tsx
│   │   ├── featured-cars.tsx
│   │   └── cta-section.tsx
│   ├── layout/
│   │   ├── navbar.tsx
│   │   └── footer.tsx
│   ├── admin/
│   │   ├── auth-guard.tsx     # Protected route wrapper
│   │   ├── admin-layout.tsx   # Sidebar + header layout
│   │   ├── NotificationBell.tsx
│   │   └── QuickLinks.tsx
│   ├── contract/
│   │   └── ContractFormFiller.tsx
│   ├── forms/
│   │   ├── CarOnboardingForm.tsx
│   │   └── CarOffboardingForm.tsx
│   ├── modals/                # Shared modal components
│   ├── pdf-editor/
│   │   └── PDFEditor.tsx
│   ├── onboarding/
│   │   └── OnboardingTutorial.tsx
│   ├── ErrorBoundary.tsx
│   └── PageErrorBoundary.tsx
├── pages/
│   ├── home.tsx               # Public landing
│   ├── fleet.tsx              # Public fleet browse
│   ├── onboarding.tsx         # Client onboarding form
│   ├── contact.tsx            # Contact form
│   ├── signup.tsx             # Account signup
│   ├── sign-contract.tsx      # E-signature page
│   ├── reset-password.tsx
│   ├── employee-form.tsx      # Employee onboarding
│   ├── not-found.tsx
│   ├── admin/                 # Admin pages (40+ pages)
│   │   ├── dashboard.tsx
│   │   ├── login.tsx
│   │   ├── cars.tsx
│   │   ├── car-detail.tsx
│   │   ├── clients.tsx
│   │   ├── client-detail.tsx
│   │   ├── financials.tsx
│   │   ├── intelligence.tsx
│   │   ├── operations.tsx
│   │   ├── calendar.tsx
│   │   ├── fleet-dashboard.tsx
│   │   ├── income-expenses/   # Full I/E module with context, modals, components
│   │   ├── hr/               # HR sub-module
│   │   └── ...
│   ├── staff/                 # Staff portal pages
│   │   ├── dashboard.tsx
│   │   ├── my-info.tsx
│   │   ├── task-management.tsx
│   │   ├── car-rental/        # Car rental forms
│   │   └── ...
│   ├── owner/                 # Owner portal pages
│   │   ├── dashboard.tsx
│   │   ├── earnings.tsx
│   │   ├── activity-feed.tsx
│   │   ├── documents.tsx
│   │   ├── maintenance.tsx
│   │   └── onboarding-wizard.tsx
│   └── client/
│       └── training-manual.tsx
├── hooks/
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── lib/
│   ├── utils.ts               # cn() + utilities
│   ├── queryClient.ts         # TanStack Query config
│   ├── env.ts                 # Environment config
│   ├── api-error-handler.ts   # API error handling
│   ├── password-strength.ts   # Password validation
│   ├── pdf-config.ts          # PDF viewer config
│   ├── nadaDepreciationUtils.ts
│   ├── work-schedule-calendar.ts
│   └── onlineStatus.ts
└── types/
    ├── car.ts                 # Car type definitions
    ├── react-google-recaptcha.d.ts
    └── react-signature-canvas.d.ts
```

## License

Proprietary — Golden Luxury Auto LLC
# CI Status: All security vulnerabilities fixed ✅
