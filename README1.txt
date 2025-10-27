README1.txt
============

Project Title: RepsNRecord Fitness Tracker
Author: Amanda Lyons, Simranjit Sandhu, Honesty Beaton, Caleb Miller
Date: October 2025

---------------------------------------------
1. Description
---------------------------------------------
RepsNRecord is a fitness tracking web application that allows users to log workouts, 
view monthly progress calendars, and upload progress photos. It uses Next.js for the frontend, 
Node.js/Express for the backend API, and MongoDB for data storage. Firebase handles authentication.

---------------------------------------------
2. Project Structure
---------------------------------------------
/public                → Static assets (images, icons, etc.)
/src
 ├── /app              → Main Next.js application
 │    ├── /components  → Reusable UI components
 │    └── /lib         → Helper libraries and utilities
 │         ├── firebase.ts → Firebase configuration and authentication
 │         ├── mongodb.ts  → MongoDB connection helper
 │         └── useAuth.ts  → Custom React hook for authentication state
/models                → Mongoose or schema definitions
.env.local             → Environment variables (excluded from Git)
package.json           → Dependencies and scripts
README1.txt            → Instructions for running the main code
README2.txt            → Instructions for running unit tests

---------------------------------------------
3. How to Run the Code
---------------------------------------------
Step 1: Install Node.js (v18+ recommended)
    https://nodejs.org/

Step 2: Install project dependencies
    npm install

Step 3: Configure environment variables  
    Create a file named `.env.local` in the project root with the following:
        MONGODB_URI=mongodb+srv://<your-connection-string>
        NEXT_PUBLIC_FIREBASE_API_KEY=<your-firebase-key>
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<your-firebase-auth-domain>

Step 4: Run the development server
    npm run dev

Step 5: Open the app in your browser
    http://localhost:3000

---------------------------------------------
4. Notes
---------------------------------------------
- All TypeScript files (.ts) include inline comments explaining functionality.
- Modify MongoDB or Firebase configuration in `/src/app/lib/`.
- Production build command:
    npm run build && npm start

---------------------------------------------
5. References
---------------------------------------------
- https://nextjs.org/docs
- https://firebase.google.com/docs/web/setup
- https://www.mongodb.com/docs
