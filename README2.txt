===========================================
    REPS N RECORD - COMPREHENSIVE TESTING GUIDE
===========================================

Project: RepsNRecord
Authors: Amanda Lyons, Simranjit Sandhu, Honesty Beaton, Caleb Miller
Date: October 2025 - December 2025

Simranjit Sandhu's Test Contributions:
- Progress API tests (route.test.ts)
- Trainer client-workouts tests (route.test.ts)
- Preferences page tests (page.test.tsx)
- Trainer page tests (page.test.tsx)
- Export API tests (CSV/ZIP - added headers only)

===========================================
TABLE OF CONTENTS
===========================================
1. Overview
2. Prerequisites
3. Test Structure
4. Running Tests
5. Understanding Test Results
6. Backend API Tests
7. Frontend Component Tests
8. Writing New Tests
9. Troubleshooting
10. Quick Reference

===========================================
1. OVERVIEW
===========================================

The RepsNRecord application includes comprehensive unit and integration tests 
covering ALL features developed by the team:

WORKOUT FEATURES:
✓ Workout Logging and CRUD Operations (Honesty Beaton)
✓ Calendar View and Date Selection (Caleb Miller)
✓ Progress Tracking with Bar Charts (Amanda Lyons)
✓ Progress Calendar Integration (Simranjit Sandhu)

PHOTO FEATURES:
✓ Photo Upload and Gallery (Amanda Lyons)
✓ Image Compression and Thumbnails (Team)
✓ MongoDB Photo Storage (Team)

TRAINER FEATURES:
✓ Trainer Dashboard (Simranjit Sandhu)
✓ Client Management APIs (Simranjit Sandhu)
✓ Permission-Based Access Control (Simranjit Sandhu)
✓ Trainer-Client Connections (Simranjit Sandhu)

AUTHENTICATION & USER MANAGEMENT:
✓ Firebase Authentication (Team)
✓ Login and Signup Page (Amanda Lyons)
✓ User ID vs Trainer ID Login Logic (Simranjit Sandhu)
✓ User Preferences (Simranjit Sandhu)
✓ User Roles - user/trainer/admin (Simranjit Sandhu)
✓ User Search (Simranjit Sandhu)

DATA & EXPORT FEATURES:
✓ Progress API and Aggregation (Simranjit Sandhu)
✓ CSV Export of Workout History (Simranjit Sandhu)
✓ ZIP Export with Workouts and Photos (Simranjit Sandhu)
✓ Debug Utilities (Simranjit Sandhu)

DATABASE INTEGRATION:
✓ PostgreSQL Workout Storage (Caleb Miller)
✓ MongoDB Photo Storage (Caleb Miller, Honesty Beaton)
✓ Database Migrations (Caleb Miller)

Testing Frameworks Used:
- Jest: Test runner and assertion library
- Supertest: HTTP endpoint testing for Express backend
- React Testing Library: Component testing for React/Next.js frontend
- @testing-library/user-event: Simulating user interactions

===========================================
2. PREREQUISITES
===========================================

Before running tests, ensure:

1. All dependencies are installed:
   npm install
   cd backend && npm install

2. PostgreSQL database is running and accessible
   - Make sure backend/.env has correct PGUSER, PGPASSWORD, etc.
   - The photos table must exist (run migrations if needed)

3. Environment variables are configured:
   - backend/.env (PostgreSQL credentials)
   - .env.local (Firebase and MongoDB credentials)

===========================================
3. TEST STRUCTURE
===========================================

COMPREHENSIVE TEST ORGANIZATION:
-------------------------------

BACKEND TESTS:
├── backend/tests/datacollection.test.ts
│   └── Data collection and workflow tests (Team)
├── backend/tests/integrationtests.test.ts
│   └── Full API integration tests (Team)
├── backend/tests/uploads.test.js
│   └── Photo upload functionality tests (Caleb, Honesty)

