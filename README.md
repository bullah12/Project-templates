# Project Templates — Shared Skill Library

One repo, four future projects, nine reusable **skills**. A skill is a
self-contained knowledge module (a `SKILL.md` plus optional helper
code/templates) capturing how we solve a problem — auth, payments, PDF
generation — the same way in every project. Projects are specified in
`PROJECT_SPEC.md` files that reference skills instead of re-explaining them.

## Repository Layout

```
.
├── README.md                      ← you are here
├── skills/                        ← shared, reusable knowledge modules
│   ├── auth/
│   │   ├── SKILL.md
│   │   └── templates/roles-matrix.example.md
│   ├── database-schema-design/
│   │   ├── SKILL.md
│   │   └── templates/migration.example.sql
│   ├── rest-api-design/SKILL.md
│   ├── file-storage-uploads/SKILL.md
│   ├── notifications-scheduling/SKILL.md
│   ├── payments-billing/SKILL.md
│   ├── pdf-document-generation/
│   │   ├── SKILL.md
│   │   └── templates/lease-agreement.template.html
│   ├── embeddings-similarity-search/SKILL.md
│   └── dashboard-ui-patterns/SKILL.md
└── projects/
    ├── ecommerce-platform/PROJECT_SPEC.md     ← Shopify-alternative (retail + wholesale)
    ├── trail-social-app/PROJECT_SPEC.md       ← AllTrails + social + recommendations
    ├── property-management/PROJECT_SPEC.md    ← multi-property landlord dashboard
    └── photo-dedupe-tool/PROJECT_SPEC.md      ← local near-duplicate photo finder
```

Each project's application code will live inside its `projects/<name>/`
folder next to its spec (as separate `api/`, `web/` subfolders or a small
monorepo per project — decided when the project starts).

## How Projects Reference Skills

- Every `SKILL.md` has frontmatter (`name`, `description`, `used-by`) and the
  same sections: Purpose, When to Use, Inputs, Outputs, Default Stack,
  patterns, Best Practices, Pitfalls, Used By.
- Every `PROJECT_SPEC.md` opens with a **Shared Skills Applied** table
  mapping each skill to its concrete use in that project. The spec only
  documents what is project-specific; anything general lives in the skill.
- When implementing (especially with an AI coding agent): load the project's
  spec **plus** the `SKILL.md` of every skill in its table before writing
  code. The skills are written to work as agent context — copy them into
  `.claude/skills/` or reference them directly.
- **Feedback loop:** if building a project teaches you something reusable,
  update the skill, not just the project. Skills are living documents.

## Skill → Project Matrix

| Skill | ecommerce | trail-social | property-mgmt | photo-dedupe |
|---|:-:|:-:|:-:|:-:|
| auth | ✅ | ✅ | ✅ | — |
| database-schema-design | ✅ | ✅ | ✅ | ✅ (SQLite variant) |
| rest-api-design | ✅ | ✅ | ✅ | (local UI only) |
| file-storage-uploads | ✅ | ✅ | ✅ | ✅ (local variant) |
| notifications-scheduling | ✅ | ✅ | ✅ | — |
| payments-billing | ✅ | — | phase 2 | — |
| pdf-document-generation | ✅ | — | ✅ | — |
| embeddings-similarity-search | — | phase 2 | — | ✅ (core) |
| dashboard-ui-patterns | ✅ | ✅ | ✅ | (review UI borrows) |

## Default Stack (used across all projects)

Chosen once so code, snippets, and muscle memory transfer between projects:

- **Backend:** Node.js 22 + TypeScript, Fastify, Zod validation
- **Database:** PostgreSQL 16, plain-SQL forward-only migrations, Drizzle/Kysely for queries
- **Frontend:** React 18 + TypeScript + Vite, shadcn/ui + Tailwind, TanStack Query/Table, react-hook-form
- **Jobs/notifications:** pg-boss (Postgres-backed queue), Resend/Postmark for email
- **Files:** S3-compatible storage (MinIO in dev), `sharp` for images
- **Payments:** Stripe
- **PDFs:** HTML + CSS rendered via headless Chromium

**Noted exception:** the photo-dedupe tool is Python end-to-end
(`open_clip`, `imagehash`, FastAPI, SQLite) because the image-ML ecosystem
lives there — see its spec and the embeddings skill.

## Setup

Nothing to install yet — this repo currently contains specs and skills only.
When a project starts:

1. Create `projects/<name>/api` (and `web` if applicable) per the default stack.
2. Add a `docker-compose.yml` in the project folder with Postgres 16 (+
   MinIO if the project uses file storage) for local dev.
3. Copy `skills/database-schema-design/templates/migration.example.sql`
   shape for your `db/migrations/0001_init.sql`.
4. Keep secrets in a git-ignored `.env` (Stripe test keys, storage creds,
   email API key); commit a `.env.example`.
5. Point your coding agent at the project's `PROJECT_SPEC.md` + referenced
   `SKILL.md` files and build phase 1 from the spec's phasing section.

## Recommended Build Order

Ordered so each project hardens skills the next one needs, and the hardest
project is never built on unproven foundations:

1. **property-management** — moderate scope, single user, low risk, but it
   exercises seven skills: auth (lightly), database, REST API, file storage,
   dashboard UI, notifications-scheduling (deeply), and pdf-document-generation
   (deeply). You finish with a proven app shell, job queue, and upload
   pipeline — and a genuinely useful tool.
2. **ecommerce-platform** — the biggest build. Every foundation it needs
   (auth with roles/approval, dashboard patterns, files, notifications) is
   now battle-tested; the genuinely new work is `payments-billing` at full
   depth plus catalog/inventory domain logic. Build retail first, wholesale
   second (per its spec phasing).
3. **photo-dedupe-tool** — standalone Python palate-cleanser that builds the
   `embeddings-similarity-search` skill for real (thresholds, clustering,
   review UX) with no infrastructure dependencies. Can also be slotted
   earlier as a quick win — nothing depends on it until step 4.
4. **trail-social-app** — reuses auth, API, files, notifications, dashboard
   from steps 1–2, and its phase-2 recommendation engine directly reuses the
   embedding experience (and code patterns) from step 3. Doing it last means
   the "embeddings upgrade path" in its spec is a known quantity, not a bet.

## Assumptions Made (flag if wrong)

- Single default currency per project (specs use GBP-flavored examples;
  property compliance defaults are UK-style and configurable).
- Web-first everywhere; no native mobile apps in v1.
- Postgres everywhere except the photo tool's SQLite.
- Wholesale and retail share one storefront/checkout in ecommerce.
- Property management is single-owner with no tenant portal in v1.
