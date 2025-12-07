===========================================
    REPS N RECORD - MAIN README
===========================================

Project: RepsNRecord Fitness Tracker
Team: Amanda Lyons, Simranjit Sandhu, Honesty Beaton, Caleb Miller
Date: October 2025 - December 2025

This document provides comprehensive documentation for the entire RepsNRecord application,
including all features, APIs, pages, and components developed by the team.

COMPLETE APPLICATION FEATURES:
- Workout Logging (Honesty Beaton) and Calendar (Caleb Miller)
- Progress Tracking with Bar Charts (Amanda Lyons) and Calendar Integration (Simranjit Sandhu)
- Photo Gallery and Upload System (Amanda Lyons)
- Trainer Dashboard and Client Management (Simranjit Sandhu)
- User Preferences and Trainer Connections (Simranjit Sandhu)
- Authentication and User Management (Honesty Beaton)
- Database Infrastructure (Caleb Miller)
- Export Functionality - CSV/ZIP (Simranjit Sandhu)
- API Endpoints for all features (Team collaboration)

===========================================
TABLE OF CONTENTS
===========================================
1. Project Overview
2. Directory Structure
3. File Descriptions (All Team Members)
4. How to Compile/Build
5. How to Run the Application
6. Authentication (Login Credentials)
7. Input Parameters and Configuration
8. Team Contributions Breakdown
9. Additional Resources

===========================================
1. PROJECT OVERVIEW
===========================================

RepsNRecord is a fitness tracking web application built with Next.js, Node.js, 
PostgreSQL, MongoDB, and Firebase. Users can log workouts, track progress, 
upload photos, and trainers can manage their clients.

Technology Stack:
- Frontend: Next.js 15 (React), TypeScript, Tailwind CSS
- Backend: Node.js, Express.js
- Databases: PostgreSQL (primary), MongoDB (photos/metadata)
- Authentication: Firebase Auth
- Testing: Jest, Supertest, React Testing Library

===========================================
2. DIRECTORY STRUCTURE
===========================================

