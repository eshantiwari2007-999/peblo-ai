# Architecture & Design Patterns

## Overview
Peblo is a modern, AI-powered notes workspace built with **Next.js 16 (App Router)**. It is designed to be a highly performant, type-safe, and visually polished SaaS application. The architecture prioritizes separation of concerns, rapid data mutation, and robust AI integration.

## Tech Stack
- **Framework**: Next.js 16 (React 19 RC)
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma v7 (with `@prisma/adapter-pg`)
- **Authentication**: NextAuth.js (Credentials Provider)
- **AI Integration**: Google Gemini 1.5 Flash API
- **Styling**: Tailwind CSS + Framer Motion
- **State Management**: Zustand (Client) + React Server Components
- **Validation**: Zod

## Core Architectural Patterns

### 1. Server Actions for Data Mutation
Instead of traditional API routes (`/api/...`), Peblo utilizes **Next.js Server Actions** (`src/actions/`) for handling data mutations. This approach provides:
- **End-to-End Type Safety**: Inputs and outputs are strictly typed without manual fetching layers.
- **Progressive Enhancement**: Forms can function even if JavaScript fails to load.
- **Built-in Revalidation**: Easy integration with `revalidatePath` to instantly update the UI.

### 2. Zod Validation & Error Handling
All incoming data (both from client forms and AI responses) is validated using **Zod** (`src/lib/validations/`).
- **Input Validation**: Ensures malicious or malformed data never reaches the database.
- **AI Parsing**: The Gemini API is instructed to return structured JSON, which is then parsed and validated via Zod to ensure the extracted action items and summaries perfectly match the expected schema before persisting.

### 3. Prisma Singleton & Connection Pooling
With the migration to Prisma v7, the application uses the **Driver Adapter pattern** (`@prisma/adapter-pg` + `pg`).
- `src/lib/prisma.ts` exports a singleton Prisma client.
- This ensures connection limits aren't exhausted during hot-reloads in development and utilizes standard `pg` pooling in production, bypassing the deprecated `directUrl` configurations.

### 4. Client/Server Component Segregation
- **Server Components (Default)**: Used for data fetching (e.g., `src/app/(dashboard)/dashboard/page.tsx`), reducing bundle size and improving SEO/initial load speed.
- **Client Components (`"use client"`)**: Strictly isolated to interactive islands like the `RichTextEditor`, `CommandPalette`, and `NotesList`.

### 5. Optimistic UI & Local State
The `RichTextEditor` uses **Zustand** (`src/store/use-editor-store.ts`) for managing local, ephemeral state (like "Saving..." vs "Saved" status).
- **Debounced Autosave**: Prevents spamming the server by debouncing user input and triggering a Server Action only after a period of inactivity.

## Directory Structure

```text
src/
├── actions/         # Next.js Server Actions (note-actions, ai-actions)
├── app/             # App Router pages and layouts
│   ├── (auth)/      # Login and Registration routes
│   ├── (dashboard)/ # Protected dashboard and workspace routes
│   └── api/         # NextAuth and public API endpoints
├── components/      # React components
│   ├── editor/      # Rich text editor and AI panel
│   ├── layout/      # Sidebar, modals, global UI
│   ├── notes/       # Note lists and cards
│   └── ui/          # Generic UI elements (Command Palette, Toasts)
├── hooks/           # Custom React hooks (useDebounce, useToast)
├── lib/             # Utility functions, Prisma client, NextAuth config
│   └── validations/ # Zod schemas
├── store/           # Zustand state stores
└── types/           # Global TypeScript definitions
```

## Security Posture
- **Authentication**: JWT-based session handling via NextAuth.
- **Authorization**: Ownership checks are strictly enforced in every Server Action (`userId === session.user.id`).
- **Security Headers**: Custom HTTP headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy) are configured in `next.config.ts`.
- **Password Hashing**: Bcrypt is used for credential storage.

## UI/UX Philosophy
The UI eschews generic SaaS templates in favor of a "crafted" aesthetic:
- **Asymmetric Layouts**: Split-screen auth and landing pages.
- **Micro-interactions**: Subtle Framer Motion animations on hover and mount.
- **Keyboard-First navigation**: Command Palette (`Ctrl+K`) for rapid task switching.
