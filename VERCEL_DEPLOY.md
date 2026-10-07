# Deploying to Vercel

This app is a TanStack Start (Vite + Nitro) project. The build auto-detects
Vercel and emits a native Vercel output bundle — no `vercel.json` needed.

## 1. Push the code to GitHub

From the Lovable editor: **Project settings → GitHub → Connect** and transfer
the repository to your GitHub account. (Or push manually.)

## 2. Import into Vercel

1. Vercel dashboard → **Add New → Project** → import the GitHub repo.
2. Framework preset: **Other** (or "Vite" — either works; the build is driven
   by `npm run build`).
3. Build command: `npm run build` (or `bun run build`)
4. Leave output directory empty — Nitro's `vercel` preset writes
   `.vercel/output` automatically.

## 3. Add environment variables

In **Vercel → Project → Settings → Environment Variables**, add everything
listed in `.env.example` for **Production** and **Preview**:

| Variable                | Where to get the value                       |
| ----------------------- | -------------------------------------------- |
| `LOVABLE_API_KEY`       | Ready-made values file (see chat attachment) |
| `GOOGLE_SHEETS_API_KEY` | Ready-made values file (see chat attachment) |
| `AZAD_SPREADSHEET_ID`   | Ready-made values file (see chat attachment) |
| `ROSHAN_SPREADSHEET_ID` | Ready-made values file (see chat attachment) |

All four values are pre-filled in the `env-vars.txt` file shared with you in
chat — copy them in, then delete that file.

All four are **server-only** — never prefix them with `VITE_`.

## 4. Deploy

Click **Deploy**. The app serves SSR pages + server functions from a Vercel
function, with static assets on the CDN. No extra routing config is required —
TanStack Router handles client-side navigation and full-page reloads.

## Notes

- The PWA manifest (`public/manifest.webmanifest`) and icons are served as
  static assets and are cached by the CDN.
- Google Sheets sync runs through server functions, so it works on Vercel
  exactly as on Lovable, as long as the env vars above are set.
- Backend secrets live only in Vercel env vars; nothing sensitive ships to the
  browser bundle.
