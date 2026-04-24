# DeshiCourse Web

DeshiCourse is a Next.js 15 application for the public marketing site, checkout and payment flows, member dashboard, and the in-app super admin console.

## Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase Auth + Postgres
- ZiniPay payment flow
- Nodemailer, Telegram, Google Sheets, Google Drive integrations

## Local Setup

### Requirements

- Node.js 20+
- npm
- Supabase project credentials

### Install

```bash
npm install
cp .env.example .env.local
```

Fill the required values in `.env.local` before starting the app.

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Useful Scripts

- `npm run dev` - start the local development server
- `npm run build` - run the production Next.js build
- `npm run build:isolated` - run a production build into `.next-build` without touching the active `.next` directory
- `npm run start` - start the standalone production build
- `npm run lint` - run ESLint
- `npm run lint:fix` - auto-fix lint issues where possible
- `npm run typecheck` - run TypeScript without emitting files
- `npm run clean` - remove local build/test artifacts
- `npm run test:e2e` - run Playwright end-to-end tests

## Environment Variables

Copy from [`.env.example`](./.env.example). The main groups are:

### Core app

- `NEXT_PUBLIC_SITE_URL`
- `APP_URL`
- `ADMIN_EMAIL_ALLOWLIST`

### Supabase

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `SUPABASE_MEDIA_BUCKET`

### Payments

- `ZINIPAY_API_KEY`

### Email

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

### Analytics

- `NEXT_PUBLIC_GTM_ID`
- `META_PIXEL_ID`
- `NEXT_PUBLIC_META_PIXEL_ID`
- `META_CAPI_ACCESS_TOKEN`
- `META_DATASET_QUALITY_ACCESS_TOKEN`

### Delivery / automations

- `APP_CRON_SECRET`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHANNEL_ID`
- `TELEGRAM_SUPPORT_GROUP_ID`
- `TELEGRAM_TEMPLATE_CHANNEL_ID`
- `TELEGRAM_VIBE_CHANNEL_ID`
- `TELEGRAM_VIBE_TEMPLATE_CHANNEL_ID`
- `TELEGRAM_VIBE_SUPPORT_GROUP_ID`

### Google integrations

- `GOOGLE_SHEETS_SPREADSHEET_ID`
- `GOOGLE_SHEETS_SHEET_NAME`
- `GOOGLE_SHEETS_CLIENT_EMAIL`
- `GOOGLE_SHEETS_PRIVATE_KEY`
- `GOOGLE_DRIVE_SERVICE_ACCOUNT_CLIENT_EMAIL`
- `GOOGLE_DRIVE_SERVICE_ACCOUNT_PRIVATE_KEY`

## Admin / Schema Setup

Run the Supabase migrations before using `/admin`:

1. [`supabase/migrations/20260405_admin_content_cms.sql`](./supabase/migrations/20260405_admin_content_cms.sql)
2. [`supabase/migrations/20260406_production_admin_console.sql`](./supabase/migrations/20260406_production_admin_console.sql)

After the migration:

1. Sign in with an email included in `ADMIN_EMAIL_ALLOWLIST`
2. Open `/admin`
3. Run the legacy content sync once

## Vercel Deployment

### Recommended settings

- Framework preset: `Next.js`
- Node.js version: `20.x`
- Install command: `npm install`
- Build command: `npm run build`

### Required Vercel env vars

At minimum:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `ZINIPAY_API_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `ADMIN_EMAIL_ALLOWLIST`

### Notes

- Preview deployments can safely derive the current host from request headers for redirects and metadata where needed.
- `.vercelignore` excludes local logs, temporary files, and private env files from uploads.
- If you use the delivery job processor route, trigger it from a scheduler with `Authorization: Bearer <APP_CRON_SECRET>`.

## Production Verification

Before pushing or deploying:

```bash
npm run lint
npm run typecheck
npm run build:isolated
```
