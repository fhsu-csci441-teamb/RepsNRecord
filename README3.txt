===========================================
    REPS N RECORD - INTEGRATION TESTS 
===========================================

Project: RepsNRecord
Authors: Amanda Lyons, Simranjit Sandhu, Honesty Beaton, Caleb Miller
Date: October 2025 - December 2025

This guide covers ALL integration tests for the entire RepsNRecord application.

===========================================
OVERVIEW
===========================================
Integration tests validate the interaction between multiple components, 
APIs, and databases working together. These tests ensure end-to-end 
functionality of the entire RepsNRecord application.

COMPLETE APPLICATION INTEGRATION TESTS:

WORKOUT MANAGEMENT INTEGRATION:
- Creating, retrieving, and deleting workouts (Honesty Beaton)
- Calendar view with workout data (Caleb Miller)
- Workout logging workflow (Honesty Beaton)
- PostgreSQL workout storage integration (Caleb Miller)

PROGRESS TRACKING INTEGRATION:
- Progress API with monthly aggregation (Simranjit Sandhu)
- Bar chart data visualization (Amanda Lyons)
- Calendar integration updates (Simranjit Sandhu)
- Aggregation API for statistics (Simranjit Sandhu)

PHOTO GALLERY INTEGRATION:
- Photo upload and storage workflow (Amanda Lyons)
- MongoDB photo metadata integration (Amanda Lyons)
- Image compression and thumbnails (Amanda Lyons)
- Photo retrieval and display (Amanda Lyons)

TRAINER FEATURES INTEGRATION:
- Trainer dashboard functionality (Simranjit Sandhu)
- Client management workflow (Simranjit Sandhu)
- Permission-based access control (Simranjit Sandhu)
- Trainer-client connections (Simranjit Sandhu)

AUTHENTICATION INTEGRATION:
- Firebase authentication workflow (Amanda Lyons)
- User session management (Amanda Lyons)
- Protected route access (Amanda Lyons)
- Login and signup page (Amanda Lyons)
- User ID vs Trainer ID login logic (Simranjit Sandhu)

EXPORT FUNCTIONALITY INTEGRATION:
- CSV export of workout history (Simranjit Sandhu)
- ZIP export with workouts and photos (Simranjit Sandhu)
- Data persistence across databases (Honesty Beaton)

USER MANAGEMENT INTEGRATION:
- User preferences and settings (Simranjit Sandhu)
- Role management - user/trainer/admin (Simranjit Sandhu)
- User search functionality (Simranjit Sandhu)
- Connection requests workflow (Simranjit Sandhu)

===========================================
PREREQUISITES
===========================================
- Node.js (v16 or higher)
- npm package manager
- PostgreSQL database running (port 5432)
- MongoDB database running (port 27017)
- Firebase credentials configured
- Environment variables set in .env.local:
  * DATABASE_URL=postgresql://user:pass@localhost:5432/repsrecord
  * MONGODB_URI=mongodb://localhost:27017/repsrecord
  * NEXTAUTH_SECRET=your-secret-key
  * Firebase credentials (FIREBASE_API_KEY, etc.)

===========================================
1. INSTALL DEPENDENCIES
===========================================
From project root directory:
  npm install

If any error occurs: 
  npm install --save-dev jest supertest ts-node @types/jest @types/supertest

===========================================
2. DATABASE SETUP
===========================================
Ensure databases are running:
- PostgreSQL: Check connection on port 5432
- MongoDB: Check connection on port 27017

Run migrations if needed:
  cd backend
  npm run migrate

===========================================
3. START APP
===========================================
Ensure app is running with command:
  npm run dev

The app should start on http://localhost:3003

===========================================
4. RUN INTEGRATION TESTS
===========================================
From project root directory:

Run all integration tests:
  npm test integrationtests

Run specific integration test file:
  npx jest backend/tests/integrationtests.ts

Run with verbose output:
  npm test -- --verbose integrationtests

Run with coverage:
  npm test -- --coverage integrationtests

===========================================
5. WHAT TESTS COVER (COMPLETE APPLICATION)
===========================================

WORKOUT MANAGEMENT INTEGRATION (Honesty Beaton, Caleb Miller):
- POST /api/workouts - Creating workout entries with exercises, sets, reps (Honesty Beaton)
- GET /api/workouts - Retrieving user workout history (Honesty Beaton)
- DELETE /api/workouts - Deleting workout records (Honesty Beaton)
- Calendar view integration with workout data (Caleb Miller)
- Date filtering and monthly workout display (Caleb Miller)
- PostgreSQL database storage workflow (Caleb Miller)

