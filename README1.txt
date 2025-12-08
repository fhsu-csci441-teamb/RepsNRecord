===========================================
    REPS N RECORD - HOW TO RUN THE CODE
===========================================

Project: RepsNRecord Fitness Tracker
Authors: Amanda Lyons, Simranjit Sandhu, Honesty Beaton, Caleb Miller
Date: October 2025 - December 2025

INITIAL APPLICATION SKELETON:
Amanda Lyons created the initial Next.js application structure with:
- Navigation bar (Navbar component)
- Login page skeleton
- Calendar page skeleton
- Workout log page skeleton  
- Progress page skeleton
- Pictures page skeleton
- Basic routing and page structure

Team members then built out functionality within each page individually.

COMPLETE APPLICATION FEATURES:
- User authentication and account management (Firebase)
- Daily workout logging with exercises, sets, reps, and weight
- Monthly calendar view with workout history
- Progress tracking with monthly statistics and charts
- Photo upload and gallery for progress pictures
- Trainer dashboard for client management
- User preferences and profile settings
- Trainer-client connection system
- Data export functionality (CSV and ZIP)
- User role management (user/trainer)

Team Contributions:
- Amanda Lyons: Calendar, workout logging, progress bar chart, file tree and website skeleton
- Simranjit Sandhu: Progress API, trainer features, preferences, connections, export
- Honesty Beaton: Photo upload, MongoDB integration, authentication
- Caleb Miller: Database setup, testing, deployment

===========================================
TABLE OF CONTENTS
===========================================
1. Project Description
2. Complete Directory Structure
3. File Descriptions by Feature
4. Prerequisites and Installation
5. How to Compile/Build
6. How to Run the Application
7. Environment Variables Configuration
8. Authentication and Test Accounts
9. Running the Application
10. Production Build
11. Troubleshooting
12. Additional Documentation

===========================================
1. PROJECT DESCRIPTION
===========================================

RepsNRecord is a comprehensive fitness tracking web application that allows:
- Users to log daily workouts with exercises, sets, reps, and weight
- View monthly workout calendars with visual progress tracking
- Upload and manage progress photos
- Track workout progress with monthly statistics and charts
- Trainers to manage clients and view their workout history
- Users to connect with trainers for guided fitness programs

Technology Stack:
- Frontend: Next.js 15 (React 18), TypeScript, Tailwind CSS
- Backend: Node.js, Express.js
- Databases: PostgreSQL (primary data), MongoDB (photos/metadata)
- Authentication: Firebase Auth
- Testing: Jest, Supertest, React Testing Library

===========================================
2. COMPLETE DIRECTORY STRUCTURE
===========================================

