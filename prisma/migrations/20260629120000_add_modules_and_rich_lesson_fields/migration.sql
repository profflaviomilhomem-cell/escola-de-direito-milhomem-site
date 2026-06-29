-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "keyPoints" JSONB,
ADD COLUMN     "materials" JSONB,
ADD COLUMN     "moduleId" TEXT,
ADD COLUMN     "posterImage" TEXT,
ADD COLUMN     "slidesUrl" TEXT,
ADD COLUMN     "summary" TEXT,
ADD COLUMN     "videoSrc" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "catalogLabel" TEXT,
ADD COLUMN     "coverGradient" JSONB,
ADD COLUMN     "shortTitle" TEXT;

-- CreateTable
CREATE TABLE "Module" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Module_productId_position_idx" ON "Module"("productId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Module_productId_slug_key" ON "Module"("productId", "slug");

-- CreateIndex
CREATE INDEX "Lesson_moduleId_position_idx" ON "Lesson"("moduleId", "position");

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE SET NULL ON UPDATE CASCADE;
