-- AlterTable
ALTER TABLE "public"."staff_members" DROP COLUMN "permissions";

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "permissions" JSONB;

