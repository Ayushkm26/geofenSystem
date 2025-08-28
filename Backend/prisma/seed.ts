import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.subscriptionPlan.createMany({
    data: [
      { name: "Basic", price: 9, currency: "INR", durationDays: 30 },
      { name: "Pro", price: 29, currency: "INR", durationDays: 90 },
      { name: "Enterprise", price: 499, currency: "INR", durationDays: 365 },
    ],
    skipDuplicates: true, // avoids errors if already exists
  });
}

main()
  .then(() => console.log("Subscription plans seeded"))
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
