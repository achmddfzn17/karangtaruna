# Product Overview

This is a **Karang Taruna** community organization management platform — a web application for managing a Indonesian youth social organization (Karang Taruna).

## Core Purpose

Provides three distinct portals:
- **Public website** — landing page with news, articles, programs, gallery, and activity info for the general public
- **Admin dashboard** — full management interface for admins/super-admins to manage members, activities, finances, content, and more
- **Member portal** — authenticated area for registered members to view activities, finances, submit aspirations, and participate in voting

## Key Modules

- **Anggota (Members)** — member registration, profiles, status tracking (Aktif/Non-Aktif/Alumni)
- **Kegiatan (Activities)** — event management with attendance tracking
- **Program** — organizational programs/initiatives
- **Berita & Artikel** — news and article content management with rich text editor
- **Galeri** — photo/video gallery linked to activities, stored in Supabase Storage
- **Keuangan (Finance)** — income/expense transaction tracking with categories
- **Aspirasi** — member feedback/aspiration submission system
- **Voting/Polling** — e-voting system for members
- **SUS Survey** — System Usability Scale survey for UX evaluation
- **Notifikasi** — in-app notification system

## User Roles

- `SUPER_ADMIN` — full access
- `ADMIN` — dashboard access
- `ANGGOTA` — member portal access only

## Language

The UI and domain language is **Indonesian** (Bahasa Indonesia). Variable names, field names, and database columns use Indonesian terms (e.g., `namaLengkap`, `tanggalLahir`, `jenisKelamin`).
