import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL tidak ditemukan.\n" +
      "Buat file .env di root proyek berisi connection string Supabase (lihat .env.example):\n" +
      "DATABASE_URL=postgresql://postgres.[project-ref]:[PASSWORD]@db.[project-ref].supabase.co:5432/postgres"
  );
  process.exit(1);
}
