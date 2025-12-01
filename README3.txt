===========================================
    REPS N RECORD - INTEGRATION TESTS 
===========================================

Project: RepsNRecord
Authors: Amanda Lyons, Simranjit Sandhu, Honesty Beaton, Caleb Miller
Date: October 2025

===========================================
1. INSTALL DEPENDENCIES
===========================================
-- npm install
-- if any error occurs: 
-- npm install --save-dev jest supertest ts-node @types/jest @types/supertest

===========================================
2. START APP
===========================================
Ensure app is running with command
npm run dev

===========================================
3: RUN INTEGRATION TEST
===========================================
npx jest backend/tests/integrationtests.ts

===========================================
4. RESULTS
===========================================
You should see test results for:
- Creating a workout
- Fetching workouts
- Deleting a workout