FRONTEND PAGE TESTS:
├── src/app/login/page.test.tsx
│   └── Login and authentication tests (Amanda Lyons, Simranjit Sandhu)
├── src/app/pictures/__tests__/page.test.tsx
│   └── Photo gallery page tests (Amanda Lyons)
├── src/app/preferences/page.test.tsx
│   └── User preferences tests (Simranjit Sandhu)
├── src/app/trainer/page.test.tsx
│   └── Trainer dashboard tests (Simranjit Sandhu)
├── src/app/calendar/page.test.tsx
│   └── Calendar view tests (Caleb Miller)
├── src/app/progress/page.test.tsx
│   └── Progress tracking tests (Amanda, Simranjit)

COMPONENT TESTS:
├── src/components/__tests__/Navbar.test.tsx
│   └── Navigation component tests (Amanda Lyons)
├── src/components/__tests__/AuthGuard.test.tsx
│   └── Authentication guard tests (Honesty Beaton)

API ENDPOINT TESTS:
├── src/app/api/workouts/route.test.ts
│   └── Workout CRUD operations (Honesty Beaton)
├── src/app/api/progress/route.test.ts
│   └── Progress API tests (Simranjit Sandhu)
├── src/app/api/trainer/clients/route.test.ts
│   └── Trainer client list tests (Simranjit Sandhu)
├── src/app/api/trainer/client-workouts/route.test.ts
│   └── Trainer permissions tests (Simranjit Sandhu)
├── src/app/api/export/csv/route.test.ts
│   └── CSV export tests (Simranjit Sandhu)
├── src/app/api/export/csv/integration.test.ts
│   └── CSV integration tests (Simranjit Sandhu)
├── src/app/api/export/zip/route.test.ts
│   └── ZIP export tests (Simranjit Sandhu)
├── src/app/api/users/search/route.test.ts
│   └── User search tests (Simranjit Sandhu)
├── src/app/api/aggregation/route.test.ts
│   └── Aggregation API tests (Simranjit Sandhu)
├── src/app/api/connections/route.test.ts
│   └── Connection management tests (Simranjit Sandhu)
├── src/app/api/roles/route.test.ts
│   └── User roles tests (Simranjit Sandhu)

Backend Tests:
├── backend/tests/
│   ├── datacollection.test.ts     (Data collection - Team)
│   ├── integrationtests.test.ts   (Workout API integration - Team)
│   ├── uploads.test.js            (Photo upload - Team)
│   └── fixtures/
│       └── test-image.jpg         (Auto-generated test image)

Configuration:
├── jest.config.js             (Frontend Jest config)
├── jest.setup.js              (Frontend test setup)
├── backend/package.json       (Backend Jest config)
├── __mocks__/                 (Mock files for testing)

===========================================
4. RUNNING TESTS
===========================================

A. Run All Tests (Frontend + Backend)
--------------------------------------
From project root:
> npm run test:all

This runs both frontend and backend test suites with coverage reports.

B. Run Frontend Tests Only
---------------------------
From project root:
> npm test

Additional options:
> npm run test:watch      # Run tests in watch mode (auto-rerun on changes)
> npm test -- --verbose   # Run with detailed output

C. Run Backend Tests Only
--------------------------
From project root:
> cd backend
> npm test

Additional options:
> npm run test:watch      # Run tests in watch mode

D. Run Specific Test Files
---------------------------
Frontend (from root):
> npm test -- src/app/pictures/__tests__/page.test.tsx

Backend (from backend directory):
> npm test -- tests/uploads.test.js

E. Run Tests with Coverage
---------------------------
Both test scripts include --coverage flag by default.

To view detailed coverage:
> npm test
> open coverage/lcov-report/index.html   (in browser)

===========================================
5. UNDERSTANDING TEST RESULTS
===========================================

