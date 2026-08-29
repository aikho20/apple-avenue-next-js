# Apple Avenue — Premium Apple Marketplace

A premium, modern, mobile-first e-commerce platform for Apple devices and accessories — built with Next.js 14, TypeScript, Tailwind CSS and MongoDB.

**Apple Avenue** delivers a curated marketplace for iPhone, iPad, Mac, Apple Watch, AirPods and official accessories. Every device is authentic, warranty-backed and curated for customers who expect performance, clarity and premium service.

> Previous project name: `insta-buy-nextjs` (Shop Locally / Insta Buy) — fully rebranded to **Apple Avenue**.

---

## Brand Identity

- **Name:** Apple Avenue
- **Tagline:** Premium Apple, Perfected.
- **Positioning:** Trust · Premium Quality · Performance · Authenticity · Warranty Protection
- **Palette (premium / minimal):**
  - Primary (ink): `#111111` / `hsl(0 0% 7%)` — logo, primary CTAs
  - Accent (Apple blue): `#0071E3` / `hsl(211 100% 50%)` — links, highlights
  - Surface: `#F5F5F7` (Apple light gray), `#E8E8ED` hover, `#D2D2D7` borders
  - Text: `#1D1D1F` headings, `#6E6E73` secondary
- **Typography:** Inter (via `next/font`), tight tracking, clean whitespace

---

## Features (per AGENTS.md spec)

**Phase 1 — Core Store:** Homepage hero, catalog with 13 filters + 7 sorts, search (incl. natural language), product detail with variants/video/specs, cart, checkout (5-step), auth, orders, product/inventory management.

**Phase 2 — Experience:** Wishlist (price-drop / back-in-stock), Compare (2–4 devices), Phone Finder (guided recommendation with match %), Reviews (photo/video, verified), Promotions/Coupons, Store locator, Delivery tracking timeline.

**Phase 3 — Business:** Trade-In (configurable valuation), Warranty (IMEI/serial registration), Installment calculator, Customer management, Payment & Inventory analytics.

**Phase 4 — Analytics:** Sales dashboard (KPI cards, charts, best sellers, brand/price segment), Product/Customer/Funnel/Marketing analytics, event system (`product_view`, `add_to_cart`, `purchase` …).

**Phase 5 — AI (optional):** AI Phone Recommendation, AI Product Search (natural language → structured filters), insights — never invents specs.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS, `class-variance-authority`, `tailwind-merge`
- **UI:** Radix UI, shadcn/ui pattern, lucide-react
- **State:** Redux Toolkit + RTK Query (`store/`, `lib/config/`)
- **Auth:** NextAuth 4 + MongoDB/Mongoose, JWT (`jose`/`jsonwebtoken`)
- **DB:** MongoDB (Mongoose, Prisma adapter available)
- **Forms:** react-hook-form + zod
- **Charts:** recharts

---

## Getting Started

```bash
npm install
npm run dev
# open http://localhost:3000
```

### Environment

Copy `.env.example` → `.env` and set:

```
MONGODB_URI=mongodb+srv://...@apple-avenue.../apple-avenue-db
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
TOKEN_SECRET=
```

> If migrating from `insta-buy-db`, rename cluster/DB to `apple-avenue`.

### Scripts

```bash
npm run dev      # dev server
npm run build    # production build
npm run start    # start prod
npm run lint     # eslint
```

---

## Project Structure

```
app/                 # App Router — storefront, dashboard, account, auth
components/
  shared/            # header, footer, dashboard-layout, account-layout, seller-account
  ui/                # reusable design-system primitives (button, input, card …)
  forms/             # merchant-registration, login, register
lib/                 # utils, config (store/apiSlice)
store/               # Redux slices & RTK Query actions
hooks/               # useToggle etc.
utils/data/          # constants, DASHBOARD_MENU, geo data
public/              # imagery — replace with Apple hero/lifestyle assets
```

Follow AGENTS.md rules: reuse existing components/hooks/services, keep business logic out of presentation, strong typing (no `any`), reuse skeletons/loaders/empty/error states, test desktop + mobile.

---

## Design Principles

Storefront answers: *What phones do you sell? How much? Is it available? Which is best for me? Can I compare? How can I pay? When will I receive it? Is it covered by warranty?*

Admin answers: *How much did we sell? What’s selling? What’s running out? Which brands perform? Where are customers coming from/abandoning? Which products profit most?*

---

## Deployment

Optimized for Vercel. See [Next.js deployment docs](https://nextjs.org/docs/deployment).

---

## License

Private — Apple Avenue.
