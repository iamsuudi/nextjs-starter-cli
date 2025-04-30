import { PrismaClient } from "./client";

const prisma = new PrismaClient();

async function main() {
    // Add your seed data here
    console.log("🌱 Seeding database...");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (error) => {
        console.error("[Prisma] ❌ Seed failed:", error);
        await prisma.$disconnect();
        process.exit(1);
    });