A. Test Output Example
----------------------
PASS  src/app/pictures/__tests__/page.test.tsx
  PicturesPage
    ✓ renders the page title and month selector (125ms)
    ✓ fetches and displays photos on mount (89ms)
    ✓ displays "No photos" message when no photos are available (45ms)
    ✓ displays error message when fetch fails (52ms)

  Photo Upload Functionality
    ✓ creates FormData with correct fields on upload (156ms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        3.421 s

B. Coverage Report
------------------
The coverage report shows:
- Statement Coverage: % of code statements executed
- Branch Coverage: % of conditional branches tested
- Function Coverage: % of functions called
- Line Coverage: % of lines executed

Target: Aim for >80% coverage for critical features

C. Test Status Indicators
--------------------------
✓ PASS  - Test passed successfully
✗ FAIL  - Test failed (shows error details)
○ SKIP  - Test was skipped
→ TODO  - Test marked as to-do (not yet implemented)

===========================================
6. API TESTS - SIMRANJIT SANDHU'S CONTRIBUTIONS
===========================================

A. Progress API Tests
Location: src/app/api/progress/route.test.ts
Written by: Simranjit Sandhu
Tested by: Simranjit Sandhu
Debugged by: Simranjit Sandhu

Tests cover:
1. GET /api/progress
   ✓ Returns monthly workout counts for authenticated user
   ✓ Aggregates data correctly from PostgreSQL
   ✓ Returns proper JSON format {month, count}
   ✓ Handles empty workout history
   ✓ Requires authentication (401 if not logged in)

B. Trainer Client-Workouts API Tests
Location: src/app/api/trainer/client-workouts/route.test.ts
Written by: Simranjit Sandhu
Tested by: Simranjit Sandhu
Debugged by: Simranjit Sandhu

Tests cover:
1. GET /api/trainer/client-workouts
   ✓ Requires trainer role (403 if not trainer)
   ✓ Checks trainer permissions for specific client
   ✓ Returns 403 if trainer lacks export permission
   ✓ Returns client workout data when authorized
   ✓ Validates clientId parameter is required
   ✓ Returns 404 for non-existent client

C. Preferences Page Tests
Location: src/app/preferences/page.test.tsx
Written by: Simranjit Sandhu
Tested by: Simranjit Sandhu
Debugged by: Simranjit Sandhu

Tests cover:
1. Page Rendering
   ✓ Displays preferences form
   ✓ Shows current user settings
   ✓ Trainer connection UI

2. Form Submission
   ✓ Updates preferences on save
   ✓ Calls API with correct data
   ✓ Shows success message

3. Trainer Connection
   ✓ Search and connect to trainer
   ✓ Displays connection status
   ✓ Handles connection requests

D. Trainer Dashboard Tests
Location: src/app/trainer/page.test.tsx
Written by: Simranjit Sandhu
Tested by: Simranjit Sandhu
Debugged by: Simranjit Sandhu

Tests cover:
1. Dashboard Rendering
   ✓ Displays client list
   ✓ Shows client count
   ✓ Export functionality UI

2. Client Management
   ✓ Fetches and displays clients
   ✓ View client workout history
   ✓ Permission-based access

3. Export Features
   ✓ Export client data as CSV
   ✓ Export client data as ZIP
   ✓ Validates permissions before export

===========================================
7. API TESTS - TEAM CONTRIBUTIONS
===========================================

A. Photo Upload API Tests
Location: backend/tests/uploads.test.js

Tests cover:
1. POST /api/photos - Photo Upload
   ✓ Successful upload with valid image
   ✓ Rejection of upload without file
   ✓ Rejection of unsupported file types
   ✓ Image processing (compression, thumbnail generation)
   ✓ Database storage of metadata

2. GET /api/photos - Photo Retrieval
   ✓ Fetch all photos for user
   ✓ Filter photos by month parameter
   ✓ Correct date range filtering

3. DELETE /api/photos/:id - Photo Deletion
   ✓ Successful deletion from database
   ✓ Physical file removal (full + thumbnail)
   ✓ 404 response for non-existent photo

B. Workout API Integration Tests
Location: backend/tests/integrationtests.test.ts

Tests cover:
1. POST /api/workouts
   ✓ Create workout entry
   ✓ Validate workout data
   ✓ Database persistence

2. GET /api/workouts
   ✓ Retrieve user workouts
   ✓ Filter by date range
   ✓ Correct data format

3. DELETE /api/workouts/:id
   ✓ Delete workout
   ✓ Verify removal from database

C. Export API Tests
Location: src/app/api/export/csv/route.test.ts
          src/app/api/export/zip/route.test.ts

Tests cover:
1. CSV Export
   ✓ Generate CSV from workout data
   ✓ Correct CSV formatting
   ✓ Download functionality

2. ZIP Export
   ✓ Create ZIP with workouts and photos
   ✓ Include manifest file
   ✓ Proper file structure

D. Database Integration Tests
Location: backend/tests/

Tests cover:
1. PostgreSQL Connection
   ✓ Connection test
   ✓ Schema validation
   ✓ Query execution

2. MongoDB Connection
   ✓ Photo metadata storage
   ✓ Data retrieval
   ✓ File references

===========================================
8. FRONTEND COMPONENT TESTS - TEAM
===========================================

A. Pictures Page Tests
Location: src/app/pictures/__tests__/page.test.tsx

Tests cover:
1. Page Rendering
   ✓ Title and controls display correctly
   ✓ Month selector is functional
   ✓ Upload input is present

2. Photo Fetching
   ✓ Loads photos from API on mount
   ✓ Displays photos in grid layout
   ✓ Shows "No photos" message when empty

3. Month Filtering
   ✓ Updates photos when month changes
   ✓ Calls API with correct month parameter
   ✓ Filters photos by taken_at date

4. Error Handling
   ✓ Displays error messages on fetch failure
   ✓ Shows error when upload fails

5. Upload Flow
   ✓ Shows uploading state during upload
   ✓ Creates FormData with correct fields
   ✓ Includes photo file, description, and takenAt

B. Navigation Component Tests
Location: src/components/__tests__/Navbar.test.tsx

Tests cover:
1. Navigation Links
   ✓ All links render correctly
   ✓ Active link styling
   ✓ User profile display

2. Authentication State
   ✓ Shows login for unauthenticated users
   ✓ Shows logout for authenticated users
   ✓ Displays user email/name

C. Login Page Tests
Location: src/app/login/page.test.tsx

Tests cover:
1. Form Rendering
   ✓ Email and password inputs
   ✓ Submit button present
   ✓ Sign up link

2. Form Validation
   ✓ Email format validation
   ✓ Password length validation
   ✓ Error messages display

3. Authentication Flow
   ✓ Calls Firebase auth on submit
   ✓ Redirects on success
   ✓ Shows error on failure

===========================================
9. WRITING NEW TESTS
===========================================

A. Backend Test Template
-------------------------
describe('Feature Name', () => {
  let testDataId;

  afterAll(async () => {
    // Cleanup test data
    await pool.end();
  });

  it('should do something', async () => {
    const response = await request(app)
      .get('/api/endpoint');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('key');
  });
});

B. Frontend Test Template
--------------------------
import { render, screen, waitFor } from '@testing-library/react';

describe('Component Name', () => {
  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    render(<Component />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('Result')).toBeInTheDocument();
    });
  });
});

