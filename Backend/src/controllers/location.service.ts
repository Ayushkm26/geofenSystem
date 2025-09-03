import { createClient } from "redis";
import { prisma, io } from "../server";
import { checkIfInsideAnyFence } from "../utils/geoFenceArea";
import { sendGeofenceEventEmail } from "../utils/mail";
import { Socket } from "socket.io";
import { sendEmailAlert } from "../utils/mail";

// ─── Redis Setup ───────────────────────────────
const redis = createClient({ url: process.env.REDIS_URL });
redis.on("error", (err) => console.error("Redis Error", err));
(async () => await redis.connect())();

// ─── Geofence Cache ────────────────────────────
const getCachedGeofence = async (id: string) => {
  const cached = await redis.get(`geofence:${id}`);
  return cached ? JSON.parse(cached) : null;
};
const cacheAndGet = async (id: string) => {
  let gf = await getCachedGeofence(id);
  if (!gf) {
    gf = await prisma.geoFenceArea.findUnique({ where: { id }, include: { admin: true } });
    if (gf) await redis.setEx(`geofence:${id}`, 3600, JSON.stringify(gf));
  }
  return gf;
};

// ─── Location Processor ────────────────────────
export const processLocation = async (
  userId: string | undefined,
  email: string | undefined,
  latitude: number,
  longitude: number,
  visitorId: string | undefined
) => {
  if (!userId) throw new Error("User ID required");
  if (!latitude || !longitude) throw new Error("Lat/Lng required");

  const fencesInside = await checkIfInsideAnyFence(userId, latitude, longitude);
  const insideFence = fencesInside.length
    ? fencesInside.reduce((a, b) => (b.distance < a.distance ? b : a))
    : null;

  const lastRecord = await prisma.location.findFirst({
    where: { userId },
    orderBy: { inTime: "desc" },
  });
  console.log(visitorId);
  const storedFingerprint = await redis.get(`fingerprint:${userId}`);
  console.log(storedFingerprint);
  if (storedFingerprint && storedFingerprint !== visitorId) {
    // Log fraud
    await prisma.geofenceFraud.create({
      data: {
        userId,
        fenceId: lastRecord?.areaId ?? "",
        oldFingerprintId: storedFingerprint,
        newFingerprintId: visitorId ?? "",
      },
    });
    console.warn("Device switch detected inside geofence!");

    // Send alert email
const alertKey = `fingerprint-alert:${userId}:${lastRecord?.areaId ?? "unknown"}`;
const alertSent = await redis.get(alertKey);

if (!alertSent) {
  console.log("Attempting to send device mismatch alert to:", email);

  const success = await sendEmailAlert(
    email ?? "",
    "Device Mismatch Alert",
    `User ${userId} switched devices inside geofence ${lastRecord?.areaId}. Old: ${storedFingerprint}, New: ${visitorId ?? ""}`
  );

  if (success) {
    await redis.set(alertKey, "sent");
    await redis.expire(alertKey, 24 * 3600);
  }
}

    // Update Redis to new fingerprint
    await redis.set(`fingerprint:${userId}`, `${visitorId ?? ""}`, { EX: 24 * 3600 });
  }
  const wasInside = lastRecord && !lastRecord.isDisconnected;
  let eventType: "ENTER" | "EXIT" | "SWITCH" | null = null;
  let payload: any = {};

  if (insideFence && !wasInside) {
    // ENTER
    eventType = "ENTER";
    const [newRecord, newUserInFence] = await prisma.$transaction([
      prisma.location.create({
        data: {
          userId,
          areaId: insideFence.id,
          areaName: insideFence.name,
          inLatitude: latitude,
          inLongitude: longitude,
          inTime: new Date(),
          isDisconnected: false,
        },
      }),
      prisma.userGeofence.upsert({
        where: { userId_geofenceId: { userId, geofenceId: insideFence.id } },
        create: { userId, geofenceId: insideFence.id },
        update: {},
      }),
    ]);
        await redis.set(`fingerprint:${userId}`, `${visitorId ?? ""}`, { EX: 24 * 3600 });
        
    payload = { ...newRecord, userInFence: newUserInFence, areaDetails: await cacheAndGet(insideFence.id) };
  } else if (!insideFence && wasInside && lastRecord?.areaId) {
    // EXIT
    eventType = "EXIT";
    const exitedFence = await cacheAndGet(lastRecord.areaId);
    const updatedRecord = await prisma.location.update({
      where: { id: lastRecord.id },
      data: {
        outLatitude: latitude,
        outLongitude: longitude,
        outTime: new Date(),
        isDisconnected: true,
      },
    });
    await prisma.userGeofence.deleteMany({ where: { userId, geofenceId: lastRecord.areaId } });
    await redis.del(`fingerprint:${userId}`);
    await redis.del(`fingerprint-alert:${userId}:${lastRecord?.areaId ?? "unknown"}`);

    payload = { ...updatedRecord, exitedFence: exitedFence ?? { id: lastRecord.areaId, name: "Unknown" } };
  } else if (insideFence && wasInside && lastRecord!.areaId !== insideFence.id) {
    // SWITCH
    eventType = "SWITCH";
    const [newRecord, newUserInFence] = await prisma.$transaction([
      prisma.location.create({
        data: {
          userId,
          areaId: insideFence.id,
          areaName: insideFence.name,
          inLatitude: latitude,
          inLongitude: longitude,
          inTime: new Date(),
          isDisconnected: false,
        },
      }),
      prisma.userGeofence.create({ data: { userId, geofenceId: insideFence.id } }),
      prisma.userGeofence.deleteMany({ where: { userId, geofenceId: lastRecord!.areaId! } }),
    ]);
        await redis.set(`fingerprint:${userId}`, `${visitorId ?? ""}`, { EX: 24 * 3600 });

    payload = {
      ...newRecord,
      userInFence: newUserInFence,
      areaDetails: await cacheAndGet(insideFence.id),
    };
  }

  if (!eventType) return { message: "No status change" };

  await redis.lPush("geofence-events", JSON.stringify({ type: eventType, data: payload }));

  if (email) {
    if ((eventType === "ENTER" || eventType === "SWITCH") && payload.areaDetails?.admin?.email) {
      await sendGeofenceEventEmail(eventType, payload, email, payload.areaDetails.admin.email);
    } else if (eventType === "EXIT" && payload.exitedFence?.admin?.email) {
      await sendGeofenceEventEmail(eventType, payload, email, payload.exitedFence.admin.email);
    }
  }

  return { eventType, payload, message: `Processed ${eventType}` };
};

