import "./env";
import bcrypt from "bcryptjs";
import { migrate } from "drizzle-orm/postgres-js/migrator";

import { db } from "./index";
import { admins, categories, items, transactions } from "./schema";

async function main() {
  await migrate(db, { migrationsFolder: "./drizzle" });

  const adminRows = await db.select().from(admins);
  if (adminRows.length === 0) {
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD ?? "kentado2026", 12);
    await db.insert(admins).values({ username: "admin", passwordHash });
    console.log("Created default admin (username: admin).");
  } else {
    console.log("Admin already exists, skipping.");
  }

  const categoryRows = await db.select().from(categories);
  if (categoryRows.length === 0) {
    const [cat] = await db
      .insert(categories)
      .values({ name: "Bahan Pokok" })
      .returning({ id: categories.id });

    const [item] = await db
      .insert(items)
      .values({ categoryId: cat.id, name: "Serbuk Te'gi Karate", unit: "kg" })
      .returning({ id: items.id });

    await db.insert(transactions).values([
      {
        itemId: item.id,
        type: "in",
        qty: 100,
        unitPrice: 12000,
        total: 1200000,
        note: "Stok awal",
        date: new Date().toISOString().slice(0, 10),
      },
      {
        itemId: item.id,
        type: "out",
        qty: 20,
        purpose: "produksi",
        note: "Produksi batch pertama",
        date: new Date().toISOString().slice(0, 10),
      },
    ]);
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
