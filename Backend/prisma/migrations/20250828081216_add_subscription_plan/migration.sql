-- DropForeignKey
ALTER TABLE "public"."Admin" DROP CONSTRAINT "Admin_subscriptionPlanId_fkey";

-- AlterTable
ALTER TABLE "public"."Admin" ALTER COLUMN "subscriptionPlanId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Admin" ADD CONSTRAINT "Admin_subscriptionPlanId_fkey" FOREIGN KEY ("subscriptionPlanId") REFERENCES "public"."SubscriptionPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
