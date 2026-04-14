# Firebase Google Auth Implementation Plan

The goal of this change is to add "Sign in with Google" using Firebase to your existing MERN stack authentication system. This will run seamlessly alongside your current Email/Password JWT authentication.

## User Review Required

> [!WARNING]
> Implementing Firebase requires you to create your own Firebase project in the Firebase Console and generate API keys. I will write the code to support it, but you must provide the environment variables yourself.

## Proposed Architecture

When a user clicks "Sign in with Google":
1. **Frontend (Firebase SDK)** opens a Google popup and securely authenticates the user.
2. The frontend receives a unique, short-lived **Firebase ID Token**.
3. The frontend sends this token to a new REST API endpoint on your Node backend: `/api/v1/auth/google`.
4. **Backend (Firebase Admin)** verifies the cryptographic signature of the token to ensure it wasn't forged.
5. The backend extracts the user's email. If the user exists in your MongoDB, they are logged in. If they don't exist, a new MongoDB `User` document is created automatically.
6. The backend issues your standard JWT token and sends it back to the frontend, exactly like the normal login flow.

## Proposed Changes

### [MODIFY] backend/package.json
- Install `firebase-admin` to verify tokens natively in Node.js.

### [MODIFY] backend/models/User.js
- Make the `password` field optional (or generate a random hash for Google users), since users signing up via Google won't provide a password. Add a `authProvider` flag (e.g., `'local'` vs `'google'`).

### [NEW] backend/config/firebase-admin.js
- Initialize the Firebase Admin SDK using your service account credentials from `.env`.

### [MODIFY] backend/routes/auth.js
- Create a new `router.post('/google')` endpoint that receives the token, authenticates it with `firebase-admin`, and handles the MongoDB user lookup/creation and JWT signing.

### [MODIFY] frontend/package.json
- Install the frontend `firebase` package.

### [NEW] frontend/src/firebase.js
- Your frontend Firebase initialization file (using your public Firebase config).

### [MODIFY] frontend/src/components/auth/Login.jsx & Register.jsx
- Add a beautiful "Continue with Google" button.
- Integrate the Firebase popup flow and `axios` call to your new backend route.

## Open Questions

> [!IMPORTANT]
> 1. Do you already have a Firebase project created, or do you need me to provide step-by-step instructions on how to create one and get the API keys?
> 2. Currently, your User schema requires a `password`. Should I make `password` optional, or simply assign a random, impossible-to-guess 64-character hash for users who register exclusively through Google?
> 3. Does this architectural plan look good to you? Approve it to proceed with the code changes.
