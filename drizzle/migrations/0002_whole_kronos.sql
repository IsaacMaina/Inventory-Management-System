CREATE TYPE "public"."payment_method" AS ENUM('mpesa_send', 'mpesa_paybill', 'mpesa_till', 'mpesa_pochi');--> statement-breakpoint
CREATE TYPE "public"."sale_status" AS ENUM('pending', 'paid', 'failed');--> statement-breakpoint
CREATE TABLE "sale_items" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sale_id" text NOT NULL,
	"product_id" text NOT NULL,
	"quantity" integer NOT NULL,
	"price_at_sale" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"total_amount" integer NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"mpesa_reference" text,
	"status" "sale_status" DEFAULT 'pending' NOT NULL,
	"cashier_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_product_id_inventory_items_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."inventory_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_cashier_id_users_id_fk" FOREIGN KEY ("cashier_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;