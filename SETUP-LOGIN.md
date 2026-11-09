# Login setup (Supabase)

The app uses Supabase for email, Google, Microsoft and Apple login. Until the two
`NEXT_PUBLIC_SUPABASE_*` variables are set, the site runs without login (as before).

## 1. Create the project
1. https://supabase.com -> New project (free plan is fine).
2. Project Settings -> API: copy **Project URL** and the **anon / publishable key**.
3. Add to Vercel (Settings -> Environment Variables) and redeploy:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. Tell Supabase your site address
Authentication -> URL Configuration:
- **Site URL:** `https://dark-synapse.vercel.app` (your live domain)
- **Redirect URLs:** add `https://dark-synapse.vercel.app/auth/callback` and
  `http://localhost:3000/auth/callback`

## 3. Providers (Authentication -> Sign In / Providers)
Every provider shows a **Callback URL** like `https://<ref>.supabase.co/auth/v1/callback`.
Paste that into the provider's console.

- **Email:** on by default. "Confirm email" on = users click a link in their inbox before logging in.
- **Google:** Google Cloud Console -> APIs & Services -> Credentials -> OAuth client ID (Web).
  Authorized redirect URI = the Supabase callback URL. Paste Client ID + Secret into Supabase.
- **Microsoft (Azure):** Entra ID -> App registrations -> New (accounts in any directory + personal).
  Redirect URI (Web) = the Supabase callback URL. Create a client secret. Paste Application (client) ID,
  secret value and tenant URL (`https://login.microsoftonline.com/common`) into Supabase.
- **Facebook:** developers.facebook.com -> My Apps -> Create App (use case: "Authenticate and request data
  from users with Facebook Login"). Settings -> Basic: copy App ID and App Secret, add a Privacy Policy URL and
  set Category. Facebook Login -> Settings: Valid OAuth Redirect URIs = the Supabase callback URL.
  Paste App ID + App Secret into Supabase (Facebook provider). Switch the app from Development to Live to let anyone in.
