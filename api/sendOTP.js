export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const BREVO_KEY = process.env.BREVO_API_KEY;
    const { email, otp, senderEmail } = req.body;

    const body = {
      sender: { name: "SplitEra", email: senderEmail },
      to: [{ email }],
      subject: "Your SplitEra OTP",
      htmlContent: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #FF8C42; text-align: center;">SplitEra Verification</h2>
          <p>Hi there,</p>
          <p>Your one-time password for accessing SplitEra is:</p>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; text-align: center; font-size: 2rem; font-weight: bold; letter-spacing: 0.5rem; color: #1F2937; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #6B7280; font-size: 0.875rem;">This code will expire in 5 minutes. If you didn't request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="text-align: center; color: #9CA3AF; font-size: 0.75rem;">© 2026 SplitEra - Smart Expense Manager</p>
        </div>
      `
    };

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": BREVO_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(400).json({ success: false, error: data });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}


function generateOTP() {
            // Use cryptographically secure random numbers if available
            if (window.crypto && window.crypto.getRandomValues) {
                const array = new Uint32Array(1);
                window.crypto.getRandomValues(array);
                return (100000 + (array[0] % 900000)).toString();
            }
            return Math.floor(100000 + Math.random() * 900000).toString();
        }