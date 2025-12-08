===========================================
    REPS N RECORD - UNIT TESTS 
===========================================
Project: RepsNRecord
Authors: Amanda Lyons, Simranjit Sandhu, Honesty Beaton, Caleb Miller
Date: October 2025 - December 2025

This guide covers ALL unit tests for the entire RepsNRecord application.

===========================================
OVERVIEW
===========================================
Unit tests validate individual components and functions in isolation using 
mocked dependencies. These tests ensure each piece of the RepsNRecord 
application works correctly on its own.

COMPLETE APPLICATION UNIT TESTS:

WORKOUT FEATURES (Honesty Beaton, Caleb Miller):
- Workout creation and validation (Honesty Beaton)
- Exercise logging functionality (Honesty Beaton)
- Workout retrieval by user (Honesty Beaton)
- Workout deletion (Honesty Beaton)
- Calendar component rendering (Caleb Miller)
- Date selection and filtering (Caleb Miller)

PROGRESS TRACKING (Amanda Lyons, Simranjit Sandhu):
- Progress API monthly aggregation (Simranjit Sandhu)
- Bar chart data formatting (Amanda Lyons)
- Calendar integration updates (Simranjit Sandhu)
- Aggregation calculations (Simranjit Sandhu)

PHOTO GALLERY (Amanda Lyons):
- Photo upload validation 
- Image compression functionality
- Thumbnail generation
- MongoDB metadata storage
- Photo retrieval and filtering
- Photo deletion with cleanup

TRAINER FEATURES (Simranjit Sandhu):
- Trainer dashboard rendering
- Client list management
- Permission validation
- Client workout access control
- Trainer-client connections

AUTHENTICATION (Amanda Lyons, Simranjit Sandhu):
- Login form and page (Amanda Lyons)
- User ID vs Trainer ID logic (Simranjit Sandhu)
- Signup functionality (Amanda Lyons)
- Firebase integration (Amanda Lyons)
- Session management (Amanda Lyons)
- AuthGuard protection (Honesty Beaton)

EXPORT FUNCTIONALITY (Simranjit Sandhu):
- CSV generation from workout data
- ZIP file creation with photos
- Data formatting for export

USER MANAGEMENT (Simranjit Sandhu):
- User search functionality
- Preferences form handling (Simranjit Sandhu)
- Role assignment (Simranjit Sandhu)
- User profile updates

COMPONENTS (Amanda Lyons, Honesty Beaton):
- Navbar navigation (Amanda Lyons)
- AuthGuard protection (Honesty Beaton)
- Form components (Amanda Lyons)
- UI elements (Amanda Lyons)

The data collection test simulates user workout activity by creating a 
workout, fetching all workouts, and saving to a local JSON file.

===========================================
PREREQUISITES
===========================================
- Node.js (v16 or higher)
- npm package manager
- All project dependencies installed

===========================================
1. INSTALL DEPENDENCIES
===========================================
From project root directory:
  npm install

If specific dependencies are missing:
  npm install node-fetch
  npm install --save-dev jest ts-node @types/jest

===========================================
2. ENSURE APP IS RUNNING
===========================================
For data collection test, start the development server:
  npm run dev

The app should start on http://localhost:3003

===========================================
3. RUN UNIT TESTS
===========================================
From project root directory:

Run ALL unit tests:
  npm test

Run specific test files:
  npm test datacollection
  npm test route.test.ts
  npm test uploads

Run data collection script:
  npx ts-node backend/tests/datacollection.test.ts

Run with watch mode (auto-rerun on changes):
  npm test -- --watch

Run with coverage report:
  npm test -- --coverage

===========================================
4. WHAT UNIT TESTS COVER (COMPLETE APPLICATION)
===========================================

BACKEND TESTS:

Data Collection (Team):
- datacollection.test.ts
  * Simulates workout creation workflow
  * Fetches and saves workout data to JSON
  * Tests API response formatting
  * Written by: Team

