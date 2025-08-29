import { PrismaClient } from "@prisma/client";
import { createClient } from "redis";

const prisma = new PrismaClient();

// 🔹 Setup Redis client (singleton)
const redis = createClient();
redis.connect().catch(console.error);

type GeofenceAreaParams = {
  latitude: number;
  longitude: number;
  radius: number; // in meters
};

export const createGeofenceArea = (
  longitude: GeofenceAreaParams["longitude"],
  latitude: GeofenceAreaParams["latitude"],
  radius: GeofenceAreaParams["radius"]
) => {
  if (
    typeof latitude !== "number" ||
    isNaN(latitude) ||
    typeof longitude !== "number" ||
    isNaN(longitude) ||
    typeof radius !== "number" ||
    isNaN(radius) ||
    radius <= 0
  ) {
    throw new Error("Invalid parameters for geofence area");
  }

  if (latitude < -90 || latitude > 90) {
    throw new Error("Latitude must be between -90 and 90");
  }
  if (longitude < -180 || longitude > 180) {
    throw new Error("Longitude must be between -180 and 180");
  }

  return {
    type: "circle",
    coordinates: [longitude, latitude],
    radius,
  };
};

export function getDistanceFromLatLonInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371000; // meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

/**
 * Check if user is inside any geofence
 * ✅ Uses Redis to cache last matched fence
 */
export async function checkIfInsideAnyFence(
  userId: string,
  lat: number,
  lon: number
) {
  const cacheKey = `user:${userId}:geofence`;

  // 🔹 Step 1: Check Redis
  const cached = await redis.get(cacheKey);
  if (cached) {
    const fence = JSON.parse(cached);
    const dist = getDistanceFromLatLonInMeters(
      lat,
      lon,
      fence.latitude,
      fence.longitude
    );

    if (dist <= fence.radius) {
      return [fence]; // ✅ Still inside cached fence
    }
  }

  // 🔹 Step 2: Query DB
  const geofences = await prisma.geoFenceArea.findMany({
    select: {
      id: true,
      name: true,
      latitude: true,
      longitude: true,
      radius: true,
    },
  });

  const insideFences: {
    id: string;
    name: string;
    distance: number;
    latitude: number;
    longitude: number;
    radius: number;
  }[] = [];

  geofences.forEach((fence) => {
    const distance = getDistanceFromLatLonInMeters(
      lat,
      lon,
      fence.latitude,
      fence.longitude
    );
    if (fence.radius !== null && distance <= fence.radius) {
      insideFences.push({
        id: String(fence.id),
        name: fence.name,
        distance,
        latitude: fence.latitude,
        longitude: fence.longitude,
        radius: fence.radius,
      });
    }
  });

  // 🔹 Step 3: Cache the nearest fence for 60s
  if (insideFences.length > 0) {
    await redis.set(cacheKey, JSON.stringify(insideFences[0]), { EX: 60 });
  } else {
    await redis.del(cacheKey);
  }

  return insideFences;
}
