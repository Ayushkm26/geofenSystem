import { createClient } from "redis";
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

// Initialize Prisma with Accelerate
const prisma = new PrismaClient().$extends(withAccelerate());

// Initialize Redis client
const redis = createClient({ 
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      console.log(`Redis reconnecting attempt ${retries}`);
      return Math.min(retries * 100, 5000); // Max 5 second delay
    }
  }
});

interface GeofenceEvent {
  type: 'ENTER' | 'EXIT' | 'SWITCH';
  data: {
    userId: string;
    areaId?: string;
    areaName?: string;
    inLatitude?: number;
    inLongitude?: number;
    outLatitude?: number;
    outLongitude?: number;
    inTime?: string;
    outTime?: string;
  };
}

const processEvent = async (event: string): Promise<void> => {
  try {
    const { type, data }: GeofenceEvent = JSON.parse(event);

    switch (type) {
      case 'ENTER':
        await handleEnterEvent(data);
        break;
      case 'EXIT':
        await handleExitEvent(data);
        break;
      case 'SWITCH':
        await handleSwitchEvent(data);
        break;
      default:
        console.warn(`⚠️ Unknown event type: ${type}`);
    }
  } catch (error) {
    console.error('❌ Error processing event:', error instanceof Error ? error.message : error);
  }
};

const handleEnterEvent = async (data: GeofenceEvent['data']) => {
  if (!data.userId || !data.areaId) {
    throw new Error('Missing required fields for ENTER event');
  }

  const lastLog = await prisma.location.findFirst({
    where: { userId: data.userId },
    orderBy: { inTime: 'desc' }
  });

  if (lastLog && !lastLog.isDisconnected) {
    console.log(`⚠️ User ${data.userId} is already inside, skipping ENTER.`);
    return;
  }

  await prisma.location.create({
    data: {
      userId: data.userId,
      areaId: data.areaId,
      areaName: data.areaName || 'Unknown Area',
      inLatitude: data.inLatitude || 0,
      inLongitude: data.inLongitude || 0,
      inTime: data.inTime ? new Date(data.inTime) : new Date(),
      isDisconnected: false
    }
  });

  console.log(`✅ ENTER recorded for user ${data.userId} in area ${data.areaName}`);
};

const handleExitEvent = async (data: GeofenceEvent['data']) => {
  if (!data.userId) {
    throw new Error('Missing userId for EXIT event');
  }

  const lastLog = await prisma.location.findFirst({
    where: { 
      userId: data.userId, 
      isDisconnected: false 
    },
    orderBy: { inTime: 'desc' }
  });

  if (!lastLog) {
    console.log(`⚠️ No active entry for user ${data.userId}, skipping EXIT.`);
    return;
  }

  const exitTime = data.outTime ? new Date(data.outTime) : new Date();
  const duration = lastLog.inTime 
    ? Math.floor((exitTime.getTime() - lastLog.inTime.getTime()) / 1000)
    : 0;

  await prisma.location.update({
    where: { id: lastLog.id },
    data: {
      outLatitude: data.outLatitude || lastLog.inLatitude || 0,
      outLongitude: data.outLongitude || lastLog.inLongitude || 0,
      outTime: exitTime,
      isDisconnected: true
      // durationSeconds: duration // Removed because not in Prisma schema
    }
  });

  console.log(`✅ EXIT recorded for user ${data.userId}, stayed for ${duration} sec`);
};

const handleSwitchEvent = async (data: GeofenceEvent['data']) => {
  if (!data.userId || !data.areaId) {
    throw new Error('Missing required fields for SWITCH event');
  }

  await prisma.$transaction([
    prisma.location.updateMany({
      where: { 
        userId: data.userId,
        isDisconnected: false 
      },
      data: {
        outTime: new Date(),
        isDisconnected: true
      }
    }),
    prisma.location.create({
      data: {
        userId: data.userId,
        areaId: data.areaId,
        areaName: data.areaName || 'Unknown Area',
        inLatitude: data.inLatitude || 0,
        inLongitude: data.inLongitude || 0,
        inTime: new Date(),
        isDisconnected: false,
        isSwitched: true
      }
    })
  ]);

  console.log(`🔄 SWITCH recorded for user ${data.userId} to area ${data.areaName}`);
};

const main = async () => {
  try {
    await redis.connect();
    await prisma.$connect();
    
    console.log('📡 Geofence Worker started. Listening for events...');
    
    while (true) {
      try {
        const result = await redis.brPop('geofence-events', 0);
        if (result?.element) {
          await processEvent(result.element);
        }
      } catch (error) {
        console.error('❌ Error processing queue:', error instanceof Error ? error.message : error);
        await new Promise(resolve => setTimeout(resolve, 5000)); // Backoff on error
      }
    }
  } catch (error) {
    console.error('🚨 Worker startup failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM. Shutting down gracefully...');
  await redis.quit();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT. Shutting down gracefully...');
  await redis.quit();
  await prisma.$disconnect();
  process.exit(0);
});

main().catch(console.error);