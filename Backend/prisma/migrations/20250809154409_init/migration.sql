-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "currentStatus" BOOLEAN NOT NULL DEFAULT false,
    "totalInOut" INTEGER NOT NULL DEFAULT 0,
    "lastAreaId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Location" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "areaName" TEXT NOT NULL,
    "inTime" TIMESTAMP(3) NOT NULL,
    "inLongitude" DOUBLE PRECISION NOT NULL,
    "inLatitude" DOUBLE PRECISION NOT NULL,
    "outTime" TIMESTAMP(3),
    "outLongitude" DOUBLE PRECISION,
    "outLatitude" DOUBLE PRECISION,
    "totalTime" INTEGER,
    "currentStatus" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."Location" ADD CONSTRAINT "Location_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