File Upload Operations (Amanda Lyons):
- uploads.test.js
  * POST /api/photos - Photo upload validation
  * Image file type verification
  * Compression and thumbnail generation
  * MongoDB metadata storage
  * GET /api/photos - Photo retrieval with filters
  * DELETE /api/photos - Photo deletion with cleanup
  * Written by: Amanda Lyons

FRONTEND PAGE TESTS:

Authentication Pages (Amanda Lyons, Simranjit Sandhu):
- login/page.test.tsx
  * Login form rendering and validation (Amanda Lyons)
  * User ID vs Trainer ID logic (Simranjit Sandhu)
  * Signup functionality (Amanda Lyons)
  * Firebase authentication integration (Team)
  * Error handling and user feedback (Amanda Lyons)
  * Written by: Amanda Lyons, Simranjit Sandhu

Photo Gallery (Amanda Lyons):
- pictures/page.test.tsx
  * Gallery rendering with photos
  * Upload button functionality
  * Photo display and filtering by month
  * Delete photo interaction
  * Written by: Amanda Lyons

Progress Tracking (Amanda Lyons, Simranjit Sandhu):
- progress/page.test.tsx
  * Bar chart rendering (Amanda Lyons)
  * Calendar integration display (Simranjit Sandhu)
  * Monthly workout count display
  * Export button functionality
  * Written by: Amanda Lyons, Simranjit Sandhu

Calendar View (Caleb Miller):
- calendar/page.test.tsx
  * Monthly calendar rendering
  * Date selection interaction
  * Workout display on selected dates
  * Navigation between months
  * Written by: Caleb Miller

Trainer Dashboard (Simranjit Sandhu):
- trainer/page.test.tsx
  * Client list rendering
  * Client workout access
  * Export functionality for clients
  * Permission validation
  * Written by: Simranjit Sandhu

User Preferences (Simranjit Sandhu):
- preferences/page.test.tsx
  * Preferences form rendering
  * Form field validation
  * Save preferences functionality
  * Trainer connection UI
  * Written by: Simranjit Sandhu

API ENDPOINT TESTS:

Workout APIs (Honesty Beaton):
- workouts/route.test.ts
  * POST /api/workouts - Create workout validation
  * GET /api/workouts - Fetch workouts by user
  * DELETE /api/workouts - Delete workout by ID
  * Authentication requirement
  * Written by: Honesty Beaton

Progress APIs (Simranjit Sandhu):
- progress/route.test.ts
  * GET /api/progress - Monthly workout aggregation
  * Data formatting validation
  * Authentication requirement
  * Empty data handling
  * Written by: Simranjit Sandhu

- aggregation/route.test.ts
  * GET /api/aggregation - Daily/weekly/monthly stats
  * Aggregation calculation accuracy
  * Date range filtering
  * Written by: Simranjit Sandhu

Trainer APIs (Simranjit Sandhu):
- trainer/clients/route.test.ts
  * GET /api/trainer/clients - Fetch client list
  * Trainer role requirement
  * Client data formatting
  * Written by: Simranjit Sandhu

- trainer/client-workouts/route.test.ts
  * GET /api/trainer/client-workouts - Permission validation
  * Trainer role requirement (403 if not trainer)
  * Export permission checking
  * Client workout data retrieval
  * Written by: Simranjit Sandhu

Connection APIs (Simranjit Sandhu):
- connections/route.test.ts
  * GET /api/connections - Fetch connections
  * POST /api/connections - Create connection request
  * PUT /api/connections - Update connection status
  * Connection state validation
  * Written by: Simranjit Sandhu

Role Management (Simranjit Sandhu):
- roles/route.test.ts
  * GET /api/roles - Fetch user role
  * Role types: user/trainer/admin
  * Role assignment validation
  * Written by: Simranjit Sandhu

Export APIs (Simranjit Sandhu):
- export/csv/route.test.ts
  * GET /api/export/csv - CSV generation
  * Workout data formatting
  * CSV structure validation
  * Written by: Simranjit Sandhu

