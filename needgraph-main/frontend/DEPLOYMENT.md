# NeedGraph — Deployment Guide

## Prerequisites

1. [Node.js 20+](https://nodejs.org/)
2. [Firebase CLI](https://firebase.google.com/docs/cli): `npm install -g firebase-tools`
3. A Google Cloud / Firebase project on the **Blaze (pay-as-you-go)** plan

---

## Step 1 — Create Firebase Project

```bash
firebase login
firebase projects:create needgraph-prod --display-name "NeedGraph"
```

## Step 2 — Enable Services

In the Firebase Console:
- **Authentication** → Enable Email/Password + Google Sign-in
- **Firestore** → Create database (Asia South 1 region)
- **Functions** → Enable
- **Storage** → Enable
- **Cloud Messaging** → Generate VAPID key

## Step 3 — Configure Environment Variables

Copy `.env.local` and fill in real values:

```bash
cd frontend
cp .env.local .env.local.real
# Edit .env.local with your Firebase config from console
# Set VITE_USE_FIREBASE=true
```

## Step 4 — Deploy Firestore Rules & Indexes

```bash
cd frontend
firebase deploy --only firestore:rules,firestore:indexes
```

## Step 5 — Deploy Cloud Functions

```bash
cd ../functions
npm install
npm run build
firebase deploy --only functions
```

## Step 6 — Seed Data (Optional)

```bash
cd ../scripts
npx ts-node seed.ts
```

## Step 7 — Build & Deploy Frontend

```bash
cd ../frontend
npm run build
firebase deploy --only hosting
```

---

## WhatsApp Webhook Testing with ngrok

WhatsApp integration uses Twilio's API. For local development and testing:

### Setup

```bash
# Install ngrok
npm install -g ngrok

# Or download from https://ngrok.com/download
```

### Testing Flow

1. **Start Firebase Emulator** (in the `functions/` directory):
   ```bash
   firebase emulators:start --only functions
   ```
   This starts functions on `http://localhost:5001`

2. **Start ngrok tunnel** (in a separate terminal):
   ```bash
   ngrok http 5001
   ```
   Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

3. **Configure Twilio Webhook**:
   - Go to [Twilio Console](https://console.twilio.com/) → Messaging → WhatsApp Sandbox
   - Set webhook URL to:
     ```
     https://abc123.ngrok-free.app/YOUR_PROJECT_ID/asia-south1/parseWhatsAppReport
     ```
   - Method: POST

4. **Test by sending a WhatsApp message** to your Twilio sandbox number:
   ```
   "Urgent: 50 families without food in Kukatpally area since 3 days"
   ```

5. **Verify** in the Firebase Emulator UI (`http://localhost:4000`):
   - Check Firestore → `needs` collection for the new document
   - Check `activityFeed` for the audit entry
   - The WhatsApp sender should receive an acknowledgment

### Production Webhook

For production, the webhook URL is:
```
https://asia-south1-YOUR_PROJECT_ID.cloudfunctions.net/parseWhatsAppReport
```

Set this in Twilio Console → Messaging → Settings → WhatsApp Configuration.

---

## Vertex AI Setup

1. Enable **Vertex AI API** in Google Cloud Console
2. Grant the Cloud Functions service account `Vertex AI User` role
3. The `computeSeverityScore` function will automatically use Vertex AI

---

## Environment Variables Reference

### Frontend (`.env.local`)

| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | FCM sender ID |
| `VITE_FIREBASE_APP_ID` | App ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Analytics measurement ID |
| `VITE_FIREBASE_DATABASE_URL` | Realtime DB URL |
| `VITE_USE_FIREBASE` | `true` to enable Firebase, `false` for mock mode |

### Functions (set via `firebase functions:config:set`)

| Variable | Description |
|---|---|
| `twilio.account_sid` | Twilio Account SID |
| `twilio.auth_token` | Twilio Auth Token |
| `twilio.whatsapp_number` | Twilio WhatsApp sandbox number |
