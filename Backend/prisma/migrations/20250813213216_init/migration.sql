-- CreateTable
CREATE TABLE "public"."Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "currentStatus" BOOLEAN NOT NULL DEFAULT false,
    "totalInOut" INTEGER NOT NULL DEFAULT 0,
    "lastAreaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" TEXT NOT NULL DEFAULT 'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Location" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "areaId" TEXT,
    "areaName" TEXT,
    "inTime" TIMESTAMP(3),
    "inLongitude" DOUBLE PRECISION DEFAULT 0.0,
    "inLatitude" DOUBLE PRECISION DEFAULT 0.0,
    "outTime" TIMESTAMP(3),
    "outLongitude" DOUBLE PRECISION DEFAULT 0.0,
    "outLatitude" DOUBLE PRECISION DEFAULT 0.0,
    "totalTime" INTEGER,
    "currentStatus" BOOLEAN NOT NULL DEFAULT true,
    "isDisconnected" BOOLEAN NOT NULL DEFAULT false,
    "locationSharingTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isSwitched" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GeoFenceArea" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "coordinates" TEXT,
    "radius" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "totalActiveUsers" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GeoFenceArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."JwtToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "revokedAt" TIMESTAMP(3),
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JwtToken_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX "Admin_email_key" ON "public"."Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "JwtToken_token_key" ON "public"."JwtToken"("token");

-- CreateIndex
CREATE INDEX "JwtToken_userId_idx" ON "public"."JwtToken"("userId");

-- CreateIndex
CREATE INDEX "JwtToken_expiresAt_idx" ON "public"."JwtToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserGeofence_userId_geofenceId_key" ON "public"."UserGeofence"("userId", "geofenceId");

-- AddForeignKey
ALTER TABLE "public"."Location" ADD CONSTRAINT "Location_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GeoFenceArea" ADD CONSTRAINT "GeoFenceArea_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserGeofence" ADD CONSTRAINT "UserGeofence_geofenceId_fkey" FOREIGN KEY ("geofenceId") REFERENCES "public"."GeoFenceArea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserGeofence" ADD CONSTRAINT "UserGeofence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
