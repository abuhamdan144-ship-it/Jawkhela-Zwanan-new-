# Zwanan Community Platform

A comprehensive community platform featuring a public-facing website and a secure administrative dashboard. This platform is built with React, Vite, Tailwind CSS, and uses Firebase for authentication, database (Firestore), and file uploads (Cloud Storage).

## Getting Started

To deploy this project to your own infrastructure or run it locally, you need to configure your own Firebase project. Follow the detailed step-by-step instructions below.

---

### Step 1: Firebase Project Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Create a project** (or add this to an existing one).
3. Once the project is ready, click the **Web** icon (</>) to register a new Web App.
4. Copy the provided Firebase configuration keys.
5. In the root of your project directory, create a `.env` file (you can copy `.env.example` if it exists) and add your keys:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

### Step 2: Enabling Firebase Authentication

The admin dashboard and the member registration system both require Firebase Authentication.

1. In the left-hand menu of the Firebase Console, go to **Build > Authentication**.
2. Click **Get Started**.
3. Navigate to the **Sign-in method** tab.
4. Under "Native providers", click **Email/Password**.
5. Enable the **Email/Password** toggle and click **Save**.

---

### Step 3: Configuring Firestore Database & Security Rules

The platform uses Firestore to securely store programs, team members, news, and member data.

1. In the Firebase Console, go to **Build > Firestore Database**.
2. Click **Create database** (you can start in test mode or production mode, as we will override the rules next).
3. Choose a location for your database and click **Enable**.
4. Once created, go to the **Rules** tab in the Firestore dashboard.
5. Open the `firestore.rules` file from this repository, copy its entire contents, and paste it into the Firebase Console rules editor.
6. Click **Publish**.

*(Note: These rules ensure that only authenticated administrators can create or edit global content, while allowing public read access. It also restricts regular users to only updating their own membership profiles).*

---

### Step 4: Configuring Firebase Storage (For Profile Photos)

The member registration form allows users to upload profile photos, which are saved in Firebase Storage.

1. In the Firebase Console, go to **Build > Storage**.
2. Click **Get Started** and proceed through the setup wizard (default settings are fine).
3. Once Storage is provisioned, go to the **Rules** tab.
4. Open the `storage.rules` file from this repository, copy its contents, and paste them into the console.
5. Click **Publish**.

*(Note: These rules ensure that users can only upload profile photos smaller than 5MB to their specific UID folder, and only admins can manage global gallery images).*

---

### Step 5: Setting up the Initial Administrator Account

To access the administrative dashboard located at `/admin`, you must have an account with strict administrator privileges in Firestore.

**If you are testing in the AI Studio environment:**
An administrator account is already provisioned for you.
- **Username / Email:** `Adminzj` (or `Adminzj@zwanan.com`)
- **Password:** `123456`

**To create your own admin account manually on a fresh Firebase project:**
1. In the Firebase Console, go to **Authentication > Users**.
2. Click **Add user**. Enter a secure email (e.g., `admin@yourdomain.com`) and a password, then click **Add user**.
3. After the user is created, copy their **User UID** from the table.
4. Navigate to **Build > Firestore Database**.
5. If it doesn't exist yet, click **Start collection** and name it `members`.
6. For the **Document ID**, paste the **User UID** you copied in Step 3.
7. Add the following fields to this document exactly as shown:
   - Field: `email` | Type: `string` | Value: `admin@yourdomain.com`
   - Field: `name` | Type: `string` | Value: `Admin User`
   - Field: `role` | Type: `string` | Value: `admin`
   - Field: `status` | Type: `string` | Value: `approved`
8. Click **Save**.

You can now log in to the `/admin` route of your application using the credentials you just created!
