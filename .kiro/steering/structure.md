# Project Structure

## Top-Level Layout

```
src/
├── app/                  # Next.js App Router pages
│   ├── (admin)/          # Admin dashboard (role: ADMIN, SUPER_ADMIN)
│   ├── (auth)/           # Login pages
│   ├── (public)/         # Public-facing website
│   ├── api/              # API route handlers
│   └── member/           # Member portal (role: ANGGOTA)
├── components/
│   ├── admin/            # Admin-specific components
│   ├── member/           # Member portal components
│   ├── public/           # Public website section components
│   ├── shared/           # Reusable cross-portal components
│   └── ui/               # Base UI primitives (shadcn/ui style)
├── lib/
│   ├── prisma.ts         # Prisma client singleton
│   ├── supabase.ts       # Supabase client + storage helpers
│   └── utils.ts          # cn(), formatDate(), formatCurrency(), slugify(), etc.
├── store/
│   └── useAppStore.ts    # Zustand global store (sidebar state, notifications)
├── types/
│   └── index.ts          # All shared TypeScript types and enums
├── contexts/
│   └── ThemeProvider.tsx # next-themes provider
├── auth.ts               # Full NextAuth config (Node.js, Prisma)
└── auth.config.ts        # Edge-compatible NextAuth config (middleware)
```

## Route Groups

| Route group | Path prefix | Auth guard | Roles |
|---|---|---|---|
| `(public)` | `/` | None | Public |
| `(auth)` | `/login`, `/anggota/login` | None | Public |
| `(admin)` | `/dashboard/...` | `src/app/(admin)/layout.tsx` | ADMIN, SUPER_ADMIN |
| `member` | `/member/...` | `src/app/member/layout.tsx` | ANGGOTA |

Auth guards are enforced in layout files using `auth()` from NextAuth, redirecting unauthorized users.

## Admin Dashboard Modules

Each module under `src/app/(admin)/dashboard/` follows this pattern:
```
{module}/
├── page.tsx          # List/index page (Server Component, fetches via Prisma directly)
├── actions.ts        # Server Actions (create, update, delete)
├── tambah/
│   └── page.tsx      # Add form page
└── edit/[id]/
    └── page.tsx      # Edit form page
```

## API Routes

Located in `src/app/api/`. Used for client-side data fetching (e.g., from member portal pages). Admin pages typically use Server Actions instead.

## Component Conventions

- `src/components/ui/` — low-level primitives (Button, Input, Card, etc.). Extend, don't duplicate.
- `src/components/shared/` — reusable higher-level components:
  - `DataTable` — TanStack Table wrapper with search, pagination, export
  - `RichTextEditor` — Tiptap wrapper
  - `ConfirmModal`, `FormModal`, `PageHeader`, `StatCard`, `StatusBadge`
- `src/components/public/` — one file per homepage section (HeroSection, BeritaSection, etc.)
- `src/components/admin/` — admin-specific widgets (charts, export buttons, delete buttons)

## Data Fetching Patterns

- **Admin pages**: Server Components that call `prisma` directly. `searchParams` used for filtering/search (URL-based, no client state).
- **Public pages**: Server Components with `export const revalidate = 60` for ISR.
- **Member portal**: Mix of Server Components and client-side fetch to `/api/` routes.
- **Mutations**: Always use Next.js Server Actions (`"use server"`) with `revalidatePath()` after writes.

## Key Conventions

- Always import `prisma` from `@/lib/prisma`, never instantiate directly.
- Always use `cn()` from `@/lib/utils` for className composition.
- All types are centralized in `src/types/index.ts` — add new types there.
- Slugs for Berita/Artikel are auto-generated from the title + timestamp suffix.
- Images/files are uploaded to Supabase Storage; only the public URL is stored in the DB.
- `"use client"` directive is only added when the component needs browser APIs, event handlers, or hooks. Prefer Server Components by default.
- Server Actions validate input with Zod before any DB operation, then call `revalidatePath()` and `redirect()`.
