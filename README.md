# Kya Banau? 🍛

> "Aaj kya banau?" — AI-powered Indian meal suggestions personalised to your family's taste, region, and mood.

## Stack

| Layer | Tech |
|---|---|
| Frontend + Backend | Next.js 15 (App Router, TypeScript) |
| UI | Tailwind CSS v4 + shadcn-style components |
| Database | Supabase Postgres (service-role, no RLS) |
| AI | OpenAI `gpt-4o-mini` with Structured Outputs |
| Identity | Anonymous UUID device-id in localStorage |
| Validation | Zod on every API route |
| Deployment | Vercel |

## Getting Started

### 1. Clone and install

```bash
git clone <repo>
cd kya-banau
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in:
- `SUPABASE_URL` — your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — service role key (Settings → API)
- `OPENAI_API_KEY` — your OpenAI API key

### 3. Database migration

In your Supabase project, run `supabase/migrations/0001_init.sql` in the SQL editor, or use the Supabase CLI:

```bash
npx supabase db push
```

### 4. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
kya-banau/
├── app/
│   ├── layout.tsx               # Root layout with fonts, providers
│   ├── page.tsx                 # Landing page
│   ├── onboarding/page.tsx      # 3-step onboarding wizard
│   ├── home/page.tsx            # Core: pick meal type → suggest
│   ├── history/page.tsx         # 14-day history + manual log
│   ├── preferences/page.tsx     # Edit household preferences
│   └── api/
│       ├── household/route.ts   # GET/POST household
│       ├── suggestions/route.ts # POST → OpenAI → suggestions
│       └── meals/route.ts       # GET/POST meal history
├── components/
│   ├── ui/                      # Button, Input, Select, Toast...
│   ├── device-id-provider.tsx   # localStorage UUID + household init
│   ├── onboarding-wizard.tsx    # Multi-step form
│   ├── meal-type-picker.tsx     # Breakfast / Lunch / Dinner
│   ├── mood-chips.tsx           # Quick / Light / Healthy / Tasty...
│   ├── meal-suggestion-card.tsx # AI suggestion card with "I'll make this"
│   ├── chip-input.tsx           # Tag input with autocomplete
│   ├── spice-slider.tsx         # 1–5 spice level selector
│   └── skeleton.tsx             # Loading skeletons
├── lib/
│   ├── supabase.ts              # Lazy Supabase client
│   ├── openai.ts                # Lazy OpenAI client
│   ├── prompts.ts               # buildSuggestPrompt + JSON schema
│   ├── api-client.ts            # Client-side fetch helpers
│   ├── device-id.ts             # getOrCreateDeviceId()
│   ├── types.ts                 # Zod schemas + TS types
│   ├── utils.ts                 # cn() helper
│   └── use-toast.ts             # Toast state manager
└── supabase/
    └── migrations/0001_init.sql # households, meal_history, suggestions
```

## Deploy to Vercel

1. Push to GitHub and import in Vercel
2. Set environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY)
3. Deploy — it's a standard Next.js app, no special config needed

## How it works

- **No auth** — a UUID v4 is generated in localStorage on first visit and sent as `x-household-id` on every API call. This IS the household identity.
- **Memory** — the last 14 days of meal history is injected into every OpenAI prompt. The model is explicitly told not to repeat recent meals.
- **Rate limit** — 20 AI suggestion requests per device per day to keep costs under control.
- **Cost** — ~$0.0005 per suggestion call with gpt-4o-mini.
