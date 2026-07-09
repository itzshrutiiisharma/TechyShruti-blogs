# Blog backend — starter

Next.js 15 (App Router) + TypeScript backend for a personal blog: Postgres
via Prisma, Redis caching, NextAuth authentication, and Claude-powered
writing suggestions. The reader-facing UI isn't built yet — this is the
API layer everything else will sit on top of.

## 1. Prerequisites

- Node.js 18.18+ installed
- A free Postgres database — [neon.tech](https://neon.tech) or [supabase.com](https://supabase.com) both work
- A free Redis instance — [upstash.com](https://upstash.com) (use the **TCP/ioredis** connection string, not the REST URL)
- An Anthropic API key from [console.anthropic.com](https://console.anthropic.com)

## 2. Install

```bash
npm install
```

## 3. Environment variables

Copy the example file and fill in your real values:

```bash
cp .env.example .env
```

Generate a `NEXTAUTH_SECRET` with:

```bash
openssl rand -base64 32
```

## 4. Set up the database

```bash
npm run prisma:generate   # generates the typed Prisma client
npm run prisma:migrate    # creates the tables in your Postgres database
```

If you ever want to browse your data visually:

```bash
npm run prisma:studio
```

## 5. Run it

```bash
npm run dev
```

Visit `http://localhost:3000`. The homepage is a placeholder — the real
work happens through the API routes below.

## 6. Try the API

Register the first user (becomes admin automatically):

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Shruti","email":"you@example.com","password":"changeme123"}'
```

Sign in via `http://localhost:3000/api/auth/signin` (NextAuth's built-in
page) using that email/password, then you're authenticated for the routes
below (cookies handle the session automatically in a browser; for `curl`
testing you'd need to carry the session cookie).

| Method | Route | Who | What |
|---|---|---|---|
| POST | `/api/auth/register` | anyone | create an account |
| GET | `/api/posts?page=1` | anyone | list published posts (cached) |
| POST | `/api/posts` | admin | create a post |
| GET | `/api/posts/:id` | anyone | read a post (tracks a view) |
| PATCH | `/api/posts/:id` | admin | edit a post |
| DELETE | `/api/posts/:id` | admin | delete a post |
| GET | `/api/posts/:id/comments` | anyone | list comments |
| POST | `/api/posts/:id/comments` | logged in | add a comment |
| PUT | `/api/posts/:id/rating` | logged in | rate a post 1–5 |
| GET | `/api/dashboard/analytics` | admin | views, comments, ratings per post |
| POST | `/api/ai/suggest` | admin | get AI feedback on a draft |

## 7. What's already wired up

- **Caching (Redis)**: post lists and single posts are cached with a TTL,
  invalidated on writes. View counts live in Redis and get read straight
  into the dashboard — no extra Postgres writes on every page view.
- **Rate limiting**: comments and AI suggestion requests are throttled per
  user to prevent abuse.
- **Auth**: NextAuth with email/password (JWT sessions, no separate
  session table). First registered user is auto-promoted to admin.
- **AI suggestions**: `/api/ai/suggest` sends your draft to Claude and
  gets back structured, actionable feedback — wire this into an editor UI
  with a "review draft" button.
- **Config**: `src/config/site.config.ts` is the one file to edit for your
  site's name, tagline, socials, theme color, and feature flags.

## 8. What's next

This is backend only. Next steps, in order:
1. Build the reader-facing pages (`src/app/(public)/...`) — post feed, single post view, comment form, rating widget
2. Build the dashboard UI (`src/app/(dashboard)/...`) — post editor with the AI suggestions panel, analytics charts
3. Add a scheduled job to periodically flush Redis view counters into a `PostView` table if you want historical view data beyond the live count
4. Deploy: Vercel for the app, Neon/Supabase for Postgres, Upstash for Redis — all have free tiers
