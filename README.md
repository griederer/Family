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
- **Backend**: Firebase (Auth, Firestore, Realtime Database)
- **Deployment**: Vercel
- **State Management**: Zustand
- **Real-time**: Firebase Realtime Database

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase project
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
Create a `.env.local` file with your Firebase configuration:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Firebase Setup

1. Create a Firebase project
2. Enable Authentication (Email/Password, Google)
3. Create Firestore database
4. Set up Realtime Database
5. Configure security rules (included in `firestore.rules`)

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