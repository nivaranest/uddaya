# Uddaya

**Rise. Achieve. Succeed.** AI-powered job matching for India's tech hiring market. Candidates get semantic job matches, "why you match" explanations and AI mock interviews. Recruiters get a hiring pipeline and AI-assisted job posts.

- Product requirements: [`docs/PRD.md`](docs/PRD.md)
- Design prototypes (open the `.dc.html` files in a browser): [`docs/design/`](docs/design)

## Status

This is the **foundation (PRD Phase 1)** plus the full front end from the design follow-up:

| Area | State |
|---|---|
| All 8 designed screens, responsive to phone width | ✅ Built (Next.js + Tailwind) |
| Mock interview feedback via Claude (PRD §9.2 #4) | ✅ `POST /api/ai/interview-feedback` |
| Job-post AI assist: description + questions (PRD §5.2.3) | ✅ `POST /api/ai/job-assist` |
| AI skill suggestions for job posts | ✅ `POST /api/ai/suggest-skills` |
| Keyword "why you match" fallback (PRD §13) | ✅ `lib/matching.ts` |
| Database schema + initial migration (PRD §7) | ✅ `prisma/` |
| CI (lint, typecheck, tests, build, migrate) | ✅ `.github/workflows/ci.yml` |
| Auth (email + LinkedIn OAuth), persistence, S3 uploads | ⏳ Next. The UI runs on seed data in `lib/data.ts` |
| Semantic matching (Claude + Pinecone), Elasticsearch search | ⏳ Phase 2 |
| Razorpay, SendGrid, WebSocket alerts, admin | ⏳ Phase 2–3 |

Interactions that need a backend (saving, applying, messaging, drag-and-drop between stages) work in the browser but are not persisted yet.

## Getting started

Requires Node 18.17+.

```bash
npm install
cp .env.example .env.local   # optionally add ANTHROPIC_API_KEY
npm run dev                  # http://localhost:3000
```

Without `ANTHROPIC_API_KEY` the AI routes still work: interview answers are scored by an offline heuristic (labelled "offline estimate" in the UI) and job posts get a template description. Set the key to use Claude.

### Routes

| Path | Screen |
|---|---|
| `/` | Landing page |
| `/dashboard` | Candidate dashboard (`?q=` filters jobs) |
| `/jobs/[id]` | Job detail with match explanation (`?apply=1` opens the apply dialog) |
| `/applications` | Application tracker (Kanban; drag or ←/→ keys) |
| `/interview?job=[id]` | AI mock interview |
| `/profile` | Candidate profile (view/edit) |
| `/recruiter` | Recruiter dashboard |
| `/recruiter/jobs/new` | 5-step job posting with AI assist |

### Database

```bash
# with PostgreSQL running and DATABASE_URL set
npx prisma migrate deploy
```

`prisma/schema.prisma` follows PRD §7 with a few fixes needed for PostgreSQL. The comment at the top of the schema lists them. The full-text search indexes are raw SQL at the end of the initial migration.

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint (next/core-web-vitals) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Jest: domain logic and API routes |

## Project layout

```
app/                 Next.js App Router pages; each screen has a server page.tsx + *-client.tsx
  api/ai/            Claude-backed routes (validated with zod, offline fallbacks)
components/          Shared UI: Icon, Logo, Sidebar, Dropdown, Modal, Toast, ProgressRing
lib/
  ai.ts              Claude client (server-only): structured outputs + refusal fallbacks
  data.ts            Seed data standing in for the API
  matching.ts        Match explanation, keyword score, candidate-pool estimate
  profile.ts         Profile completeness scoring
  interview.ts       Feedback schema + offline grader
  posting.ts         Posting plans and promo codes
prisma/              Schema and migrations
docs/                PRD and design prototypes
```

### Design tokens

Colours come from the prototypes and live in `tailwind.config.ts`: `bronze`, `sand`, `mint`, `forest`, `line`, and others. Neutral text colours map exactly onto Tailwind's `gray` scale. Fonts are Poppins (display) and Inter (body). Icons are Material Symbols Rounded, rendered with `<Icon name="…" />`.

### AI integration

All Claude calls go through `structuredCompletion()` in `lib/ai.ts`:

- It uses model `claude-opus-5-5` with structured outputs (`betaZodOutputFormat`), so responses are validated against a zod schema.
- It enables server-side refusal fallbacks (`fallbacks: "default"`).
- It runs server-side only. The API key never reaches the browser.
- User-supplied text (interview answers, recruiter notes) is passed as delimited data, not instructions.
