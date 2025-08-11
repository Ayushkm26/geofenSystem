-- AlterTable
ALTER TABLE "public"."GeoFenceArea" ADD COLUMN     "totalActiveUsers" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalInOut" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."Location" ADD COLUMN     "isSwitched" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."UserGeofence" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "geofenceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserGeofence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserGeofence_userId_geofenceId_key" ON "public"."UserGeofence"("userId", "geofenceId");

-- AddForeignKey
ALTER TABLE "public"."UserGeofence" ADD CONSTRAINT "UserGeofence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserGeofence" ADD CONSTRAINT "UserGeofence_geofenceId_fkey" FOREIGN KEY ("geofenceId") REFERENCES "public"."GeoFenceArea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
