# Login setup (Supabase)

The app uses Supabase for email, Google and X login. Until the two
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
- **X (Twitter):** developer.x.com -> sign up (free plan) -> create a Project and App -> User authentication settings:
  turn on OAuth 2.0, type "Web App", Callback URI = the Supabase callback URL, Website URL = your site. Copy the
  Client ID and Client Secret into Supabase -> Authentication -> Providers -> X.