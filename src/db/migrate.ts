import "./env";
import { migrate } from "drizzle-orm/postgres-js/migrator";

import { db } from "./index";

migrate(db, { migrationsFolder: "./drizzle" })
  .then(() => {
    console.log("Migrations applied.");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