RepsNRecord/
|
+-----> doc/              // Documentation, reports, presentations
|       |
|       +---> Report1.pdf           (Original Report #1)
|       +---> Report2.pdf           (Original Report #2)
|       +---> Report3.pdf           (Final Report #3)
|       +---> Demo1_Slides.pptx     (First demo presentation)
|       +---> FinalDemo_Slides.pptx (Final demo presentation)
|
+-----> design/           // UML diagrams
|       |
|       +---> class_diagrams/
|       +---> sequence_diagrams/
|       +---> use_case_diagrams/
|
+-----> code/             // Project source code
|       |
|       +---> src/                  // Main application code
|       |     |
|       |     +---> app/            // Next.js pages and API routes
|       |     |     |
|       |     |     +---> api/      // Backend API endpoints
|       |     |     |     +---> progress/        (Simranjit)
|       |     |     |     +---> preferences/     (Simranjit)
|       |     |     |     +---> trainer/         (Simranjit)
|       |     |     |     +---> aggregation/     (Simranjit)
|       |     |     |     +---> connections/     (Simranjit)
|       |     |     |     +---> roles/           (Simranjit)
|       |     |     |     +---> debug/           (Simranjit)
|       |     |     |     +---> export/          (Simranjit - CSV/ZIP)
|       |     |     |     +---> workouts/        (Team)
|       |     |     |     +---> users/           (Team)
|       |     |     |
|       |     |     +---> progress/      // Progress page (Simranjit)
|       |     |     +---> preferences/   // Preferences page (Simranjit)
|       |     |     +---> trainer/       // Trainer page (Simranjit)
|       |     |     +---> calendar/      (Team)
|       |     |     +---> log/           (Team)
|       |     |     +---> pictures/      (Amanda Lyons)
|       |     |
|       |     +---> components/         // Reusable React components (Amanda Lyons)
|       |     +---> lib/                // Helper libraries (Amanda Lyons)
|       |     +---> models/             // Data models and types (Amanda Lyons)
|       |
|       +---> backend/                  // Backend server and scripts
|       |     |
|       |     +---> server.js           // Express server
|       |     +---> db.js               // Database connections
|       |     +---> uploads.js          // File upload handling
|       |     +---> migrations/         // Database migrations
|       |
|       +---> public/                   // Static assets
|       |     |
|       |     +---> images/             // Images and icons (Amanda Lyons)
|       |
|       +---> __mocks__/                // Mock files for testing (Amanda Lyons)
|
+-----> tests/            // Unit and integration tests
|       |
|       +---> backend/tests/
|       |     +---> datacollection.test.ts
|       |     +---> integrationtests.test.ts
|       |     +---> uploads.test.js
|       |
|       +---> src/app/api/
|       |     +---> progress/route.test.ts        (Simranjit)
|       |     +---> trainer/*/route.test.ts       (Simranjit)
|       |     +---> export/csv/route.test.ts      (Team)
|       |     +---> export/zip/route.test.ts      (Team)
|       |
|       +---> src/app/
|       |     +---> preferences/page.test.tsx     (Simranjit)
|       |     +---> trainer/page.test.tsx         (Simranjit)
|       |     +---> progress/page.test.tsx        (Simranjit)
|       |
|       +---> README3.txt              // Integration tests README
|       +---> README4.txt              // Unit tests README
|
+-----> data/             // Database files and example data
|       |
|       +---> schema.sql              // PostgreSQL schema
|       +---> seed_data.sql           // Example workout data
|       +---> example_users.json      // Sample user data
|
+-----> README.txt                    // THIS FILE - Main documentation
+-----> README1.txt                   // Original running instructions
+-----> README2.txt                   // Original testing guide
+-----> package.json                  // npm dependencies
+-----> tsconfig.json                 // TypeScript configuration
+-----> jest.config.js                // Jest test configuration
+-----> next.config.ts                // Next.js configuration
+-----> .env.local                    // Environment variables (not in Git)

===========================================
3. FILE DESCRIPTIONS
===========================================

ROOT LEVEL:
-----------
README.txt           - This file; complete project documentation
README1.txt          - Original instructions for running the application
README2.txt          - Original comprehensive unit testing guide
README3.txt          - Integration tests guide (with my contributions noted)
README4.txt          - Unit tests guide (with my contributions noted)
package.json         - Node.js dependencies and npm scripts
tsconfig.json        - TypeScript compiler configuration
jest.config.js       - Jest testing framework configuration
next.config.ts       - Next.js framework configuration
.env.local           - Environment variables (DATABASE_URL, Firebase keys, etc.)

CODE DIRECTORY (src/):
----------------------
APPLICATION PAGES AND FEATURES:

src/app/page.tsx (Home/Dashboard)
  - Main landing page and dashboard
  - Navigation to all features
  - Written by: Team
  - Tested by: Team

src/app/calendar/page.tsx (Calendar Feature)
  - Monthly calendar view of workouts
  - Date selection and workout display
  - Visual workout tracking by month
  - Written by: Caleb Miller
  - Tested by: Team

src/app/log/page.tsx (Workout Logging)
  - Exercise entry and workout creation
  - Form handling for sets, reps, weight
  - Database storage of workout data
  - Written by: Honesty Beaton
  - Tested by: Team

src/app/pictures/page.tsx (Photo Gallery)
  - Photo upload and gallery display
  - MongoDB integration for photo storage
  - Image compression and thumbnail generation
  - Written by: Amanda Lyons
  - Tested by: Simranjit Sandhu

src/app/progress/page.tsx (Progress Tracking)
  - Progress tracking page showing monthly workout counts
  - Bar chart visualization of user activity (by Amanda Lyons)
  - Calendar integration - updates when workouts logged (by Simranjit Sandhu)
  - Written by: Amanda Lyons (bar chart), Simranjit Sandhu (calendar integration)
  - Tested by: Simranjit Sandhu
  - Debugged by: Simranjit Sandhu

src/app/api/progress/route.ts
  - API endpoint for fetching progress data
  - Aggregates workout counts by month
  - Written by: Simranjit Sandhu

src/app/trainer/page.tsx
  - Trainer dashboard for managing clients
  - Client list, workout history, export functionality
  - Written by: Simranjit Sandhu
  - Tested by: Amanda Lyons
  - Debugged by: Amanda Lyons

src/app/api/trainer/client-workouts/route.ts
  - API endpoint for trainer to access client workout data
  - Implements permission checking
  - Written by: Simranjit Sandhu
  - Tested by: Amanda Lyons
  - Debugged by: Amanda Lyons

src/app/api/trainer/clients/route.ts
  - API endpoint for trainer to get list of their clients
  - Written by: Simranjit Sandhu
  - Tested by: Amanda Lyons
  - Debugged by: Amanda Lyons

src/app/preferences/page.tsx (User Preferences)
  - User preferences page for profile settings
  - Trainer connection functionality
  - Written by: Simranjit Sandhu
  - Tested by: Amanda Lyons
  - Debugged by: Amanda Lyons

src/app/login/page.tsx (Authentication)
  - User login and signup (Amanda Lyons)
  - User ID vs Trainer ID login logic (Simranjit Sandhu)
  - Firebase authentication integration (Amanda Lyons)
  - Written by: Amanda Lyons, Simranjit Sandhu
  - Tested by: Team

API ENDPOINTS (src/app/api/):
----------------------------
Workout Management APIs:
  - src/app/api/workouts/route.ts
    * GET /api/workouts - Fetch all workouts
    * POST /api/workouts - Create new workout
    * DELETE /api/workouts - Delete workout
    * Written by: Honesty Beaton

Progress and Analytics APIs (Simranjit Sandhu):
  - src/app/api/progress/route.ts
    * GET /api/progress - Monthly workout counts
    * Written by: Simranjit Sandhu
  
  - src/app/api/aggregation/route.ts
    * GET /api/aggregation - Daily/weekly/monthly workout aggregation
    * Written by: Simranjit Sandhu

Trainer Management APIs (Simranjit Sandhu):
  - src/app/api/trainer/clients/route.ts
    * GET /api/trainer/clients - Fetch trainer's client list
    * Written by: Simranjit Sandhu
  
  - src/app/api/trainer/client-workouts/route.ts
    * GET /api/trainer/client-workouts - Permission-based client workout access
    * Written by: Simranjit Sandhu

Connection and Roles APIs (Simranjit Sandhu):
  - src/app/api/connections/route.ts
    * GET /api/connections - Fetch trainer-client connections
    * POST /api/connections - Create connection request
    * PUT /api/connections - Update connection status
    * Written by: Simranjit Sandhu
  
  - src/app/api/roles/route.ts
    * GET /api/roles - Fetch user role (user/trainer/admin)
    * Written by: Simranjit Sandhu

Export APIs (Simranjit Sandhu):
  - src/app/api/export/csv/route.ts
    * GET /api/export/csv - Export workout history as CSV
    * Written by: Simranjit Sandhu
  
  - src/app/api/export/zip/route.ts
    * GET /api/export/zip - Export workouts and photos as ZIP
    * Written by: Simranjit Sandhu

Debug and Utilities APIs (Simranjit Sandhu):
  - src/app/api/debug/check-user/route.ts
    * GET /api/debug/check-user - User verification utility
    * Written by: Simranjit Sandhu
  
  - src/app/api/debug/users-list/route.ts
    * GET /api/debug/users-list - List all users
    * Written by: Simranjit Sandhu

User Management APIs:
  - src/app/api/users/search/route.ts
    * GET /api/users/search - Search users by name/email
    * Written by: Simranjit Sandhu
  
  - src/app/api/preferences/route.ts
    * GET/POST /api/preferences - User preferences management
    * Written by: Simranjit Sandhu

REACT COMPONENTS (src/components/):
-----------------------------------
src/components/Navbar.tsx
  - Application navigation bar
  - Route links to all pages
  - Written by: Amanda Lyons

src/components/AuthGuard.tsx
  - Authentication protection wrapper
  - Redirects unauthenticated users
  - Written by: Honesty Beaton

BACKEND DIRECTORY:
------------------
backend/server.js - Express.js server setup
backend/db.js - PostgreSQL connection configuration
backend/uploads.js - File upload handler for photos
backend/migrations/ - Database schema migrations
  - 001_create_photos.sql
  - 002_create_user_preferences.sql
  - 003_create_user_roles.sql
  - 004_create_app_schema_and_indexes.sql
  - 007_create_trainer_permissions.sql (Related to my trainer work)

MODELS:
-------
src/models/WorkoutDay.ts - Workout data structure (Amanda Lyons)
src/models/WorkoutProgress.ts - Progress tracking model (Simranjit)
src/models/workoutlogmodel.ts - Workout log model 

TEST FILES:
-----------
MY TEST FILES (Simranjit Sandhu):
- src/app/api/progress/route.test.ts
- src/app/api/trainer/client-workouts/route.test.ts
- src/app/preferences/page.test.tsx
- src/app/trainer/page.test.tsx
- src/app/api/export/csv/route.test.ts (added headers)
- src/app/api/export/csv/integration.test.ts (added headers)
- src/app/api/export/zip/route.test.ts (added headers)

TEAM TEST FILES:
- backend/tests/datacollection.test.ts
- backend/tests/integrationtests.test.ts
- backend/tests/uploads.test.js
- src/app/api/users/search/route.test.ts (added headers by Simranjit)

===========================================
4. HOW TO COMPILE/BUILD
===========================================

This is a Next.js application using TypeScript. Next.js automatically 
compiles code during development and for production builds.

STEP 1: Install Node.js
------------------------
Download and install Node.js v18 or higher from:
https://nodejs.org/

Verify installation:
  node --version
  npm --version

STEP 2: Install Dependencies
-----------------------------
From the project root directory:
  npm install

This reads package.json and installs all required packages including:
- Next.js, React, TypeScript
- PostgreSQL client (pg)
- MongoDB client (mongodb)
- Firebase SDK
- Jest for testing
- And all other dependencies

STEP 3: Build for Production (Optional)
----------------------------------------
To create an optimized production build:
  npm run build

This compiles TypeScript, bundles JavaScript, optimizes assets, and 
creates output in the .next/ directory.

The build process:
1. Compiles TypeScript files to JavaScript
2. Bundles and minifies code
3. Optimizes images and assets
4. Generates static pages where possible
5. Creates production-ready output

Build artifacts location: .next/
Build time: ~30-60 seconds depending on hardware

===========================================
5. HOW TO RUN THE APPLICATION
===========================================

STEP 1: Configure Environment Variables
----------------------------------------
Create a file named .env.local in the project root directory with:

# PostgreSQL Database
DATABASE_URL=postgresql://username:password@localhost:5432/repsrecord

# MongoDB Database
MONGODB_URI=mongodb://localhost:27017/repsrecord

# Firebase Authentication
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# NextAuth Secret
NEXTAUTH_SECRET=your_random_secret_string_here

STEP 2: Setup Databases
------------------------
PostgreSQL:
1. Install PostgreSQL (https://www.postgresql.org/)
2. Create database: createdb repsrecord
3. Run migrations: cd backend && npm run migrate

MongoDB:
1. Install MongoDB (https://www.mongodb.com/)
2. Start MongoDB service: mongod
3. Database will be created automatically on first use

STEP 3: Run Development Server
-------------------------------
From project root directory:
  npm run dev

The application will start on:
  http://localhost:3003

You should see output like:
  ✓ Ready in 2.5s
  ○ Local:   http://localhost:3003
  ✓ Compiled successfully

STEP 4: Run Production Build (Optional)
----------------------------------------
Build first:
  npm run build

Then start production server:
  npm start

ALLOWED INPUT PARAMETERS:
-------------------------
Environment Variables (in .env.local):
- DATABASE_URL: PostgreSQL connection string
- MONGODB_URI: MongoDB connection string
- NEXT_PUBLIC_FIREBASE_*: Firebase configuration
- NEXTAUTH_SECRET: Random string for session encryption (min 32 chars)
- PORT: Server port (default: 3003)

Command Line Parameters:
  npm run dev -- -p 3000    // Run on custom port
  npm run build             // No parameters
  npm start -- -p 3000      // Production server on custom port

===========================================
6. AUTHENTICATION (LOGIN CREDENTIALS)
===========================================

The application uses Firebase Authentication. Test accounts:

DEMO USER ACCOUNTS:
-------------------
Email: demo@example.com
Password: demo123456
Role: Regular User
Access: Calendar, Log, Progress, Pictures, Preferences

Email: trainer@example.com
Password: trainer123456
Role: Trainer
Access: All user features + Trainer Dashboard

Email: client@example.com
Password: client123456
Role: User with Trainer
Access: Regular user connected to a trainer

HOW TO CREATE NEW ACCOUNTS:
----------------------------
1. Navigate to http://localhost:3003/login
2. Click "Sign Up" or "Create Account"
3. Enter email and password (min 6 characters)
5. Account created automatically in Firebase
5. User preferences created in PostgreSQL

TRAINER SETUP:
--------------
To make a user a trainer, manually update in database:
  UPDATE user_roles SET role = 'trainer' WHERE user_id = 'user_firebase_id';

CLIENT-TRAINER CONNECTION:
--------------------------
Users can connect to trainers via Preferences page:
1. Login as regular user
2. Go to Preferences
3. Enter trainer's email or ID
4. Submit connection request
5. Trainer sees client in their dashboard

===========================================
7. INPUT PARAMETERS AND CONFIGURATION
===========================================

API ENDPOINTS - MY CONTRIBUTIONS (Simranjit Sandhu):
----------------------------------------------------

GET /api/aggregation
  Description: Aggregate workout data by time period
  Authentication: Required (Firebase token)
  Parameters:
    - userId (required): Firebase user ID
    - periodType (optional): 'daily', 'weekly', or 'monthly' (default: weekly)
  Returns: JSON array of aggregated workout data by period
  Example Response:
    [
      { "period": "2025-W01", "workout_count": 5, "total_exercises": 25 },
      { "period": "2025-W02", "workout_count": 4, "total_exercises": 20 }
    ]

GET /api/connections
  Description: Fetch trainer-client connection requests
  Authentication: Required
  Parameters:
    - userId (required): Firebase user ID
    - type (optional): 'sent' or 'received' filter
  Returns: JSON array of connection objects
  Example Response:
    [
      {
        "from_user_id": "abc123",
        "to_user_id": "def456",
        "status": "pending",
        "created_at": "2025-01-15T10:30:00Z"
      }
    ]

POST /api/connections
  Description: Create new trainer-client connection request
  Authentication: Required
  Body: { "fromUserId": "user_id", "toUserId": "trainer_id" }
  Returns: { "message": "Connection request sent" }

PUT /api/connections
  Description: Accept or reject connection request
  Authentication: Required
  Body: { "fromUserId": "user_id", "toUserId": "trainer_id", "status": "accepted" }
  Returns: { "message": "Connection updated" }

GET /api/roles
  Description: Fetch user's role
  Authentication: Required
  Parameters:
    - userId (required): Firebase user ID
  Returns: { "role": "user" | "trainer" | "admin" }

POST /api/roles
  Description: Assign role to user
  Authentication: Required (admin only recommended)
  Body: { "userId": "firebase_user_id", "role": "trainer" }
  Returns: { "message": "Role assigned successfully" }

GET /api/debug/check-user?userId=USER_ID
  Description: Debug endpoint to check if user exists in database
  Authentication: Not required (debug only)
  Parameters:
    - userId (required): Firebase user ID to check
  Returns: User information from user_roles, user_preferences, trainer_permissions

GET /api/debug/users-list
  Description: List all users in user_roles table
  Authentication: Not required (debug only)
  Returns: JSON array of all users with roles

GET /api/export/csv
  Description: Export workout data as CSV
  Authentication: Required
  Parameters:
    - userId (required): User whose workouts to export
    - requesterId (optional): Trainer requesting data
  Returns: CSV file download
  Format: workout_id, date, exercise_name, sets, reps, weight

GET /api/export/zip
  Description: Export workouts and photos as ZIP archive
  Authentication: Required
  Parameters:
    - userId (required): User whose data to export
    - requesterId (optional): Trainer requesting data
  Returns: ZIP file containing:
    - workouts.csv (workout data)
    - photos/ (all user photos)
    - manifest.json (file listing)

GET /api/progress
  Description: Fetch user's workout progress by month
  Authentication: Required (Firebase token)
  Parameters: None (uses authenticated user ID)
  Returns: JSON array of { month: string, count: number }
  Example Response:
    [
      { "month": "2025-01", "count": 12 },
      { "month": "2025-02", "count": 15 }
    ]

GET /api/trainer/clients
  Description: Get list of trainer's clients
  Authentication: Required (must have trainer role)
  Parameters: None
  Returns: JSON array of client objects
  Example Response:
    [
      { "user_id": "abc123", "email": "client@example.com", "display_name": "John" }
    ]

GET /api/trainer/client-workouts?clientId=USER_ID
  Description: Get specific client's workout data (trainer only)
  Authentication: Required (trainer with permission)
  Parameters:
    - clientId (required): Firebase user ID of client
  Returns: JSON array of workout objects
  Errors:
    - 403: Trainer doesn't have export permission for this client
    - 404: Client not found

GET /api/preferences
  Description: Get user preferences
  Authentication: Required
  Parameters: None
  Returns: JSON object with user preferences

POST /api/preferences
  Description: Update user preferences
  Authentication: Required
  Body: JSON object with preference fields
  Example Body:
    {
      "theme": "dark",
      "notifications": true,
      "trainer_id": "trainer_firebase_id"
    }

CONFIGURATION FILES:
--------------------
next.config.ts
  - Custom server port (3003)
  - Image optimization settings
  - API route configuration

jest.config.js
  - Test environment: node
  - Coverage thresholds
  - Mock file locations

tsconfig.json
  - TypeScript strict mode
  - Path aliases (@/*)
  - Target: ES2020

package.json scripts:
  - dev: Start development server
  - build: Create production build
  - start: Run production server
  - test: Run all tests
  - migrate: Run database migrations

===========================================
8. MY SPECIFIC CONTRIBUTIONS (Simranjit Sandhu)
===========================================

FEATURES IMPLEMENTED:
---------------------
1. Progress Tracking System
   - Monthly workout count aggregation
   - Bar chart visualization (Amanda Lyons)
   - Calendar integration - live updates on workout logging (Simranjit Sandhu)
   - API endpoint for progress data (Simranjit Sandhu)
   - Database queries for workout statistics (Simranjit Sandhu)

2. Trainer Dashboard
   - Client list management
   - View client workout history
   - Export client data (CSV/ZIP)
   - Permission-based access control

3. User Preferences
   - Profile settings management
   - Trainer connection functionality
   - Database integration for preferences storage
   - API endpoints for CRUD operations

4. Trainer-User Connection System
   - Request/approve connection workflow
   - Permission management
   - Database schema for relationships
   - API for managing connections

5. Data Aggregation System
   - Aggregate workouts by time period (daily/weekly/monthly)
   - Count total workouts and exercises per period
   - Support for custom date ranges
   - Optimized PostgreSQL queries

6. Export System
   - CSV export of complete workout history
   - ZIP export with workout logs and photos (for progress page download)
   - Trainer access to client data with permissions
   - Automatic photo bundling and manifest generation
   - Note: Export functionality only; photos page by team

7. Debug Utilities
   - User existence verification
   - Database state inspection
   - User roles and permissions listing
   - Development and troubleshooting tools

FILES I AUTHORED:
-----------------
Frontend Pages:
  - src/app/progress/page.tsx
  - src/app/trainer/page.tsx
  - src/app/preferences/page.tsx

API Routes:
  - src/app/api/progress/route.ts
  - src/app/api/trainer/client-workouts/route.ts
  - src/app/api/trainer/clients/route.ts
  - src/app/api/preferences/route.ts
  - src/app/api/aggregation/route.ts
  - src/app/api/connections/route.ts
  - src/app/api/roles/route.ts
  - src/app/api/debug/check-user/route.ts
  - src/app/api/debug/users-list/route.ts
  - src/app/api/export/csv/route.ts
  - src/app/api/export/zip/route.ts

Models:
  - src/models/WorkoutProgress.ts

Database:
  - backend/migrations/007_create_trainer_permissions.sql

Tests:
  - src/app/api/progress/route.test.ts
  - src/app/api/trainer/client-workouts/route.test.ts
  - src/app/preferences/page.test.tsx
  - src/app/trainer/page.test.tsx

TECHNOLOGIES USED IN MY WORK:
------------------------------
- Next.js 15 (App Router, Server Components)
- TypeScript (strict mode)
- PostgreSQL (complex queries, joins)
- Firebase Auth (user authentication)
- React Hooks (useState, useEffect, custom hooks)
- Chart.js / Recharts (progress visualization)
- Tailwind CSS (styling)
- Jest + React Testing Library (testing)

DATABASE SCHEMA (My Contributions):
-----------------------------------
trainer_permissions table:
  - id (primary key)
  - trainer_id (foreign key to users)
  - client_id (foreign key to users)
  - can_view_workouts (boolean)
  - can_export_data (boolean)
  - created_at (timestamp)

user_preferences enhancements:
  - trainer_id (foreign key, nullable)
  - connection_status (enum: pending, approved, rejected)

===========================================
9. ADDITIONAL RESOURCES
===========================================

TESTING:
--------
Unit Tests: See README4.txt
  Run with: npm test
  My test files cover progress, trainer, and preferences features

Integration Tests: See README3.txt
  Run with: npm test integrationtests
  Tests API workflows and database integration

DOCUMENTATION:
--------------
Full testing guide: README2.txt
Original setup guide: README1.txt
Integration tests: README3.txt
Unit tests: README4.txt

PROJECT REPORTS:
----------------
doc/Report1.pdf - Initial project proposal
doc/Report2.pdf - Design and architecture
doc/Report3.pdf - Final report with UML diagrams

PRESENTATIONS:
--------------
doc/Demo1_Slides.pptx - First demonstration
doc/FinalDemo_Slides.pptx - Final demonstration

UML DIAGRAMS:
-------------
design/ directory contains:
  - Class diagrams (matches code structure)
  - Sequence diagrams (API workflows)
  - Use case diagrams (user interactions)

Note: All class, attribute, and method names in code match Report #3 UML diagrams.

TROUBLESHOOTING:
----------------
Common Issues:
1. Port 3003 in use: Change PORT in .env.local or use: npm run dev -- -p 3000
2. Database connection errors: Check DATABASE_URL and MONGODB_URI
3. Firebase auth errors: Verify NEXT_PUBLIC_FIREBASE_* variables
4. Module not found: Run npm install
5. Build errors: Delete .next/ folder and rebuild

Contact:
--------
For questions about my contributions (progress, trainer, preferences):
Simranjit Sandhu

For other features, contact respective team members:
- Calendar/Workout logging: Amanda Lyons, Honesty Beaton
- Photo upload: Caleb Miller
- Export functionality: Team collaboration

===========================================
END OF README
===========================================
Last Updated: December 7, 2025
Document Version: 1.0
Authored by: Simranjit Sandhu
