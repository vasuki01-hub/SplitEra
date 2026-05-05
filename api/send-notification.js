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
                headings: { en: title || 'SplitEra' },
                contents: { en: body || '' },
                data: data || {},
                // ── Delivery settings ──────────────────────────────────────
                // target_channel: 'push' is required for Median hybrid apps
                // (Web + Android in the same OneSignal app).
                target_channel: 'push',
                ttl: 259200,          // 3-day time-to-live
                priority: 10,
                android_visibility: 1,
                small_icon: 'ic_notification',
                // Web / browser icons
                chrome_web_icon: '/favicon.png',
                firefox_icon: '/favicon.png',
                // Deep-link target for web and Android
                url: 'https://split-era.vercel.app',
                web_url: 'https://split-era.vercel.app',
                app_url: 'https://split-era.vercel.app',
                include_subscription_ids: validTokens
            })
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('OneSignal Error:', result);
            return res.status(200).json({
                success: false,
                error: result.errors ? result.errors[0] : 'Unknown notification error'
            });
        }

        return res.status(200).json({
            success: true,
            sent: result.recipients || 0,
            id: result.id || null,
            invalidTokens: result.errors?.invalid_subscription_ids || []
        });

    } catch (error) {
        console.error('Notification Exception:', error);
        return res.status(500).json({ error: error.message });
    }
};