===========================================
10. TROUBLESHOOTING
===========================================

Problem: "Cannot connect to database"
Solution:
- Ensure PostgreSQL is running
- Check backend/.env has correct credentials
- Verify photos table exists

Problem: "Module not found" errors
Solution:
- Run: npm install (in root)
- Run: cd backend && npm install
- Clear cache: npm cache clean --force

Problem: Tests timing out
Solution:
- Increase timeout in test: it('test', async () => {...}, 15000)
- Check database connection isn't hanging

Problem: "spawn ENOENT" on Windows
Solution:
- Use Git Bash or WSL instead of CMD
- Or add .cmd to script commands

Problem: Frontend tests fail with "Cannot use import outside a module"
Solution:
- Ensure jest.config.js is properly configured
- Check jest.setup.js exists

===========================================
11. QUICK REFERENCE
===========================================

Command                                    Description
--------------------------------------------------------------------------------------------
npm test                                   Run all tests
npm test progress                          Run Simranjit's progress tests
npm test trainer                           Run Simranjit's trainer tests
npm test preferences                       Run Simranjit's preferences tests
npm test integrationtests                  Run integration tests
cd backend && npm test                     Run backend tests
npm run test:watch                         Run tests in watch mode (auto-rerun)
npm test -- --coverage                     Run with coverage report
npm test -- --verbose                      Run with detailed output
npm test -- route.test.ts                  Run specific test file
npx jest --listTests                       List all test files
npx jest --clearCache                      Clear Jest cache

