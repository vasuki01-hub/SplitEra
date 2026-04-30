// api/send-notification.js — OneSignal version for Median apps

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { tokens, title, body, data } = req.body;

    if (!tokens || tokens.length === 0) {
        return res.status(200).json({ success: true, sent: 0 });
    }

    try {
        const response = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`
            },
            body: JSON.stringify({
                app_id: process.env.ONESIGNAL_APP_ID,
                include_player_ids: tokens, // OneSignal player IDs, not FCM tokens
                headings: { en: title },
                contents: { en: body },
                data: data || {},
                android_channel_id: 'splitera_group_notifications',
                priority: 10,
                android_visibility: 1,
                small_icon: 'ic_notification'
            })
        });

        const result = await response.json();
        return res.status(200).json({ success: true, result });

    } catch (error) {
        console.error('OneSignal send error:', error);
        return res.status(500).json({ error: error.message });
    }
};