- export/csv/integration.test.ts
  * Full CSV export workflow
  * Data retrieval from PostgreSQL
  * File download handling
  * Written by: Simranjit Sandhu

- export/zip/route.test.ts
  * GET /api/export/zip - ZIP file creation
  * Workouts and photos bundling
  * ZIP structure validation
  * Written by: Simranjit Sandhu

User Management (Simranjit Sandhu):
- users/search/route.test.ts
  * GET /api/users/search - User search by query
  * Name and email search
  * Result filtering and pagination
  * Written by: Simranjit Sandhu

Debug Utilities (Simranjit Sandhu):
- debug/check-user/route.test.ts
  * GET /api/debug/check-user - User verification
  * User existence validation
  * Written by: Simranjit Sandhu

- debug/users-list/route.test.ts
  * GET /api/debug/users-list - List all users
  * User data formatting
  * Admin access validation
  * Written by: Simranjit Sandhu

COMPONENT TESTS:

Navigation (Amanda Lyons):
- Navbar.test.tsx
  * Navigation links rendering
  * Active route highlighting
  * Responsive menu behavior
  * Written by: Amanda Lyons

Authentication Guard (Honesty Beaton):
- AuthGuard.test.tsx
  * Protected route access
  * Redirect to login when unauthenticated
  * User session validation
  * Written by: Honesty Beaton

===========================================
5. EXPECTED RESULTS
===========================================
For data collection test:
The script creates a file called dataoutput.json in the same folder
containing fetched workout data.

For Jest unit tests:
  PASS  backend/tests/datacollection.test.ts
  PASS  backend/tests/uploads.test.js
  PASS  src/app/api/users/search/route.test.ts
  PASS  src/app/api/export/csv/route.test.ts
  PASS  src/app/api/export/zip/route.test.ts
  PASS  src/app/api/progress/route.test.ts
  PASS  src/app/api/trainer/client-workouts/route.test.ts
  
  Test Suites: 7 passed, 7 total
  Tests:       25+ passed, 25+ total
  Time:        3-5 seconds

===========================================
6. TROUBLESHOOTING
===========================================
Tests Fail to Run:
- Ensure all dependencies are installed: npm install
- Check that Node.js version is 16 or higher: node --version
- Clear Jest cache: npm test -- --clearCache

Mock Errors:
- Verify mock files exist in __mocks__ directory
- Check __mocks__/next/server.js is present

Module Not Found Errors:
- Install missing dependencies from package.json
- Run npm install to ensure all packages are present

Data Collection Script Fails:
- Ensure dev server is running on port 3003
- Check that API endpoints are accessible
- Verify network connectivity to localhost

Port Conflicts:
- Ensure port 3003 is available
- Kill any existing processes: taskkill /F /IM node.exe (Windows)

Environment Variables:
- Some tests may require .env.local file
- Check that test environment variables are set

===========================================
7. COVERAGE REPORTS
===========================================
To generate code coverage reports:
  npm test -- --coverage

Coverage reports will be generated in:
- coverage/lcov-report/index.html (HTML format - open in browser)
- coverage/lcov.info (LCOV format)
- coverage/coverage-final.json (JSON format)

View HTML coverage report:
  start coverage/lcov-report/index.html

===========================================
8. BEST PRACTICES
===========================================
- Run unit tests before integration tests
- Unit tests should be fast (< 100ms each)
- Each test should be independent and isolated
- Use mocks to avoid external dependencies
- Write descriptive test names
- Test both success and error cases
- Run tests before committing code
- Maintain good code coverage (aim for 80%+)

===========================================
9. ADDITIONAL INFORMATION
===========================================
Test Configuration:
- jest.config.js: Main Jest configuration
- jest.setup.js: Test environment setup

Test File Naming Convention:
- *.test.ts: TypeScript unit tests
- *.test.tsx: React component tests
- *.test.js: JavaScript unit tests

For more information, see:
- jest.config.js (test configuration)
- package.json (test scripts)
- __mocks__/ (mock implementations)