// Lightweight Resend REST helper for client-side use.
// NOTE: Using the Resend secret in the browser is not ideal because it exposes the key.
// Prefer proxying through the backend when possible.

const RESEND_API_URL = "https://api.resend.com/emails";

export async function sendEmail({ to, subject, html, text, from }) {
  const apiKey = import.meta.env.VITE_RESEND_API_KEY;
  const sender = from || import.meta.env.VITE_RESEND_FROM;

  if (!apiKey) {
    throw new Error("Resend API key is missing. Set VITE_RESEND_API_KEY.");
  }
  if (!sender) {
    throw new Error("Resend sender address is missing. Set VITE_RESEND_FROM.");
  }
  if (!to || !subject || (!html && !text)) {
    throw new Error(
      "'to', 'subject', and either 'html' or 'text' are required."
    );
  }

  const payload = {
    from: sender,
    to: Array.isArray(to) ? to : [to],
    subject,
    html: html || undefined,
    text: text || undefined,
  };

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    console.log("Resend error response:", res);
    const errorBody = await res.text();
    throw new Error(`Resend error ${res.status}: ${errorBody}`);
  }

  console.log("Resend success response:", res);
  return res.json();
}

// // Convenience wrapper for simple text emails.
// export async function sendTextEmail(params) {
//   const { html, ...rest } = params;
//   return sendEmail({ ...rest, html: undefined });
// }