RepsNRecord/
|
+-----> README.txt              // Main comprehensive documentation
+-----> README1.txt             // THIS FILE - How to run the code
+-----> README2.txt             // Comprehensive testing guide
+-----> README3.txt             // Integration tests guide
+-----> README4.txt             // Unit tests guide
+-----> CHANGES_DOCUMENTATION.md // Change log documentation
|
+-----> package.json            // npm dependencies and scripts
+-----> package-lock.json       // npm lock file
+-----> tsconfig.json           // TypeScript configuration
+-----> jest.config.js          // Jest testing configuration
+-----> jest.setup.js           // Jest setup file
+-----> next.config.ts          // Next.js configuration
+-----> next-env.d.ts           // Next.js TypeScript definitions
+-----> eslint.config.mjs       // ESLint configuration
+-----> postcss.config.mjs      // PostCSS configuration
+-----> .env.local              // Environment variables (not in Git)
+-----> .gitignore              // Git ignore rules
|
+-----> src/                    // Main application source code
|       |
|       +---> app/              // Next.js App Router
|       |     |
|       |     +---> layout.tsx          // Root layout (Amanda - skeleton)
|       |     +---> page.tsx            // Home page (Amanda - skeleton)
|       |     +---> globals.css         // Global styles
|       |     +---> favicon.ico         // Site icon
|       |     |
|       |     +---> api/                // Backend API routes
|       |     |     |
|       |     |     +---> workouts/route.ts           (Honesty Beaton)
|       |     |     +---> progress/route.ts           (Simranjit Sandhu)
|       |     |     +---> aggregation/route.ts        (Amanda Lyons)
|       |     |     +---> preferences/route.ts        (Simranjit Sandhu)
|       |     |     +---> connections/route.ts        (Simranjit Sandhu)
|       |     |     +---> roles/route.ts              (Simranjit Sandhu)
|       |     |     +---> trainer/
|       |     |     |     +---> clients/route.ts           (Simranjit Sandhu)
|       |     |     |     +---> client-workouts/route.ts   (Simranjit Sandhu)
|       |     |     +---> export/
|       |     |     |     +---> csv/route.ts               (Simranjit Sandhu)
|       |     |     |     +---> zip/route.ts               (Simranjit Sandhu)
|       |     |     +---> debug/
|       |     |     |     +---> check-user/route.ts        (Simranjit Sandhu)
|       |     |     |     +---> users-list/route.ts        (Simranjit Sandhu)
|       |     |     +---> users/
|       |     |     |     +---> search/route.ts            (Simranjit Sandhu)
|       |     |     +---> logs/route.ts               (Team)
|       |     |     +---> me/route.ts                 (Team)
|       |     |     +---> monthly-summary/route.ts    (Team)
|       |     |     +---> personal-records/route.ts   (Team)
|       |     |     +---> workout-progress/route.ts   (Team)
|       |     |
|       |     +---> calendar/page.tsx     (Caleb Miller)
|       |     +---> log/page.tsx          (Honesty Beaton)
|       |     +---> login/page.tsx        (Amanda Lyons, Simranjit Sandhu)
|       |     +---> pictures/page.tsx     (Amanda Lyons)
|       |     +---> progress/page.tsx     (Amanda Lyons, Simranjit Sandhu)
|       |     +---> preferences/page.tsx  (Simranjit Sandhu)
|       |     +---> trainer/page.tsx      (Simranjit Sandhu)
|       |     +---> records/page.tsx      (Team)
|       |
|       +---> components/       // Reusable React components
|       |     +---> Navbar.tsx          (Amanda Lyons)
|       |     +---> AuthGuard.tsx       (Honesty Beaton)
|       |     +---> __tests__/          // Component tests
|       |
|       +---> lib/              // Helper libraries and utilities
|       |     +---> firebase.ts         // Firebase auth config
|       |     +---> mongodb.ts          // MongoDB connection
|       |     +---> postgres.ts         // PostgreSQL connection
|       |     +---> auth.ts             // Auth helpers
|       |     +---> authHelper.ts       // Auth helper functions
|       |     +---> useAuth.ts          // Auth React hook
|       |
|       +---> models/           // TypeScript data models
|             +---> WorkoutDay.ts
|             +---> WorkoutProgress.ts  (Simranjit Sandhu)
|             +---> workoutlogmodel.ts
|
+-----> backend/                // Backend server and utilities
|       |
|       +---> server.js                 // Express server
|       +---> db.js                     // PostgreSQL connection
|       +---> uploads.js                // File upload handler
|       +---> seed_mongo.js             // MongoDB seeding script
|       +---> package.json              // Backend dependencies
|       +---> package-lock.json         // Backend lock file
|       |
|       +---> migrations/               // Database migrations
|       |     +---> 001_create_photos.sql
|       |     +---> 002_create_user_preferences.sql
|       |     +---> 003_create_user_roles.sql
|       |     +---> 004_create_app_schema_and_indexes.sql
|       |     +---> 004_rollback_app_schema.sql
|       |     +---> 005_seed_demo_users.sql
|       |     +---> 006_seed_admin_and_demo_data.sql
|       |     +---> 007_create_trainer_permissions.sql (Simranjit Sandhu)
|       |     +---> 008_add_email_to_user_preferences.sql
|       |
|       +---> run_migrations.js         // Migration runner
|       +---> run_migrations.sh         // Shell script for migrations
|       +---> run_rollback.sh           // Rollback script
|       +---> run_seed.sh               // Seeding script
|       +---> MIGRATIONS_README.md      // Migration documentation
|       |
|       +---> Utility Scripts:
|       |     +---> check_shared_exports.js
|       |     +---> check_trainer_clients.js
|       |     +---> check_user_progress.js
|       |     +---> check_workout_dates.js
|       |     +---> create_shared_exports.js
|       |     +---> create_trainer_permissions.js
|       |     +---> fix_duplicates.js
|       |     +---> show_all_workouts.js
|       |     +---> test-db.js
|       |     +---> test-uploader.html
|       |
|       +---> tests/                    // Backend tests
|             +---> datacollection.test.ts      (Team)
|             +---> integrationtests.test.ts    (Team)
|             +---> uploads.test.js             (Amanda Lyons)
|
+-----> public/                 // Static assets
|       +---> images/                   // Images and icons
|       +---> (static files served directly)
|
+-----> coverage/               // Test coverage reports (generated)
|       +---> lcov-report/
|       +---> clover.xml
|       +---> coverage-final.json
|       +---> lcov.info
|
+-----> __mocks__/              // Mock files for testing
|       +---> next/
|             +---> server.js           // Next.js server mocks
|
+-----> .next/                  // Next.js build output (generated, not in Git)
+-----> node_modules/           // npm packages (not in Git)
+-----> backend/node_modules/   // Backend npm packages (not in Git)
|
+-----> Additional Files:
        +---> fix_trainer_clients_duplicates.sql
        +---> build.log
        +---> dev.log
