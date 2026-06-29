-- Capa, banner e workflow de publicação para cursos (Product)
CREATE TYPE "ProductPublishStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'SCHEDULED');

ALTER TABLE "Product" ADD COLUMN "tagline" TEXT;
ALTER TABLE "Product" ADD COLUMN "coverImage" TEXT;
ALTER TABLE "Product" ADD COLUMN "bannerImage" TEXT;
ALTER TABLE "Product" ADD COLUMN "publishStatus" "ProductPublishStatus" NOT NULL DEFAULT 'DRAFT';
ALTER TABLE "Product" ADD COLUMN "publishedAt" TIMESTAMP(3);

ALTER TABLE "Lesson" ADD COLUMN "coverImage" TEXT;

CREATE INDEX "Product_publishStatus_idx" ON "Product"("publishStatus");
