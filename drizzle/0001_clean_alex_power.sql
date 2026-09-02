ALTER TABLE "transactions" DROP CONSTRAINT "transactions_item_id_items_id_fk";
--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "item_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "item_name" text;--> statement-breakpoint
UPDATE "transactions" SET "item_name" = (SELECT "name" FROM "items" WHERE "items"."id" = "transactions"."item_id");--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE set null ON UPDATE no action;