|             +---> integrationtests.test.ts
|             +---> uploads.test.js
|
+-----> public/                 // Static assets
|       +---> images/           // Images and icons
|       +---> favicon.ico
|
+-----> __mocks__/              // Mock files for testing
        +---> next/server.js

===========================================
3. FILE DESCRIPTIONS BY FEATURE
===========================================

SIMRANJIT SANDHU'S FILES:
--------------------------

Progress Tracking Feature:
  src/app/progress/page.tsx
    - Displays monthly workout statistics
    - Bar chart visualization of progress (by Amanda Lyons)
    - Calendar integration - updates when workouts logged (by Simranjit Sandhu)
    - Uses Chart.js/Recharts for visualization
    - Written by: Amanda Lyons (bar chart), Simranjit Sandhu (calendar integration)
    - Tested by: Simranjit Sandhu
    - Debugged by: Simranjit Sandhu

  src/app/api/progress/route.ts
    - API endpoint: GET /api/progress
    - Aggregates workout counts by month from PostgreSQL
    - Returns JSON array of {month, count} objects
    - Written by: Simranjit Sandhu

Trainer Dashboard Feature:
  src/app/trainer/page.tsx
    - Trainer dashboard interface
    - Client list management
    - View client workout history
    - Export client data functionality
    - Written by: Simranjit Sandhu
    - Tested by: Simranjit Sandhu
    - Debugged by: Simranjit Sandhu

  src/app/api/trainer/clients/route.ts
    - API endpoint: GET /api/trainer/clients
    - Returns list of trainer's connected clients
    - Written by: Simranjit Sandhu

  src/app/api/trainer/client-workouts/route.ts
    - API endpoint: GET /api/trainer/client-workouts
    - Permission-based access to client workout data
    - Implements trainer permission checking
    - Written by: Simranjit Sandhu

