# AI-Assisted Development Workflow
## Peblo — AI Notes Workspace | Full Stack Developer Challenge

---

> **Disclosure:** AI tools were used as engineering assistance for architecture planning, implementation acceleration, debugging, optimization, and deployment support. Final integration, testing, deployment, and code refinement were manually verified at every stage of development.

---

## 1. Introduction

This document outlines the structured, iterative engineering process used to design, build, and deploy the Peblo AI Notes Workspace. AI assistance was leveraged as a productivity multiplier — not as a replacement for engineering judgment. Each prompt below represents a deliberate engineering decision, not a blind generation request.

**Project Stack:** Next.js 16 (App Router) · TypeScript · Prisma v7 · PostgreSQL · NextAuth.js · Google Gemini 1.5 Flash · Zustand · Framer Motion

---

## 2. Architecture Planning

**Objective:** Define a scalable, production-grade full-stack architecture before writing any code.

**Prompt Summary:**
> *"Design the system architecture for a production AI notes SaaS using Next.js App Router. The app needs authentication, note CRUD, AI summarization via Gemini, and public sharing. Define where server components, client components, server actions, and API routes should be used and why."*

**Why it was needed:** Before touching a single file, I needed a clear boundary between client/server responsibilities. App Router's dual-rendering model (RSC + Client Components) requires careful upfront planning to avoid hydration errors and unnecessary data waterfalls.

**Key Engineering Outcome:**
- Established that all database mutations would use **Server Actions** (not API routes) for type-safety and security.
- Defined a `(dashboard)` route group with a shared `layout.tsx` that performs a single auth check rather than repeating it per-page.
- Decided to use **Parallel Data Fetching** (`Promise.all`) in Server Components for dashboard analytics, eliminating sequential waterfall queries.

---

## 3. Database Design

**Objective:** Design a normalized PostgreSQL schema that supports all required features with zero over-engineering.

**Prompt Summary:**
> *"Design a Prisma schema for a notes application with users, notes, tags, AI usage tracking, activity logs, and public share tokens. The schema must enforce user ownership at the database level via foreign keys and avoid any orphaned records."*

**Why it was needed:** A poorly designed schema forces ugly application-layer hacks later. I wanted cascading deletes, proper indexing, and relational integrity handled by the database — not the ORM layer.

**Key Engineering Outcome:**
- `Note` model uses `onDelete: Cascade` on the `User` relation, ensuring no orphaned notes survive account deletion.
- `ShareToken` uses a UUID `token` field (not an auto-incremented ID) to prevent enumeration attacks on public sharing endpoints.
- `AiUsageLog` and `ActivityLog` models were added to power real, data-driven dashboard analytics rather than fake counters.

---

## 4. Frontend System Design

**Objective:** Build a premium, consistent UI system using a design token approach — spacing, typography, and color defined once in `globals.css`.

**Prompt Summary:**
> *"Set up a global CSS design system for a dark-mode SaaS app using CSS custom properties. Define semantic color tokens (background, foreground, card, border, muted, primary, destructive) that work with Tailwind's `bg-background`, `text-foreground` pattern. Inspired by Linear and Raycast."*

**Why it was needed:** Using Tailwind utility classes directly without design tokens creates visual inconsistency across pages as the project scales. By anchoring all colors to CSS variables, the entire UI can be themed by changing a single `:root` block.

**Key Engineering Outcome:**
- Implemented a dark-first design system with `--background: 240 10% 3.9%` and a `--primary` accent that applies consistently across all interactive states.
- Sidebar, editor, and dashboard all share the same `border-border`, `bg-card`, `text-muted-foreground` semantic tokens, creating a cohesive, non-generic visual language.

---

## 5. Backend & API Design

**Objective:** Implement secure, type-safe data mutation without the overhead of REST API routes for every operation.

**Prompt Summary:**
> *"Implement Server Actions for note creation, update, archive, restore, and delete in Next.js App Router. Each action must: verify the authenticated session, confirm ownership of the resource before mutation, log the activity, and call `revalidatePath` to keep the UI synchronized."*

**Why it was needed:** Using API routes (`/api/notes/[id]`) for standard CRUD in App Router is an anti-pattern. Server Actions colocate backend logic with the components that use it, eliminate fetch boilerplate, and are automatically protected from CSRF.

