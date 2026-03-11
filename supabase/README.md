Run these SQL files in order inside the Supabase SQL Editor:

- `supabase/migrations/20260310_initial_schema.sql`
- `supabase/migrations/20260310_referrals.sql`
- `supabase/migrations/20260310_zinipay_orders.sql`

Auth dashboard settings:
- Site URL: `https://deshicourse.xyz`
- Additional Redirect URLs:
  - `http://localhost:3000/auth/callback`
  - `https://deshicourse.xyz/auth/callback`
  - `http://localhost:3000/update-password`
  - `https://deshicourse.xyz/update-password`

Google provider settings:
- Enable Google in Supabase Authentication -> Providers.
- Add your Google Client ID and Client Secret there.
- In Google Cloud Console, add the callback URL shown by Supabase, which is usually:
  `https://pqrliipfoahgwiyllbgb.supabase.co/auth/v1/callback`

Referral feature notes:
- Each user gets an auto-generated `referral_code`.
- Referred new users get one-time `10%` off on their first course purchase preview.
- The referrer gets `৳10` wallet credit for each successful referral.

ZiniPay setup:
- Add `ZINIPAY_API_KEY` in your env.
- In ZiniPay dashboard, set these URLs:
  - Success / Redirect URL: `https://deshicourse.xyz/payments/success`
  - Cancel URL: `https://deshicourse.xyz/payments/cancel`
  - Webhook URL: `https://deshicourse.xyz/api/payments/zinipay/webhook`
