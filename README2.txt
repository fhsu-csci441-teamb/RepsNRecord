===========================================
    REPS N RECORD - UNIT TESTING GUIDE
===========================================

Project: RepsNRecord
Authors: Amanda Lyons, Simranjit Sandhu, Honesty Beaton, Caleb Miller
Date: October 2025
Updated: Photo Upload Feature Tests Added

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

The project includes comprehensive unit tests for:

✓ Backend Photo Upload API (Upload/Fetch/Delete endpoints)
✓ Frontend Components (Pictures Page)
✓ Database Integration (PostgreSQL schema and connections)
✓ Firebase Authentication (planned)
✓ MongoDB Connections (planned)

Testing Frameworks Used:
- Jest: Test runner and assertion library
- Supertest: HTTP endpoint testing for Express backend
- React Testing Library: Component testing for React/Next.js frontend

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

Frontend Tests:
├── src/app/pictures/__tests__/
│   └── page.test.tsx          (Pictures page component tests)

Backend Tests:
├── backend/tests/
│   └── uploads.test.js        (Photo upload API tests)
│   └── fixtures/
│       └── test-image.jpg     (Auto-generated test image)

Configuration:
├── jest.config.js             (Frontend Jest config)
├── jest.setup.js              (Frontend test setup)
├── backend/package.json       (Backend Jest config)

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
6. BACKEND API TESTS
===========================================

Location: backend/tests/uploads.test.js

The backend tests cover:

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

4. Database Integration
   ✓ PostgreSQL connection test
   ✓ Schema validation (photos table structure)

===========================================
7. FRONTEND COMPONENT TESTS
===========================================

Location: src/app/pictures/__tests__/page.test.tsx

The frontend tests cover:

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

===========================================
8. WRITING NEW TESTS
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
9. TROUBLESHOOTING
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
10. QUICK REFERENCE
===========================================

Command                     Description
------------------------------------------------------------------------
npm run test:all           Run all tests (frontend + backend)
npm test                   Run frontend tests
cd backend && npm test     Run backend tests
npm run test:watch         Run tests in watch mode (auto-rerun)
npm test -- --coverage     Run with coverage report
npm test -- --verbose      Run with detailed output
npm test -- file.test.js   Run specific test file

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
ADDITIONAL RESOURCES
===========================================

- Jest Documentation: https://jestjs.io/docs/getting-started
- React Testing Library: https://testing-library.com/docs/react-testing-library/intro/
- Supertest: https://github.com/visionmedia/supertest
- Testing Best Practices: https://testingjavascript.com/

Happy Testing! 🧪
