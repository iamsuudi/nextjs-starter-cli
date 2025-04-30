import { db } from "@/lib/db/drizzle";
import { sql } from "drizzle-orm";

console.log("[Drizzle] Seeding database...");

try {
    // Idempotent seed operation
    await db.run(sql`
    INSERT OR IGNORE INTO examples (title, content)
    VALUES ('Drizzle Seed', 'Initial data from setup script')
  `);
    console.log("[Drizzle] ✅ Seed completed");
} catch (error) {
    console.error("[Drizzle] ❌ Seed failed:", error);
    process.exit(1);
}
