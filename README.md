# G1 — הגשת זמינות שבועית

Standalone employee availability submission UI (Hebrew, RTL). Built with Next.js App Router, TypeScript, Tailwind CSS, Lucide icons, and Framer Motion. State persists in `localStorage`.

## Features

- Interactive 7×3 weekly availability grid (available / unavailable / unset)
- Bulk actions with undo
- Live summary and completion progress
- Week navigation, draft save, and submission confirmation flow
- Responsive desktop, tablet, and mobile layouts
- Demo data + reset action

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Windows note:** This project folder path contains `&`. Scripts call the Next.js binary via `node ./node_modules/next/dist/bin/next` so `npm run dev` / `npm run build` work reliably.

## Production build

```bash
npm run build
npm start
```

## Deploy to Vercel

### Option A — Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts. No environment variables are required.

### Option B — GitHub import

1. Push this repository to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new).
3. Import the repository.
4. Framework preset: **Next.js** (auto-detected).
5. Leave Environment Variables empty.
6. Click **Deploy**.

## Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Lucide React
- Framer Motion
- date-fns
- LocalStorage persistence
