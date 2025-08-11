import { createClient } from "redis";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const redis = createClient({ url: process.env.REDIS_URL });

const processEvent = async (event: string) => {
  try {

const prisma = new PrismaClient();
const redis = createClient({ url: process.env.REDIS_URL });

const processEvent = async (event:string) => {
  try {
    const { type, data } = JSON.parse(event);

    if (type === "ENTER") {
      const lastLog = await prisma.location.findFirst({
        where: { userId: data.userId },
        orderBy: { inTime: "desc" }
      });

      if (lastLog && !lastLog.isDisconnected) {
        console.log(`⚠️ User ${data.userId} is already inside, skipping ENTER.`);
        return;
      }

      await prisma.location.create({
        data: {
          userId: data.userId,
          areaId: data.areaId,
          areaName: data.areaName,
          inLatitude: data.inLatitude,
          inLongitude: data.inLongitude,
          inTime: new Date(data.inTime),
          isDisconnected: false,
          currentStatus: true
        }
      });

      console.log(`✅ ENTER recorded for user ${data.userId} in area ${data.areaName}`);
    }

    if (type === "EXIT") {
      const lastLog = await prisma.location.findFirst({
        where: { userId: data.userId, isDisconnected: false },
        orderBy: { inTime: "desc" }
      });

      if (!lastLog) {
        console.log(`⚠️ No active entry for user ${data.userId}, skipping EXIT.`);
        return;
      }

      const exitTime = new Date(data.outTime);
      const totalDuration = lastLog.inTime
        ? Math.floor((exitTime.getTime() - new Date(lastLog.inTime).getTime()) / 1000) // seconds
        : null;

      await prisma.location.update({
        where: { id: lastLog.id },
        data: {
          outLatitude: data.outLatitude,
          outLongitude: data.outLongitude,
          outTime: exitTime,
          isDisconnected: true,
          currentStatus: false,
          //totalDuration // optional new field for analytics
        }
      });

      console.log(`✅ EXIT recorded for user ${data.userId}, stayed for ${totalDuration || 0} sec`);
    }
  } catch (error) {
    console.error("❌ Error processing event:", error);
  }
};

const main = async () => {
  await redis.connect();
  console.log("📡 Geofence Worker started...");

  while (true) {
    try {
      const event = await redis.brPop("geofence-events", 0);
      if (event && event.element) {
        await processEvent(event.element);
      }
    } catch (error) {
      console.error("❌ Worker loop error:", error);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

main();

    const { type, data } = JSON.parse(event);

    if (type === "ENTER") {
      const lastLog = await prisma.location.findFirst({
        where: { userId: data.userId },
        orderBy: { inTime: "desc" }
      });

      if (lastLog && !lastLog.isDisconnected) {
        console.log(`⚠️ User ${data.userId} is already inside, skipping ENTER.`);
        return;
      }

      await prisma.location.create({
        data: {
          userId: data.userId,
          areaId: data.areaId,
          areaName: data.areaName,
          inLatitude: data.inLatitude,
          inLongitude: data.inLongitude,
          inTime: new Date(data.inTime),
          isDisconnected: false,
          currentStatus: true
        }
      });

      console.log(`✅ ENTER recorded for user ${data.userId} in area ${data.areaName}`);
    }

    if (type === "EXIT") {
      const lastLog = await prisma.location.findFirst({
        where: { userId: data.userId, isDisconnected: false },
        orderBy: { inTime: "desc" }
      });

      if (!lastLog) {
        console.log(`⚠️ No active entry for user ${data.userId}, skipping EXIT.`);
        return;
      }

      const exitTime = new Date(data.outTime);
      const totalDuration = lastLog.inTime
        ? Math.floor((exitTime.getTime() - new Date(lastLog.inTime).getTime()) / 1000) // seconds
        : null;

      await prisma.location.update({
        where: { id: lastLog.id },
        data: {
          outLatitude: data.outLatitude,
          outLongitude: data.outLongitude,
          outTime: exitTime,
          isDisconnected: true,
          currentStatus: false,
          //totalDuration // optional new field for analytics
        }
      });

      console.log(`✅ EXIT recorded for user ${data.userId}, stayed for ${totalDuration || 0} sec`);
    }
  } catch (error) {
    console.error("❌ Error processing event:", error);
  }
};

const main = async () => {
  await redis.connect();
  console.log("📡 Geofence Worker started...");

  while (true) {
    try {
      const event = await redis.brPop("geofence-events", 0);
      if (event && event.element) {
        await processEvent(event.element);
      }
    } catch (error) {
      console.error("❌ Worker loop error:", error);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

main();