PROGRESS TRACKING INTEGRATION (Amanda Lyons, Simranjit Sandhu):
- GET /api/progress - Monthly workout count aggregation (Simranjit Sandhu)
- Bar chart data visualization (Amanda Lyons)
- Calendar integration updates (Simranjit Sandhu)
- GET /api/aggregation - Daily/weekly/monthly statistics (Amanda Lyons)
- Progress page rendering with data (Simranjit Sandhu)

PHOTO GALLERY INTEGRATION (Amanda Lyons):
- POST /api/photos - Photo upload with compression
- MongoDB photo metadata storage
- Thumbnail generation workflow
- GET /api/photos - Photo retrieval by month
- DELETE /api/photos - Photo deletion from storage
- Photo upload and retrieval full workflow

TRAINER FEATURES INTEGRATION (Simranjit Sandhu):
- GET /api/trainer/clients - Fetch trainer's client list
- GET /api/trainer/client-workouts - Permission-based workout access
- Trainer dashboard rendering and functionality
- Client management workflow
- Permission checking and access control

CONNECTION MANAGEMENT INTEGRATION (Simranjit Sandhu):
- POST /api/connections - Create trainer-client connection request
- GET /api/connections - Retrieve connection status
- PUT /api/connections - Update connection approval status
- Connection workflow from request to approval

AUTHENTICATION INTEGRATION (Amanda Lyons, Simranjit Sandhu, Team):
- Firebase authentication workflow (Team)
- User login and signup page (Amanda Lyons)
- User ID vs Trainer ID login logic (Simranjit Sandhu)
- Session management and persistence (Team)
- Protected route access control (Team)
- AuthGuard component integration (Honesty Beaton)

EXPORT FUNCTIONALITY INTEGRATION (Simranjit Sandhu):
- POST workout → GET CSV export workflow
- GET /api/export/csv - Workout history CSV generation
- GET /api/export/zip - Combined workouts and photos ZIP
- Data retrieval from PostgreSQL and MongoDB
- File generation and download workflow

USER MANAGEMENT INTEGRATION (Simranjit Sandhu):
- GET /api/users/search - User search by name/email (Simranjit Sandhu)
- GET /api/preferences - User preferences retrieval
- POST /api/preferences - Update user settings
- GET /api/roles - User role management

DEBUG UTILITIES INTEGRATION (Simranjit Sandhu):
- GET /api/debug/check-user - User verification
- GET /api/debug/users-list - All users listing

DATABASE INTEGRATION (Caleb Miller):
- PostgreSQL connection and queries
- MongoDB connection and operations
- Data persistence across both databases
- Migration execution and schema updates

===========================================
6. EXPECTED RESULTS
===========================================
You should see test results for:
- Creating a workout (✓)
- Fetching workouts (✓)
- Deleting a workout (✓)

Example successful output:
  PASS  backend/tests/integrationtests.test.ts (5.234 s)
    WorkoutDays API Integration
      ✓ creates a workout (234 ms)
      ✓ retrieves workouts (156 ms)
      ✓ deletes a workout (187 ms)
  
  Test Suites: 1 passed, 1 total
  Tests:       3 passed, 3 total

===========================================
7. TROUBLESHOOTING
===========================================
Database Connection Errors:
- Verify PostgreSQL is running: pg_isready -h localhost -p 5432
- Verify MongoDB is running: mongo --eval "db.adminCommand('ping')"
- Check DATABASE_URL and MONGODB_URI in .env.local

Authentication Errors:
- Ensure Firebase credentials are configured
- Check NEXTAUTH_SECRET is set in .env.local

Timeout Errors:
- Integration tests may take longer due to database operations
- Increase Jest timeout in jest.config.js if needed

Port Conflicts:
- Ensure port 3003 is available for the dev server
- Kill any existing processes using the port

Data Conflicts:
- Tests may create test data in database
- Consider using separate test database
- Clean up test data after runs if needed

===========================================
8. BEST PRACTICES
===========================================
- Run integration tests after unit tests pass
- Use test database separate from development/production
- Ensure databases are seeded with required test data
- Review backend/migrations/ for schema setup
- Integration tests take longer - be patient
- Check logs in terminal for detailed error messages

For more information, see:
- jest.config.js (test configuration)
- backend/server.js (API endpoints)
- backend/migrations/ (database schema)
