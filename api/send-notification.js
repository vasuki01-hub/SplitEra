// api/send-notification.js
// Vercel Serverless Function — Place this at: /api/send-notification.js in your repo root

export default async function handler(req, res) {
    // ── CORS headers (allow your Vercel domain + localhost) ──────────────
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { tokens, title, body, data = {} } = req.body || {};

    // ── Validate ─────────────────────────────────────────────────────────
    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
        return res.status(400).json({ error: 'tokens array is required' });
    }
    if (!title || !body) {
        return res.status(400).json({ error: 'title and body are required' });
    }

    const ONESIGNAL_APP_ID  = process.env.ONESIGNAL_APP_ID;
    const ONESIGNAL_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

    if (!ONESIGNAL_APP_ID || !ONESIGNAL_API_KEY) {
        console.error('[Push] Missing ONESIGNAL_APP_ID or ONESIGNAL_REST_API_KEY env vars');
        return res.status(500).json({ error: 'Server misconfiguration: missing env vars' });
    }

    // ── Deduplicate tokens ────────────────────────────────────────────────
    const uniqueTokens = [...new Set(tokens)];

    try {
        // ── Call OneSignal REST API ───────────────────────────────────────
        // tokens stored in Firestore are OneSignal Subscription IDs (v5 SDK)
        const payload = {
            app_id:                     ONESIGNAL_APP_ID,
            include_subscription_ids:   uniqueTokens,   // OneSignal sub IDs
            headings:  { en: title },
            contents:  { en: body  },
            data:      data,                            // passed back on notification tap
            android_channel_id:         "splitera-alerts", // optional but recommended
            small_icon:                 "ic_stat_onesignal_default",
        };

        const osResponse = await fetch('https://api.onesignal.com/notifications', {
            method: 'POST',
            headers: {
                'Content-Type':  'application/json',
                'Authorization': `Key ${ONESIGNAL_API_KEY}`,
            },
            body: JSON.stringify(payload),
        });

        const osResult = await osResponse.json();

        if (!osResponse.ok) {
            console.error('[Push] OneSignal error:', osResult);
            return res.status(osResponse.status).json({ error: osResult });
        }

        // ── Report invalid / unsubscribed tokens back so caller can clean them ──
        const invalidTokens = osResult.invalid_player_ids || [];

        return res.status(200).json({
            success:       true,
            id:            osResult.id,
            recipients:    osResult.recipients,
            invalidTokens: invalidTokens,
        });

    } catch (err) {
        console.error('[Push] Unexpected error:', err);
        return res.status(500).json({ error: err.message });
    }
}
