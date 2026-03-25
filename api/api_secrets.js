// api/api_secrets.js
import admin from 'firebase-admin';

export default function handler(req, res) {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT1_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          vapidKey: process.env.VAPID_KEY,
        }),
      });
    }

    res.status(200).json({
      message: "✅ Firebase Admin SDK initialized successfully!",
      success: true,
      projectId: process.env.FIREBASE_PROJECT_ID ? "Found" : "Missing"
    });

  } catch (error) {
    console.error("Firebase Error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}