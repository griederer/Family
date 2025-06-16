# FamilyHub 👨‍👩‍👧‍👦

A modern family management application inspired by Things 3, built with Next.js 14 and Firebase.

## Features

- 📝 **Task Management** - Create, assign, and track family tasks
- 📅 **Smart Lists** - Today, This Week, Overdue, High Priority
- 👥 **Family Collaboration** - Multi-user support with role-based access
- 🔄 **Real-time Sync** - Instant updates across all devices
- 📱 **PWA Support** - Works offline and installable on mobile
- 🎨 **Things 3 Design** - Clean, minimal, and intuitive interface

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth, PostgreSQL, Real-time)
- **Deployment**: Vercel
- **State Management**: Zustand
- **Real-time**: Supabase Real-time subscriptions

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Vercel account (for deployment)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/griederer/family.git
cd family
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with your Supabase configuration:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. Enable Email and Google OAuth in Authentication settings
4. Get your project URL and anon key from Settings > API

### Deployment

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/griederer/family)

Or deploy manually:
```bash
npm run build
vercel --prod
```

## Project Structure

```
├── app/                    # Next.js App Router pages
├── components/            # Reusable React components
├── lib/                   # Utilities and configurations
│   ├── firebase/         # Firebase configuration
│   ├── hooks/           # Custom React hooks
│   ├── repositories/    # Data access layer
│   ├── store/          # Zustand state management
│   └── types/          # TypeScript type definitions
├── public/              # Static assets
└── firestore.rules     # Firestore security rules
```

## Architecture

The app follows a clean architecture pattern:

- **Repository Pattern**: Abstracts data access with offline-first support
- **Real-time Sync**: Last-writer-wins conflict resolution
- **Security**: Row-level security with family isolation
- **Offline Support**: Service worker with background sync

---

🤖 Generated with [Claude Code](https://claude.ai/code)