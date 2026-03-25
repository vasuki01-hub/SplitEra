// api/notify.js
import admin from 'firebase-admin';

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

const db = admin.firestore();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    const { title, body, uid, sendToAll = false } = req.body;

    if (!title || !body) {
        return res.status(400).json({ success: false, error: 'Title and body are required' });
    }

    try {
        if (sendToAll) {
            const snapshot = await db.collection('users').where('fcmToken', '!=', null).get();
            const tokens = snapshot.docs.map(doc => doc.data().fcmToken).filter(Boolean);

            if (tokens.length === 0) {
                return res.json({ success: true, message: 'No users with tokens' });
            }

            const message = {
                notification: { title, body },
                tokens: tokens
            };

            const response = await admin.messaging().sendEachForMulticast(message);
            return res.json({ success: true, successCount: response.successCount });

        } else if (uid) {
            const userDoc = await db.collection('users').doc(uid).get();
            const token = userDoc.data()?.fcmToken;

            if (!token) return res.status(400).json({ success: false, error: 'No token for this user' });

            const message = { notification: { title, body }, token };
            await admin.messaging().send(message);
            return res.json({ success: true });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: error.message });
    }
}