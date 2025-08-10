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

-- CreateIndex
CREATE UNIQUE INDEX "JwtToken_token_key" ON "public"."JwtToken"("token");

-- CreateIndex
CREATE INDEX "JwtToken_userId_idx" ON "public"."JwtToken"("userId");

-- CreateIndex
CREATE INDEX "JwtToken_expiresAt_idx" ON "public"."JwtToken"("expiresAt");
