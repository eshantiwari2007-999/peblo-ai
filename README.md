# Peblo AI — Notes Workspace

![Peblo Hero Banner](https://via.placeholder.com/1200x600/0f172a/ffffff?text=Peblo+AI+Notes+Workspace)

Peblo is a modern, production-grade notes workspace powered by Next.js 16 and Google Gemini AI. It goes beyond simple markdown editors by intelligently reading your thoughts and extracting structure, summaries, and action items in real-time.

Designed with a premium, asymmetric UI and keyboard-first navigation, it demonstrates senior-level full-stack development, modern server actions, and robust API integrations.

## 🚀 Key Features

- **Intelligent Summarization**: Let Gemini AI condense long notes into bite-sized summaries.
- **Action Item Extraction**: AI automatically detects and extracts tasks from your unstructured text.
- **Real-Time Autosave**: Debounced React-based autosaving ensures no data is ever lost.
- **Command Palette**: Press `⌘K` (or `Ctrl+K`) to jump anywhere, create notes, or sign out without touching the mouse.
- **Production-Ready Security**: Fully authenticated via NextAuth, protected Server Actions, and strict Zod validation.
- **Performant Data Access**: Next.js Server Components combined with Prisma v7 and PostgreSQL.

## 🛠 Tech Stack

- **Frontend**: Next.js 16 (App Router), React, Tailwind CSS, Framer Motion, Zustand.
- **Backend**: Next.js Server Actions, NextAuth.js.
- **Database**: PostgreSQL (via Neon) managed by Prisma ORM v7 (`@prisma/adapter-pg`).
- **AI**: Google Gemini 1.5 Flash API.

## 📖 Recruiter & Demo Guide

If you are reviewing this project for a technical evaluation, follow this flow to experience the application exactly as intended:

### 1. The Welcome Experience
- **Landing Page**: Notice the staggered Framer Motion animations and the asymmetric layout. The UI avoids the "generic SaaS" look in favor of a handcrafted, premium aesthetic.
- **Authentication**: Navigate to `/register`. The split-screen design and secure bcrypt credential hashing demonstrate attention to both UX and backend security.

### 2. The Core Workspace
- **Dashboard**: Once logged in, observe the parallel data fetching architecture in action. The dashboard renders rapidly, showing recent activity and AI coverage analytics.
- **Command Palette**: Hit `Ctrl + K` (Windows) or `Cmd + K` (Mac). Use the keyboard arrows to select "New Note" and hit Enter.

### 3. The AI Integration
- **Editor**: Type a long, unstructured paragraph outlining a meeting or project idea (e.g., *"Meeting with design team. We need to update the hero section by Friday. Also, John needs to fix the database migration issue..."*).
- **Autosave**: Notice the "Saving..." indicator in the top-left. It debounces your input and saves silently in the background.
- **AI Assist**: Click the "AI Assist" button (or the Sparkles icon). Generate a summary, and then switch to the "Action Items" tab to watch Gemini perfectly extract your tasks.

## 💻 Local Development Setup

To run this project locally:

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/peblo-ai.git
   cd peblo-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory based on `.env.example`:
   ```env
   # PostgreSQL connection for runtime
   DIRECT_DATABASE_URL="postgres://user:password@host:port/db?sslmode=require"
   # Connection for Prisma CLI (migrations)
   DATABASE_URL="postgres://user:password@host:port/db?sslmode=require"
   
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="generate-a-secure-random-string"
   
   GEMINI_API_KEY="your-google-gemini-api-key"
   ```

4. **Start the Prisma Database Server**
   Prisma v7 uses a managed local database in development. You must start it and push the schema in a separate terminal:
   ```bash
   npx prisma dev
   ```
   *Leave this terminal running in the background.*

5. **Start the Next.js development server**
   In your main terminal, start the app:
   ```bash
   npm run dev
   ```

6. **Open the app**
   Navigate to `http://localhost:3000` in your browser.

## 🏛 Architecture

For a deep dive into the technical design, Server Actions pattern, and Prisma Driver Adapter implementation, please see the [ARCHITECTURE.md](./ARCHITECTURE.md) file.
