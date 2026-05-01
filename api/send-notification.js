// api/send-notification.js — OneSignal v1 API

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { tokens, title, body, data } = req.body;

    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
        return res.status(200).json({ success: true, sent: 0, message: 'No tokens provided' });
    }

    // Filter out empty/invalid tokens
    const validTokens = tokens.filter(t => t && typeof t === 'string' && t.length > 5);
    if (validTokens.length === 0) {
        return res.status(200).json({ success: true, sent: 0, message: 'No valid tokens' });
    }

    try {
        const payload = {
            app_id: process.env.ONESIGNAL_APP_ID,
            headings: { en: title || 'SplitEra' },
            contents: { en: body || '' },
            data: data || {},
            priority: 10,
            android_visibility: 1,
            small_icon: 'ic_notification',
            large_icon: 'ic_notification',
            // Support both old player IDs and new subscription IDs
            include_subscription_ids: validTokens,
            // Fallback for legacy player IDs
            include_player_ids: validTokens,
            // Target URL when notification tapped
            url: process.env.APP_URL || 'https://split-era.vercel.app',
            // Android notification channel
            android_channel_id: 'splitera_group_notifications',
            // Web push icon
            chrome_web_icon: '/favicon.png',
            firefox_icon: '/favicon.png'
        };

        const response = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('OneSignal API error:', result);
            return res.status(response.status).json({ error: result });
        }

        return res.status(200).json({
            success: true,
            sent: result.recipients || 0,
            id: result.id
        });

    } catch (error) {
        console.error('OneSignal send error:', error);
        return res.status(500).json({ error: error.message });
    }
};