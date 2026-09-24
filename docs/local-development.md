# Local Development & Firebase Emulator Guide

This guide describes how to run, test, and develop the **Disaster Alert & Community Response** application locally using Vite and the **Firebase Local Emulator Suite**.

---

## 🚀 Environment Options

The project supports three explicit execution modes:
1. **Local Vite Dev Server (Live Firebase Project)**
2. **Local Vite Dev Server + Firebase Local Emulator Suite**
3. **Production Firebase Hosting Build**

---

## 🛠 Prerequisites

Ensure you have installed:
* Node.js v18+ or v20+
* npm v9+
* Firebase CLI (`npm install -g firebase-tools` or via `npx firebase`)
* Java Development Kit (JDK) 11+ (Required by Firebase Local Emulators)

---

## 🔧 Configuring Environment Variables

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

To enable emulator mode, set:
```env
VITE_USE_FIREBASE_EMULATOR=true
VITE_FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
VITE_FIREBASE_FIRESTORE_EMULATOR_HOST=localhost:8080
VITE_FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199
```

When `VITE_USE_FIREBASE_EMULATOR=true`, `src/config/firebase.ts` connects the Firebase Auth, Firestore, and Storage SDKs to local emulator ports instead of live cloud instances.

---

## 🧪 Running Firebase Local Emulator Suite

Start the emulators:

```bash
npm run emulators
# OR
npx firebase emulators:start --only auth,firestore,hosting
```

The emulators spin up:
* **Firebase Auth Emulator:** `localhost:9099`
* **Cloud Firestore Emulator:** `localhost:8080`
* **Firebase Emulator UI:** `http://127.0.0.1:4000`

---

## 💻 Running the Frontend Dev Server

In a separate terminal window:

```bash
npm run dev
```

Open `http://localhost:5173`.

---

## 🔐 Authentication & Profile Workflows in Emulator Mode

1. **Register User:** Go to `/register`, fill in details (+91 phone, 6-digit PIN code). User account will be created in Auth Emulator and profile saved to Firestore Emulator `users/{uid}` with `role: "CITIZEN"`.
2. **Inspect Data:** View created auth users and Firestore documents at `http://127.0.0.1:4000` (Emulator UI).
3. **Test Route Protection:** Navigating directly to `/dashboard` or `/profile` while logged out will automatically redirect to `/login`.
