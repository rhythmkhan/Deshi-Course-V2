<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and Deploy

This app is ready for local development and Vercel deployment.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

## Vercel Deploy

Set these Environment Variables in Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `ZINIPAY_API_KEY`
- `NEXT_PUBLIC_SITE_URL`

Optional:

- `APP_URL`

Notes:

- Set `NEXT_PUBLIC_SITE_URL` to your production domain, for example `https://deshicourse.xyz`
- On Vercel preview deployments the app now falls back to the request host automatically for auth and payment redirects
- `.vercelignore` excludes local logs, build artifacts, and private env files from upload
