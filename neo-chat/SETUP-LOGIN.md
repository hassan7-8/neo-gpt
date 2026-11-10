# Login setup (Supabase)

The app uses Supabase for email, Google and X (Twitter) login. Until the two
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
- **X (Twitter):** developer.x.com -> sign in -> Developer Portal -> Projects & Apps -> your app -> User authentication
  settings -> Set up. App permissions: Read. Type of app: Web App. Callback URI = the Supabase callback URL (Supabase ->
  Authentication -> Providers -> X). Website URL = your site. Save, then open "Keys and tokens" -> OAuth 2.0 Client ID and
  Client Secret and paste both into Supabase (X / Twitter (OAuth 2.0) provider), then Enable.

## Photo editing, profile pictures and saved chats (one-time SQL)

In Supabase open SQL Editor -> New query, paste the file, press Run:

1. `supabase/storage.sql` - photo uploads and profile pictures.
2. `supabase/chats.sql` - saved chats, search and share links.
