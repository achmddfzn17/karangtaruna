# Tech Stack

## Framework & Runtime
- **Next.js 16** (App Router) with **React 19**
- **TypeScript 5**
- Turbopack enabled for dev (`next dev` uses Turbopack by default)

## Database & ORM
- **PostgreSQL** via **Prisma 7** ORM
- Prisma uses the `@prisma/adapter-pg` driver adapter (connection pooling via `pg` Pool)
- Single `prisma` singleton exported from `src/lib/prisma.ts` — always import from there
- Schema lives in `prisma/schema.prisma`

## Authentication
- **NextAuth v5** (beta) with Credentials provider
- JWT session strategy (30-day expiry)
- Auth config split into two files:
  - `src/auth.config.ts` — edge-compatible config (no Node.js imports), used by middleware
  - `src/auth.ts` — full config with Prisma adapter and bcrypt password verification
- Role stored in JWT token and session: `SUPER_ADMIN`, `ADMIN`, `ANGGOTA`

## File Storage
- **Supabase Storage** for media uploads (photos, videos, thumbnails)
- Bucket name: `galeri`
- Client helpers in `src/lib/supabase.ts` — exports `supabase`, `supabaseAdmin`, `getPublicUrl()`

## Styling
- **Tailwind CSS v4** with `@tailwindcss/postcss`
- `clsx` + `tailwind-merge` via `cn()` utility in `src/lib/utils.ts` — always use `cn()` for conditional classes
- **Radix UI** primitives for accessible components (dialog, dropdown, select, tabs, etc.)
- **shadcn/ui**-style components in `src/components/ui/`
- **Framer Motion** for animations
- Dark mode support via `next-themes`

## Forms & Validation
- **React Hook Form** with **Zod** resolvers (`@hookform/resolvers`)
- Server Actions use `zod.safeParse()` for validation before DB operations

## State Management
- **Zustand 5** with `persist` middleware — store in `src/store/useAppStore.ts`
- Persisted key: `karang-taruna-app-store`

## Tables
- **TanStack Table v8** (`@tanstack/react-table`) — used via the shared `DataTable` component

## Rich Text
- **Tiptap** editor (with Image and Link extensions) — used for Berita/Artikel content

## Charts
- **Recharts** for dashboard analytics charts

## Export
- **jsPDF** + **jspdf-autotable** for PDF export
- **xlsx** for Excel export

## Date Utilities
- **date-fns** for date manipulation
- All date/currency formatting uses `id-ID` locale (Indonesian) — helpers in `src/lib/utils.ts`

## Notifications (UI)
- **Sonner** for toast notifications

---

## Common Commands

```bash
# Development server (Turbopack)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint
npm run lint

# Prisma — generate client after schema changes
npx prisma generate

# Prisma — push schema to DB (dev)
npx prisma db push

# Prisma — open Prisma Studio
npx prisma studio

# Prisma — run migrations
npx prisma migrate dev --name <migration-name>
```

## Environment Variables

Key variables (see `.env.example`):
- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET` — NextAuth secret
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-side only)