User Preferences Feature:
  src/app/preferences/page.tsx
    - User profile settings page
    - Trainer connection functionality
    - Theme and notification preferences
    - Written by: Simranjit Sandhu
    - Tested by: Simranjit Sandhu
    - Debugged by: Simranjit Sandhu

  src/app/api/preferences/route.ts
    - API endpoints: GET/POST /api/preferences
    - CRUD operations for user preferences
    - Stores in PostgreSQL user_preferences table
    - Written by: Simranjit Sandhu

Data Aggregation Feature:
  src/app/api/aggregation/route.ts
    - API endpoint: POST /api/aggregation
    - Aggregates workout data by time period
    - Supports daily, weekly, monthly aggregation
    - Returns workout counts and exercise totals
    - Written by: Simranjit Sandhu

Connections Management Feature:
  src/app/api/connections/route.ts
    - API endpoints: GET/POST/PUT /api/connections
    - Manages trainer-client connection requests
    - Handles connection status (pending/accepted/rejected)
    - Permission-based access control
    - Written by: Simranjit Sandhu

Roles Management Feature:
  src/app/api/roles/route.ts
    - API endpoints: GET/POST /api/roles
    - Manages user roles (user/trainer/admin)
    - Assigns and retrieves user roles
    - Stores in PostgreSQL user_roles table
    - Written by: Simranjit Sandhu

Debug Utilities:
  src/app/api/debug/check-user/route.ts
    - Debug endpoint for user verification
    - Checks user existence in database tables
    - Returns user roles and permissions
    - Written by: Simranjit Sandhu

  src/app/api/debug/users-list/route.ts
    - Lists all users in user_roles table
    - Displays user IDs and assigned roles
    - Development and troubleshooting tool
    - Written by: Simranjit Sandhu

Export Feature:
  src/app/api/export/csv/route.ts
    - API endpoint: GET /api/export/csv
    - Exports complete workout history as CSV
    - Supports trainer access with permissions
    - Includes all exercises, sets, reps, weights
    - Written by: Simranjit Sandhu

  src/app/api/export/zip/route.ts
    - API endpoint: GET /api/export/zip
    - Export functionality for progress page
    - Creates ZIP archive with workout logs and photos
    - Bundles CSV file with all user photos for download
    - Generates manifest.json for file listing
    - Uses archiver library for ZIP creation
    - Written by: Simranjit Sandhu
    - Note: Photos page itself created by team; ZIP export by Simranjit

Database Schema:
  backend/migrations/007_create_trainer_permissions.sql
    - Creates trainer_permissions table
    - Defines trainer-client relationships
    - Permission fields: can_view_workouts, can_export_data
    - Written by: Simranjit Sandhu

Models:
  src/models/WorkoutProgress.ts
    - TypeScript interface for progress data
    - Used by progress page and API
    - Written by: Simranjit Sandhu

TEAM FEATURES:
--------------

Calendar Feature (Caleb Miller):
  src/app/calendar/page.tsx
    - Monthly calendar view of workouts
    - Visual representation of training days
    - Click dates to view workout details
    - Interactive UI with date selection

Workout Logging Feature (Honesty Beaton):
  src/app/log/page.tsx
    - Log daily workouts interface
    - Add exercises with sets, reps, weight
    - Save workout data to database
    - Form validation and error handling

  src/app/api/workouts/route.ts
    - POST: Create new workout entry
    - GET: Retrieve user's workout history
    - DELETE: Remove workout entries
    - Stores in MongoDB

Photo Gallery Feature (Amanda Lyons):
  src/app/pictures/page.tsx
    - Upload progress photos
    - View photo gallery by month
    - Delete photos
    - Display upload date and descriptions

  backend/uploads.js
    - Handle photo file uploads
    - Image compression and optimization
    - Store photos in file system
    - Generate thumbnails

  src/app/api/photos/route.ts
    - Photo upload endpoint
    - Metadata storage in PostgreSQL
    - File retrieval and deletion

