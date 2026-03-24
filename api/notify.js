const admin = require('firebase-admin');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
    });
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { tokens, notification, data } = req.body;

        if (!tokens || tokens.length === 0) {
            return res.status(400).json({ error: 'No tokens provided' });
        }

        const message = {
            notification: notification,
            data: data || {},
            tokens: tokens,
        };

        const response = await admin.messaging().sendMulticast(message);
        
        return res.status(200).json({ 
            success: true, 
            responses: response.responses,
            successCount: response.successCount,
            failureCount: response.failureCount
        });
    } catch (error) {
        console.error('Error sending notification:', error);
        return res.status(500).json({ error: error.message });
    }
}