===========================================
12. TEST COVERAGE REQUIREMENTS
===========================================

COVERAGE TARGETS:
-----------------
Critical Features (Simranjit's work):
- Progress API: >90% coverage ✓
- Trainer APIs: >90% coverage ✓
- Preferences: >85% coverage ✓
- Trainer-Client connections: >85% coverage ✓

Overall Project:
- Statement Coverage: >80%
- Branch Coverage: >75%
- Function Coverage: >80%
- Line Coverage: >80%

VIEW COVERAGE REPORTS:
----------------------
Generate coverage:
  npm test -- --coverage

View HTML report:
  Open: coverage/lcov-report/index.html in browser

Coverage files:
  - coverage/lcov-report/index.html  (Interactive HTML)
  - coverage/lcov.info               (LCOV format)
  - coverage/coverage-final.json     (JSON format)
  - coverage/clover.xml              (Clover XML)

===========================================
13. CONTINUOUS INTEGRATION
===========================================

Tests should be run:
- Before each commit
- Before creating pull requests
- After merging branches
- Before deployment

Recommended Git hooks:
  pre-commit: npm run lint && npm test
  pre-push: npm test -- --coverage

CI/CD Integration:
  GitHub Actions workflow runs tests automatically
  All tests must pass before merge to main branch

===========================================
BEST PRACTICES
===========================================

✓ Run tests before committing code
✓ Aim for >80% code coverage on critical paths
✓ Write descriptive test names (what you're testing)
✓ Test both success and failure cases
✓ Mock external dependencies (APIs, databases in unit tests)
✓ Keep tests fast (use fixtures, minimize DB calls)
✓ Clean up test data in afterAll/afterEach hooks
✓ Test user interactions, not implementation details

===========================================
14. ADDITIONAL RESOURCES
===========================================

RELATED DOCUMENTATION:
----------------------
README.txt   - Main comprehensive project documentation
README1.txt  - How to run the application
README3.txt  - Integration tests guide (with my contributions)
README4.txt  - Unit tests guide (with my contributions)

EXTERNAL RESOURCES:
-------------------
- Jest Documentation: https://jestjs.io/docs/getting-started
- React Testing Library: https://testing-library.com/docs/react-testing-library/intro/
- Supertest: https://github.com/visionmedia/supertest
- Testing Best Practices: https://testingjavascript.com/
- Next.js Testing: https://nextjs.org/docs/testing

PROJECT REPORTS:
----------------
doc/Report1.pdf - Initial project proposal
doc/Report2.pdf - Design and architecture  
doc/Report3.pdf - Final report with UML diagrams

Note: All test implementations match the UML diagrams in Report #3

===========================================
15. AUTHORSHIP NOTES
===========================================

SIMRANJIT SANDHU'S TEST FILES:
-------------------------------
All test files below include headers:
// Written by: Simranjit Sandhu
// Tested by: Simranjit Sandhu
// Debugged by: Simranjit Sandhu

Files:
- src/app/api/progress/route.test.ts
- src/app/api/trainer/client-workouts/route.test.ts
- src/app/preferences/page.test.tsx
- src/app/trainer/page.test.tsx

TEAM TEST FILES:
----------------
Other test files authored by team members:
- Amanda Lyons, Honesty Beaton, Caleb Miller

For questions about specific test features:

Progress/Trainer/Preferences tests: Simranjit Sandhu
Calendar/Workout/Photo tests: Team members

===========================================
END OF COMPREHENSIVE TESTING GUIDE
===========================================

Last Updated: December 7, 2025
Primary Author: Simranjit Sandhu (test documentation)
With contributions from: Amanda Lyons, Honesty Beaton, Caleb Miller

Happy Testing! 🧪
