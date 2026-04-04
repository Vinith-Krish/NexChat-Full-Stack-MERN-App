const RESEND_ENDPOINT = "https://api.resend.com/emails";

export function isResetEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.MAIL_FROM?.trim());
}

export async function sendPasswordResetOtpEmail({ to, otp }) {
  if (!isResetEmailConfigured()) {
    return { sent: false };
  }

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM,
      to: [to],
      subject: "Your NEXCHAT password reset code",
      text: `Your verification code is: ${otp}\n\nIt expires in 15 minutes. If you did not request this, you can ignore this email.`,
      html: `<p>Your verification code is: <strong style="font-size:1.25rem;letter-spacing:0.2em">${otp}</strong></p><p>It expires in 15 minutes.</p><p style="color:#666;font-size:12px">If you did not request this, you can ignore this email.</p>`,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend error (${response.status}): ${body}`);
  }

  return { sent: true };
}