// ─── Socket Handler ────────────────────────────
export const handleSocketLocationUpdate = async (
  socket: Socket,
  data: { latitude: number; longitude: number, visitorId?: string }
) => {
  try {
    const userId = socket.data?.user?.id;
    if (!userId) {
      return socket.emit("location-error", { error: "User not authenticated" });
    }

    const result = await processLocation(
      userId,
      socket.data.user.email,
      data.latitude,
      data.longitude,
      data.visitorId
    );

    // Always respond to client
    socket.emit("location-response", result);

    if (!result.eventType) return;

    // ─── Handle ENTER / SWITCH ───────────────────────────────
    if (result.eventType === "ENTER" || result.eventType === "SWITCH") {
      socket.data.currentGeofence = result.payload.areaDetails;
      socket.emit("geofence-details", result.payload.areaDetails);
    }

    // ─── Handle EXIT ───────────────────────────────
    if (result.eventType === "EXIT") {
      socket.data.currentGeofence = null;
      socket.emit("outside-geofence", {
        latitude: null,
        longitude: null,
        message: "You are outside all geofence areas",
        timestamp: new Date(),
        exitedGeofence: result.payload.exitedFence,
      });
    }

    // ─── Notify Admins (common for all events) ─────────────────────
    const target = result.payload.areaDetails ?? result.payload.exitedFence;
    if (target?.id && target.createdBy) {
      io.of("/admin")
        .to(`admin:${target.createdBy}`)
        .emit("user-geofence-event", {
          userId,
          userEmail: socket.data.user.email,
          geofenceId: target.id,
          geofenceName: target.name ?? "Unknown Geofence",
          event: result.eventType,
          timestamp: new Date(),
        });
    }
  } catch (error) {
    console.error("Location processing error:", error);
    socket.emit("location-error", {
      error: error instanceof Error ? error.message : String(error),
      queryCount: (prisma as any)._queryCount, // optional if you're tracking queries
    });
  } finally {
    // reset query counter if you track queries
    (prisma as any)._queryCount = 0;
  }
};