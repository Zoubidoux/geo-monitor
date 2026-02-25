# GEO Monitor

Track your brand's visibility across AI assistants (ChatGPT, Claude, Gemini, Perplexity).

## Stack

- **Next.js 14** App Router (TypeScript)
- **Supabase** — auth, database, RLS
- **OpenAI + Anthropic** — LLM querying
- **Vercel** — hosting + cron jobs

## Features

- Create projects for any brand/domain
- Add monitoring prompts (or auto-generate with Claude)
- Run prompts across multiple AI providers
- Track mention rate, citation rate, sentiment, share of voice
- Scheduled runs every 6 hours via Vercel Cron

## Setup

1. Clone the repo
2. Copy `.env.local.example` → `.env.local` and fill in your keys
3. Run the Supabase migration: `supabase/migrations/001_init.sql`
4. `npm install && npm run dev`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `OPENAI_API_KEY` | OpenAI API key |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `CRON_SECRET` | Secret to authenticate Vercel Cron requests |

## Project Structure

```
app/
  api/
    projects/          → CRUD for projects
    runs/              → Trigger LLM runs + scoring
    cron/run-scheduled → Vercel Cron handler
  auth/                → Login, signup, callback
  dashboard/           → Projects list
  projects/
    new/               → Create project form
    [id]/              → Project detail + KPIs
lib/
  supabase/            → Client + server Supabase helpers
  llm/                 → OpenAI + Anthropic clients
  parsing/             → Mention, citation, sentiment analysis
  crawler/             → Domain crawler (sitemap + pages)
supabase/
  migrations/          → DB schema
```
