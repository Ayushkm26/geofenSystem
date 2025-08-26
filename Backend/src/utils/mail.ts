// emailService.ts
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER, 
    pass: process.env.GMAIL_PASS  // App Password
  }
});

const formatDate = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
};

export const sendGeofenceEventEmail = async (
  eventType: "ENTER" | "EXIT" | "SWITCH",
  payload: Record<string, any>,
  userEmail: string,
  adminEmail: string
) => {
  const mapLink = `https://www.google.com/maps?q=${payload.inLatitude || payload.outLatitude},${payload.inLongitude || payload.outLongitude}`;

  let subject = "";
  let htmlContent = "";

  if (eventType === "ENTER") {
    subject = `🚪 User Entered Geofence: ${payload.areaName}`;
    htmlContent = `
      <h2 style="color:#4CAF50;">User Entered Geofence</h2>
      <p><b>User ID:</b> ${payload.userId}</p>
      <p><b>Area:</b> ${payload.areaName} (${payload.areaId})</p>
      <p><b>In Time:</b> ${formatDate(payload.inTime)}</p>
      <p><b>Coordinates:</b> ${payload.inLatitude}, ${payload.inLongitude}</p>
      <p><a href="${mapLink}" style="color:#2196F3;">📍 View on Google Maps</a></p>
    `;
  } else if (eventType === "EXIT") {
    subject = `🏃 User Exited Geofence: ${payload.areaName}`;
    htmlContent = `
      <h2 style="color:#F44336;">User Exited Geofence</h2>
      <p><b>User ID:</b> ${payload.userId}</p>
      <p><b>Area:</b> ${payload.areaName} (${payload.areaId})</p>
      <p><b>Out Time:</b> ${formatDate(payload.outTime)}</p>
      <p><b>Coordinates:</b> ${payload.outLatitude}, ${payload.outLongitude}</p>
      <p><a href="${mapLink}" style="color:#2196F3;">📍 View on Google Maps</a></p>
    `;
  } else if (eventType === "SWITCH") {
    subject = `🔄 User Switched Geofence: ${payload.areaName}`;
    htmlContent = `
      <h2 style="color:#FF9800;">User Switched Geofence</h2>
      <p><b>User ID:</b> ${payload.userId}</p>
      <p><b>New Area:</b> ${payload.areaName} (${payload.areaId})</p>
      <p><b>Switch Time:</b> ${formatDate(payload.inTime)}</p>
      <p><b>Coordinates:</b> ${payload.inLatitude}, ${payload.inLongitude}</p>
      <p><a href="${mapLink}" style="color:#2196F3;">📍 View on Google Maps</a></p>
    `;
  }

  await transporter.sendMail({
    from: `"GeoFence System" <${process.env.GMAIL_USER}>`,
    to: [userEmail, adminEmail].join(","),
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; background:#f8f9fa; padding:20px;">
        <div style="max-width:600px; margin:auto; background:white; padding:20px; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          ${htmlContent}
          <hr style="margin:20px 0;">
          <footer style="font-size:12px; color:#777;">
            GeoFence System • Automated Notification<br>
            Do not reply to this email.
          </footer>
        </div>
      </div>
    `
  });
};
export function generateOtpEmailHtml({
  appName = "GeoFence System",
  otp,
  expiryMinutes = 5,
  supportEmail = "support@geofencesystem.com"
}: { appName?: string; otp: string | number; expiryMinutes?: number; supportEmail?: string }) {
  const preheader = `Your ${appName} OTP is ${otp}. It expires in ${expiryMinutes} minutes.`;
  return `
<!DOCTYPE html>
<html lang="en" style="margin:0;padding:0;">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <title>${appName} — Verify your email</title>
    <style>
      /* Dark-mode hint (supported clients only) */
      @media (prefers-color-scheme: dark) {
        body, table, td { background-color:#0b0f14 !important; color:#e6edf3 !important; }
        .card { background-color:#11161d !important; }
        .muted { color:#9aa7b2 !important; }
        .btn { background:#3b82f6 !important; color:#ffffff !important; }
        .otp { background:#0b0f14 !important; border-color:#233043 !important; color:#e6edf3 !important; }
      }
      /* Apple link color fix */
      a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#f4f6f8;font-family:Segoe UI, Roboto, Helvetica, Arial, sans-serif;color:#0f172a;">
    <!-- Preheader (hidden in most clients) -->
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      ${preheader}
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
            <!-- Header -->
            <tr>
              <td style="padding: 12px 8px;" align="center">
                <div style="font-weight:700;font-size:20px;letter-spacing:.3px;color:#111827;">
                  ${appName}
                </div>
              </td>
            </tr>

            <!-- Card -->
            <tr>
              <td class="card" style="background:#ffffff;border-radius:12px;padding:28px 24px;border:1px solid #e5e7eb;">
                <h1 style="margin:0 0 8px 0;font-size:20px;line-height:28px;color:#111827;">Verify your email</h1>
                <p style="margin:0 0 16px 0;font-size:14px;line-height:22px;color:#334155;">
                  Use the one-time password (OTP) below to finish verifying your email for <strong>${appName}</strong>.
                </p>

                <!-- OTP block -->
                <div class="otp" style="display:inline-block;font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;font-weight:700;letter-spacing:4px;font-size:22px;padding:14px 18px;border:1px solid #e5e7eb;border-radius:10px;background:#F9FAFB;color:#0f172a;margin:8px 0 14px 0;">
                  ${otp}
                </div>

                <p class="muted" style="margin:0 0 16px 0;font-size:12px;line-height:18px;color:#64748b;">
                  This code expires in <strong>${expiryMinutes} minutes</strong>. For your security, don’t share it with anyone.
                </p>

                <!-- CTA (optional if you also send a magic link) -->
                <!--
                <div style="margin:18px 0;">
                  <a class="btn" href="#" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:600;border-radius:10px;padding:12px 18px;">
                    Verify Email
                  </a>
                </div>
                -->

                <hr style="border:none;border-top:1px solid #eef2f7;margin:18px 0;" />

                <p style="margin:0 0 6px 0;font-size:12px;color:#475569;">
                  Didn’t request this? You can safely ignore this email.
                </p>
                <p class="muted" style="margin:0;font-size:12px;color:#94a3b8;">
                  Need help? Contact us at <a href="mailto:${supportEmail}" style="color:#2563eb;text-decoration:none;">${supportEmail}</a>.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:16px 8px;" align="center">
                <p class="muted" style="margin:0;font-size:11px;color:#94a3b8;">
                  © ${new Date().getFullYear()} ${appName}. All rights reserved.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;
}