**Key Engineering Outcome:**
- All five note lifecycle Server Actions are defined in `src/actions/note-actions.ts` with a shared `requireAuth()` guard at the top of every function.
- Ownership is double-checked at the database query level (`where: { id, userId }`) so a user cannot archive or delete another user's note even if they guess the ID.
- `revalidatePath("/notes")` and `revalidatePath("/dashboard")` are called after every mutation, ensuring the Server Components re-render with fresh data.

---

## 6. Authentication Workflow

**Objective:** Implement a secure, production-grade credentials-based auth system with full session persistence.

**Prompt Summary:**
> *"Configure NextAuth.js with a custom CredentialsProvider using Prisma as the database adapter. The session strategy must be JWT. Passwords must be hashed with bcrypt. The session callback must expose the user ID so Server Components and Server Actions can identify the caller."*

**Why it was needed:** NextAuth defaults are not always production-safe. The `session.user.id` is not exposed by default — it must be explicitly added via a `session` callback. Without it, Server Actions have no way to identify who is making the request.

**Key Engineering Outcome:**
- `src/lib/auth.ts` contains the full NextAuth config with custom `authorize`, `jwt`, and `session` callbacks.
- The `session.user.id` field is typed via `src/types/next-auth.d.ts` module augmentation, giving full TypeScript safety in all downstream consumers.
- The `src/proxy.ts` Next.js Middleware enforces route protection at the network edge, redirecting unauthenticated requests before they ever reach a Server Component.

---

## 7. Notes Workspace Development

**Objective:** Build a fluid, autosaving note editor that feels like a native app rather than a form submission.

**Prompt Summary:**
> *"Build a client-side rich text editor component that autosaves to the database. Use Zustand to track unsaved changes locally. Debounce database writes by 1.5 seconds to avoid server saturation. Show a visible 'Saving...' / 'Saved' status indicator. The content area must be a `contentEditable` div, not a textarea."*

**Why it was needed:** Naive implementations call the server on every keystroke, causing race conditions and poor UX. Debouncing through a Zustand store decouples the UI state from the persistence layer cleanly.

**Key Engineering Outcome:**
- `src/store/use-editor-store.ts` manages `isDirty`, `isSaving`, and `lastSaved` state.
- The `useDebounce` hook in `src/hooks/use-debounce.ts` gates the `updateNoteAction` Server Action call to fire only 1.5 seconds after the user stops typing.
- Optimistic UI: the note title and content update instantly in the Zustand store while the database write happens silently in the background.

---

## 8. AI Integration Workflow

**Objective:** Integrate Google Gemini 1.5 Flash for note summarization, action item extraction, and title suggestion with guaranteed structured output.

**Prompt Summary:**
> *"Write three Gemini AI Server Actions: one to summarize a note, one to extract action items as a JSON array of strings, and one to suggest a concise title. Use Zod to validate the AI's response before returning it to the client. Handle API errors and empty-content edge cases gracefully."*

**Why it was needed:** Language model outputs are non-deterministic. Returning raw AI text to the frontend without validation creates runtime crashes when the model returns unexpected formats (e.g., a markdown list instead of a JSON array).

**Key Engineering Outcome:**
- `src/actions/ai-actions.ts` uses `gemini-1.5-flash` via `@google/generative-ai`.
- The action items prompt instructs Gemini to respond with `{"items": [...]}` and a Zod schema validates that shape before it ever touches the client.
- Every AI action writes a record to the `AiUsageLog` table, enabling the dashboard's "AI Actions" counter to reflect real usage data.

---

## 9. Search & Filtering

**Objective:** Implement performant, real-time client-side search with debouncing to avoid redundant renders.

**Prompt Summary:**
> *"Add a search bar to the Notes List page that filters notes by title and content in real time. Debounce the input by 300ms. The filtering logic must run client-side against a pre-fetched array to avoid a round-trip to the server on every keystroke."*

**Why it was needed:** Server-side search on every keystroke in a development environment causes noticeable lag from network latency. For a personal notes workspace with a reasonable number of notes, client-side filtering on a pre-fetched list is faster and simpler.

