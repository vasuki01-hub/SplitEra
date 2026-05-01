import admin from 'firebase-admin';

function initAdmin() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    initAdmin();

    const { contactType, contact, newPassword } = req.body || {};
    if (!contactType || !contact || !newPassword) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    const db = admin.firestore();
    let targetEmail = '';

    if (contactType === 'email') {
      targetEmail = String(contact).trim().toLowerCase();
    } else if (contactType === 'phone') {
      const phone = String(contact).trim();
      const userSnap = await db.collection('users').where('phone', '==', phone).limit(1).get();
      if (userSnap.empty) {
        return res.status(404).json({ success: false, error: 'User not found for this phone number' });
      }
      targetEmail = String(userSnap.docs[0].data().email || '').trim().toLowerCase();
      if (!targetEmail) {
        return res.status(400).json({ success: false, error: 'No email linked to this phone number' });
      }
    } else {
      return res.status(400).json({ success: false, error: 'Invalid contact type' });
    }

    const authUser = await admin.auth().getUserByEmail(targetEmail);
    await admin.auth().updateUser(authUser.uid, { password: newPassword });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('resetPassword error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
}
