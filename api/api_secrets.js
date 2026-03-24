import admin from 'firebase-admin';

export default function handler(req, res) {
  try {
    // Initialize Firebase Admin only once
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }

    res.status(200).json({
      message: "API working",
      success: true,
      data: "Firebase Admin SDK initialized successfully ✅",
    });

  } catch (error) {
    console.error("Firebase Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      note: "Check your environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)"
    });
  }
}