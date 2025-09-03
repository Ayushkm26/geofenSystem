-- CreateTable
CREATE TABLE "public"."Resync" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "adminId" TEXT,
    "fenceId" TEXT NOT NULL,
    "requestReason" TEXT NOT NULL,
    "adminResponse" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "action" TEXT DEFAULT 'PENDING',

    CONSTRAINT "Resync_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Resync" ADD CONSTRAINT "Resync_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Resync" ADD CONSTRAINT "Resync_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Resync" ADD CONSTRAINT "Resync_fenceId_fkey" FOREIGN KEY ("fenceId") REFERENCES "public"."GeoFenceArea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