Authentication Feature (Amanda Lyons, Simranjit Sandhu, Team):
  src/app/login/page.tsx
    - User login interface (Amanda Lyons)
    - User ID vs Trainer ID login logic (Simranjit Sandhu)
    - Sign up for new accounts (Amanda Lyons)
    - Password reset functionality
    - Firebase authentication integration

  src/lib/firebase.ts
    - Firebase configuration
    - Authentication methods
    - User session management

  src/lib/auth.ts
    - Authentication helpers
    - Protected route logic
    - User verification

Navigation and Layout (Team):
  src/components/Navbar.tsx
    - Application navigation bar
    - Links to all main features
    - User profile display
    - Logout functionality

  src/components/AuthGuard.tsx
    - Protected route wrapper
    - Redirect unauthenticated users
    - Check user permissions

Database and Backend (Caleb Miller, Team):
  backend/db.js
    - PostgreSQL connection setup
    - Database pool management
    - Query execution helpers

  backend/server.js
    - Express server configuration
    - API middleware setup
    - Route registration

  backend/migrations/
    - 001_create_photos.sql - Photos table
    - 002_create_user_preferences.sql - User settings
    - 003_create_user_roles.sql - Role management
    - 004_create_app_schema_and_indexes.sql - Main schema

===========================================
4. PREREQUISITES AND INSTALLATION
===========================================

REQUIRED SOFTWARE:
------------------
1. Node.js v18 or higher
   Download: https://nodejs.org/
   Verify: node --version && npm --version

2. PostgreSQL v13 or higher
   Download: https://www.postgresql.org/download/
   Verify: psql --version

3. MongoDB v5 or higher
   Download: https://www.mongodb.com/try/download/community
   Verify: mongod --version

4. Git (for cloning repository)
   Download: https://git-scm.com/
   Verify: git --version

INSTALLATION STEPS:
-------------------
Step 1: Clone the repository (if not already done)
  git clone https://github.com/fhsu-csci441-teamb/RepsNRecord.git
  cd RepsNRecord

Step 2: Install root dependencies
  npm install

This installs:
- Next.js, React, TypeScript
- PostgreSQL client (pg)
- MongoDB client
- Firebase SDK
- Jest and testing libraries
- All other dependencies from package.json

Step 3: Install backend dependencies
  cd backend
  npm install
  cd ..

This installs backend-specific packages:
- Express.js
- Multer (file uploads)
- Supertest (API testing)

===========================================
5. HOW TO COMPILE/BUILD
===========================================

DEVELOPMENT BUILD (Auto-compile):
----------------------------------
Next.js automatically compiles TypeScript and JavaScript during development.
No manual compilation needed for development.

PRODUCTION BUILD:
-----------------
To create an optimized production build:

  npm run build

Build Process:
1. TypeScript compilation (.ts → .js)
2. Code bundling and minification
3. Image optimization
4. Static page generation
5. Creates output in .next/ directory

Build Time: ~30-60 seconds
Output Location: .next/

Verify build success:
- Check for "✓ Compiled successfully" message
- Verify .next/ directory exists
- No error messages in terminal

===========================================
6. ENVIRONMENT VARIABLES CONFIGURATION
===========================================

Create .env.local file in project root:

# PostgreSQL Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/repsrecord
PGUSER=your_postgres_username
PGHOST=localhost
PGDATABASE=repsrecord
PGPASSWORD=your_postgres_password
PGPORT=5432

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/repsrecord

# Firebase Authentication
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# NextAuth Configuration
NEXTAUTH_SECRET=generate_a_random_32_character_string
NEXTAUTH_URL=http://localhost:3003

# Server Configuration
PORT=3003

REQUIRED VALUES:
----------------
- DATABASE_URL: PostgreSQL connection string
  Format: postgresql://user:pass@host:port/database
  
- MONGODB_URI: MongoDB connection string
  Format: mongodb://host:port/database
  