**Key Engineering Outcome:**
- `src/components/notes/notes-list.tsx` is a Client Component that receives all notes as a prop from the Server Component parent.
- The `useDebounce(searchQuery, 300)` hook gates the `filter()` call, eliminating redundant re-renders while the user is mid-typing.

---

## 10. Dashboard Analytics

**Objective:** Build a real-data analytics dashboard using efficient parallel database queries.

**Prompt Summary:**
> *"Build the dashboard page as a Next.js Server Component. Fetch total notes, archived notes, notes with AI summaries, total AI actions, recent activity logs, and recent notes simultaneously using Promise.all. Calculate AI coverage percentage server-side. Avoid any client-side data fetching."*

**Why it was needed:** Sequential database queries in a dashboard create a waterfall effect where each stat waits for the previous one to resolve. `Promise.all` resolves all six queries in parallel, making the dashboard load as fast as the slowest single query.

**Key Engineering Outcome:**
- Dashboard renders with six parallel Prisma queries completing in a single round-trip.
- All analytics (note counts, AI coverage %, activity feed) reflect live database state with no hardcoded values.
- A dedicated `loading.tsx` skeleton prevents layout shift while the Server Component fetches data.

---

## 11. Deployment & DevOps

**Objective:** Prepare the project for a professional, zero-downtime production deployment.

**Prompt Summary:**
> *"Prepare the Next.js App Router project using Prisma v7 Driver Adapters for Vercel deployment. The build command must run `prisma generate` before `next build`. Document the exact environment variables required for the production Neon PostgreSQL database. Ensure `.env` is gitignored and `.env.example` is committed."*

**Why it was needed:** Prisma v7's `@prisma/adapter-pg` requires `prisma generate` to run before the build to regenerate the client for the production environment. Skipping this step causes a `PrismaClient not found` error at runtime on Vercel.

**Key Engineering Outcome:**
- Production build command set to: `npx prisma generate && next build`
- `.env.example` documents all five required variables without exposing any secrets.
- The repository was initialized with a clean `git archive`-generated ZIP, ensuring no `node_modules`, `.next`, or `.env` files were ever committed.

---

## 12. Testing & QA

**Objective:** Perform a complete end-to-end audit to catch runtime errors, TypeScript issues, and client/server boundary violations before submission.

**Prompt Summary:**
> *"Audit all Server Actions for missing auth guards. Verify all client components using `useRouter`, `useState`, or `useEffect` have the `'use client'` directive. Check for any hydration mismatches caused by server/client rendering differences. Run `npx tsc --noEmit` and resolve all TypeScript errors."*

**Why it was needed:** TypeScript compilation errors in Next.js do not always block the dev server but will block `npm run build`. Catching them early prevents last-minute deployment failures.

**Key Engineering Outcome:**
- Build runs cleanly: `Exit code: 0`, zero TypeScript errors, zero ESLint warnings.
- All Server Actions confirmed to have `requireAuth()` at entry point.
- Mobile viewport configured with `maximumScale: 1` to prevent iOS Safari auto-zoom on form inputs.

---

## 13. Final Optimization

**Objective:** Polish the UX with premium micro-interactions and ensure the UI does not feel AI-generated or template-based.

**Prompt Summary:**
> *"Add keyboard shortcut support globally: Ctrl+N to create a new note, Ctrl+H to navigate to the dashboard, Ctrl+K to open the command palette. Wire the brand logo in the sidebar as a navigation link. Add a `useDashboardShortcuts` hook that is mounted once in the root dashboard layout."*

**Why it was needed:** Professional SaaS tools like Linear and Raycast are defined by their keyboard-first experience. Adding global shortcuts is a small engineering investment that dramatically elevates the product feel for technical users — exactly the audience evaluating this submission.

**Key Engineering Outcome:**
- `src/hooks/use-keyboard-shortcuts.ts` exports a composable `useKeyboardShortcuts(shortcuts)` primitive and a ready-to-use `useDashboardShortcuts()` hook.
- The Command Palette (`⌘K`) allows instant navigation without touching the mouse.
- The sidebar brand logo is a `<Link>` with a `group-hover:rotate-12` Tailwind animation — a subtle but deliberate detail that signals handcrafted quality.

---

*Document prepared by Eshan Tiwari | Full Stack Developer Challenge Submission*
