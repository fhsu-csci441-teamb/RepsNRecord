# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Reps N Record** is a workout tracking web application built with Next.js 15 (App Router) that combines Firebase Authentication, MongoDB for workout logging, and PostgreSQL for photo storage. The project uses a hybrid architecture with both Next.js API routes and a separate Express backend.

## Development Commands

### Next.js Frontend
```bash
npm run dev          # Start dev server with Turbopack (http://localhost:3000)
npm run build        # Build for production with Turbopack
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Express Backend (Photo Service)
```bash
cd backend
npm start            # Start Express server (http://localhost:3001)
```

Note: The backend must be running separately for photo upload functionality to work.

## Architecture

### Dual-Backend Design
The application uses **two separate backends** that run independently:

1. **Next.js API Routes** (`src/app/api/`)
   - Handles workout logging operations
   - Connects to MongoDB via Mongoose
   - Routes: `/api/workoutlog` (GET, POST, DELETE)

2. **Express Backend** (`backend/`)
   - Handles photo uploads and retrieval
   - Connects to PostgreSQL via `pg` pool
   - Routes: `/api/photos` (GET, POST)
   - Uses Sharp for image processing (compression, thumbnails)
   - Stores files in `backend/public/uploads/` organized by user/year/month

### Authentication Flow
- Firebase Authentication for user login (Google OAuth)
- `AuthGuard` component wraps protected routes
- `useAuth` hook provides user state and loading status
- Redirects to `/login?next=<path>` when unauthenticated
- **Note**: Backend photo API currently uses a hardcoded stub user ID that needs replacement with real auth

### Database Connections

**MongoDB** (via `src/lib/mongodb.ts`)
- Connection string from `MONGODB_URI` env var
- Uses global caching to prevent connection exhaustion in serverless
- Schema: `workoutlogmodel.ts` defines workout entries (userId, date, exerciseName, bodyPart, intensity, sets, reps)

**PostgreSQL** (via `backend/db.js`)
- Configuration from `PGUSER`, `PGPASSWORD`, `PGHOST`, `PGPORT`, `PGDATABASE` env vars in `backend/.env`
- Schema: `backend/migrations/001_create_photos.sql`
- Stores photo metadata (file URLs, thumbnails, EXIF data, descriptions)

### Key Files & Patterns

- **Path alias**: `@/*` maps to `src/*` (configured in tsconfig.json)
- **Layout**: `src/app/layout.tsx` renders global Navbar
- **Firebase config**: `src/lib/firebase.ts` exports `auth`, `db`, `storage`, `googleProvider`
- **Protected routes**: Wrap page content with `<AuthGuard>` component
- **API route format**: Use Next.js 15 App Router conventions with `route.ts` files exporting `GET`, `POST`, `DELETE` handlers
- **Mongoose models**: Use singleton pattern `models.ModelName || model(...)` to prevent recompilation issues

### Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_FB_*` - Firebase configuration (apiKey, authDomain, projectId, storageBucket, appId)
- `MONGODB_URI` - MongoDB connection string

Required in `backend/.env`:
- `PGUSER`, `PGPASSWORD`, `PGHOST`, `PGPORT`, `PGDATABASE` - PostgreSQL credentials
- `PORT` - Express server port (defaults to 3001)

## Pages Structure

- `/` - Home/landing page
- `/login` - Firebase authentication page
- `/calendar` - Workout calendar view (protected)
- `/log` - Workout logging interface (protected)
- `/pictures` - Photo gallery (protected)
- `/progress` - Progress tracking/charts (protected)

## Tech Stack

- **Framework**: Next.js 15.5.4 with Turbopack, React 19
- **Styling**: Tailwind CSS 4 with PostCSS
- **Auth**: Firebase (Auth + Firestore + Storage)
- **Databases**: MongoDB (Mongoose 8.19.2) + PostgreSQL (pg 8.16.3)
- **UI Icons**: lucide-react
- **Charts**: recharts 3.2.1
- **Image Processing**: Sharp 0.34.4 (backend)
- **File Uploads**: Multer 2.0.2 (backend)
- **TypeScript**: Full TypeScript with strict mode
