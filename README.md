# Zwanan Jawkhela

Welcome to the Zwanan Jawkhela project!

## Admin Setup Instructions

To enable and use the Admin Dashboard, please follow these steps carefully:

1. **Enable Firebase Email/Password Authentication**
   - Go to your Firebase Console (Project: `data-1-d387e`).
   - Navigate to **Authentication** > **Sign-in method**.
   - Enable the **Email/Password** provider.

2. **Create an Admin User**
   - In the **Authentication** > **Users** tab, click **Add User**.
   - Enter your email and password, and create the user.

3. **Copy the User UID**
   - Once the user is created, copy the unique **User UID** displayed in the table next to their email.

4. **Create the Admin Member Document in Firestore**
   - Navigate to **Firestore Database** in the Firebase Console.
   - Start a collection named `members`.
   - Use the **User UID** you copied as the Document ID.
   - Add the following fields to the document:
     - `role`: string, value `"admin"`
     - `status`: string, value `"approved"`

5. **Deploy the Updated Project to Vercel**
   - Ensure all these code changes are pushed to your `main` branch.
   - Vercel will automatically build and deploy.
   - Verify that your environment variables (e.g. `VITE_FIREBASE_API_KEY`) are correctly set in the Vercel project settings.

Once deployed, visit `https://jawkhela-zwanan1.vercel.app/#/admin` (or click the Admin link at the bottom of the page) to log in!
