-- AlterTable
ALTER TABLE "seguimiento_gestacion" ADD COLUMN     "macho_id" INTEGER,
ADD COLUMN     "tipo" VARCHAR(20);

-- AddForeignKey
ALTER TABLE "seguimiento_gestacion" ADD CONSTRAINT "seguimiento_gestacion_macho_id_fkey" FOREIGN KEY ("macho_id") REFERENCES "animales"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