- NEXT_PUBLIC_FIREBASE_*: Get from Firebase Console
  (https://console.firebase.google.com/)
  
- NEXTAUTH_SECRET: Generate random string
  Command: openssl rand -base64 32

===========================================
7. DATABASE SETUP
===========================================

POSTGRESQL SETUP:
-----------------
1. Create database:
   createdb repsrecord

2. Run migrations:
   cd backend
   npm run migrate

3. Verify tables created:
   psql -d repsrecord -c "\dt"

Expected tables:
- workouts
- user_preferences
- user_roles
- trainer_permissions (Simranjit's contribution)
- photos

MONGODB SETUP:
--------------
1. Start MongoDB service:
   Windows: net start MongoDB
   Mac/Linux: sudo systemctl start mongod

2. Verify connection:
   mongo --eval "db.adminCommand('ping')"

3. Database created automatically on first use

===========================================
8. AUTHENTICATION AND TEST ACCOUNTS
===========================================

The application uses Firebase Authentication.

TEST USER ACCOUNTS:
-------------------
Regular User:
  Email: demo@example.com
  Password: demo123456
  Features: Calendar, Log, Progress, Pictures, Preferences

Trainer Account:
  Email: trainer@example.com
  Password: trainer123456
  Features: All user features + Trainer Dashboard

Client with Trainer:
  Email: client@example.com
  Password: client123456
  Features: Regular user connected to a trainer

CREATE NEW ACCOUNTS:
--------------------
1. Navigate to http://localhost:3003/login
2. Click "Sign Up" or "Create Account"
3. Enter email and password (minimum 6 characters)
4. Account created in Firebase
5. User record created in PostgreSQL

MAKE USER A TRAINER:
--------------------
Run in PostgreSQL:
  UPDATE user_roles 
  SET role = 'trainer' 
  WHERE user_id = 'firebase_user_id';

===========================================
9. RUNNING THE APPLICATION
===========================================

DEVELOPMENT MODE (Recommended):
-------------------------------
From project root directory:
  npm run dev

Application starts on: http://localhost:3003

You should see:
  ✓ Ready in 2-3 seconds
  ○ Local:   http://localhost:3003
  ✓ Compiled successfully

Features in Development Mode:
- Hot reload (auto-refresh on code changes)
- Detailed error messages
- Source maps for debugging
- Fast refresh for React components

CUSTOM PORT:
------------
Run on different port:
  npm run dev -- -p 3000

Or set in .env.local:
  PORT=3000

ACCESSING THE APPLICATION:
--------------------------
1. Open browser: http://localhost:3003

2. Create Account or Login:
   - Click "Sign Up" to create new account
   - Or use test account credentials (see section 8)

3. Navigate to Features:

   HOME PAGE (/)
   - Dashboard with quick access to all features
   - Overview of recent activity

   CALENDAR (/calendar)
   - View monthly workout calendar
   - Click dates to see workout details
   - Visual representation of training days
   - Navigate between months

   LOG WORKOUT (/log)
   - Log new daily workout
   - Add exercises with sets, reps, weight
   - Save to database
   - Track workout date and time

   PROGRESS (/progress)
   - View monthly workout statistics
   - Bar chart showing activity over time
   - Progress trends and metrics
   - Export workout data (CSV/ZIP)

   PICTURES (/pictures)
   - Upload progress photos
   - View photo gallery by month
   - Add descriptions to photos
   - Delete unwanted photos

   PREFERENCES (/preferences)
   - Update profile settings
   - Connect with a trainer
   - Manage account preferences
   - Theme and notification settings

   TRAINER DASHBOARD (/trainer)
   - (Trainers only) View client list
   - Access client workout history
   - Export client data
   - Manage trainer-client connections

4. Using the Application:

   LOGGING WORKOUTS:
   - Go to /log
   - Enter workout date
   - Add exercises (name, sets, reps, weight)
   - Click "Save Workout"
   - View in calendar or progress pages

   VIEWING PROGRESS:
   - Go to /progress
   - See monthly workout counts
   - View bar chart of activity
   - Export data if needed

   UPLOADING PHOTOS:
   - Go to /pictures
   - Click "Upload Photo"
   - Select image file
   - Add description (optional)
   - Choose date photo was taken
   - Click "Upload"

   CONNECTING TO TRAINER:
   - Go to /preferences
   - Enter trainer's email or ID
   - Send connection request
   - Wait for trainer approval
   - Trainer can then view your workouts

===========================================
10. PRODUCTION BUILD
===========================================

BUILD FOR PRODUCTION:
---------------------
Step 1: Create production build
  npm run build

Step 2: Start production server
  npm start

Production server runs on: http://localhost:3003

DIFFERENCES FROM DEVELOPMENT:
------------------------------
- Optimized and minified code
- No hot reload
- Better performance
- Smaller bundle size
- Production error handling

===========================================
11. TROUBLESHOOTING
===========================================

PORT ALREADY IN USE:
--------------------
Error: Port 3003 is already in use
Solution: 
  - Change port: npm run dev -- -p 3000
  - Or kill process: taskkill /F /IM node.exe (Windows)

DATABASE CONNECTION ERROR:
--------------------------
Error: Connection to PostgreSQL failed
Solutions:
  - Verify PostgreSQL is running
  - Check DATABASE_URL in .env.local
  - Test connection: psql -d repsrecord

FIREBASE AUTH ERROR:
--------------------
Error: Firebase configuration invalid
Solutions:
  - Verify all NEXT_PUBLIC_FIREBASE_* variables
  - Check Firebase Console for correct values
  - Ensure variables start with NEXT_PUBLIC_

MODULE NOT FOUND:
-----------------
Error: Cannot find module 'xyz'
Solution:
  - Delete node_modules: rm -rf node_modules
  - Delete package-lock.json
  - Reinstall: npm install

BUILD ERRORS:
-------------
Error: Build failed
Solutions:
  - Delete .next folder: rm -rf .next
  - Clear npm cache: npm cache clean --force
  - Rebuild: npm run build

===========================================
12. ADDITIONAL DOCUMENTATION
===========================================

MAIN DOCUMENTATION:
-------------------
README.txt - Complete comprehensive documentation
  - Full directory structure
  - All file descriptions
  - API endpoint documentation
  - Detailed configuration guide

TESTING GUIDES:
---------------
README2.txt - Original unit testing guide
README3.txt - Integration tests (with my contributions noted)
README4.txt - Unit tests (with my contributions noted)

Run tests:
  npm test              // All tests
  npm test progress     // My progress tests
  npm test trainer      // My trainer tests

PROJECT REPORTS:
----------------
doc/Report1.pdf - Initial project proposal
doc/Report2.pdf - Design and architecture
doc/Report3.pdf - Final report (UML diagrams match code)

PRESENTATIONS:
--------------
doc/Demo1_Slides.pptx - First demonstration
doc/FinalDemo_Slides.pptx - Final demonstration

UML DIAGRAMS:
-------------
design/ directory - Class, sequence, and use case diagrams
Note: All diagrams in Report #3 match the actual code implementation

===========================================
QUICK START SUMMARY
===========================================

1. Install Node.js, PostgreSQL, MongoDB
2. npm install
3. Create .env.local with database and Firebase credentials
4. createdb repsrecord && cd backend && npm run migrate
5. npm run dev
6. Open http://localhost:3003
7. Login with demo@example.com / demo123456

For detailed instructions, see sections above.

===========================================
CONTACT INFORMATION
===========================================

For questions about specific features:

Progress, Trainer, Preferences features:
  Simranjit Sandhu

Calendar, Workout Logging, Photos:
  Team members (Amanda Lyons, Honesty Beaton, Caleb Miller)

===========================================
END OF README1.txt
===========================================
Last Updated: December 7, 2025
Authored by: Simranjit Sandhu (with team contributions)
