// emailService.ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER, // Your Gmail
    pass: process.env.GMAIL_PASS  // App Password
  }
});

const formatDate = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
};

export const sendGeofenceEventEmail = async (
  eventType: "ENTER" | "EXIT" | "SWITCH",
  payload: any,
  userEmail: string
) => {
  const adminEmail = process.env.ADMIN_EMAIL;
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
