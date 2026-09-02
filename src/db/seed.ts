import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import bcrypt from "bcryptjs";

import { db } from "./index";
import { admins, categories, items, transactions } from "./schema";

async function main() {
  migrate(db, { migrationsFolder: "./drizzle" });

  const adminCount = db.select().from(admins).all();
  if (adminCount.length === 0) {
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD ?? "kentado2026", 12);
    db.insert(admins).values({ username: "admin", passwordHash }).run();
    console.log("Created default admin (username: admin).");
  } else {
    console.log("Admin already exists, skipping.");
  }

  const catCount = db.select().from(categories).all();
  if (catCount.length === 0) {
    const catId = db
      .insert(categories)
      .values({ name: "Bahan Pokok" })
      .returning({ id: categories.id })
      .get()!.id;

    const itemId = db
      .insert(items)
      .values({ categoryId: catId, name: "Serbuk Te'gi Karate", unit: "kg" })
      .returning({ id: items.id })
      .get()!.id;

    db.insert(transactions)
      .values([
        {
          itemId,
          type: "in",
          qty: 100,
          unitPrice: 12000,
          total: 1200000,
          note: "Stok awal",
          date: new Date().toISOString().slice(0, 10),
        },
        {
          itemId,
          type: "out",
          qty: 20,
          purpose: "produksi",
          note: "Produksi batch pertama",
          date: new Date().toISOString().slice(0, 10),
        },
      ])
      .run();
    console.log("Seeded starter data.");
  } else {
    console.log("Categories already exist, skipping seed.");
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
