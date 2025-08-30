-- CreateTable
CREATE TABLE "public"."Fingerprint" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fingerprint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GeofenceFraud" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fenceId" TEXT NOT NULL,
    "oldFingerprintId" TEXT NOT NULL,
    "newFingerprintId" TEXT NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeofenceFraud_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Fingerprint_visitorId_key" ON "public"."Fingerprint"("visitorId");

-- AddForeignKey
ALTER TABLE "public"."Fingerprint" ADD CONSTRAINT "Fingerprint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GeofenceFraud" ADD CONSTRAINT "GeofenceFraud_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
