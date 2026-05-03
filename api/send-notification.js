module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { tokens, title, body, data } = req.body;

    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
        return res.status(200).json({ success: true, sent: 0 });
    }

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
            chrome_web_icon: '/favicon.png',
            url: 'https://split-era.vercel.app',
            include_subscription_ids: validTokens
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
            console.error('[OneSignal] API error FULL:', JSON.stringify(result, null, 2));
            return res.status(200).json({ success: false, error: result });
        }

        console.log('[OneSignal] Sent to', result.recipients, 'recipients.');
        return res.status(200).json({ success: true, sent: result.recipients || 0 });

    } catch (error) {
        console.error('[OneSignal] Send error:', error.message);
        return res.status(500).json({ error: error.message });
    }
};