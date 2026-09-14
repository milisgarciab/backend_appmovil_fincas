-- AlterTable
ALTER TABLE "animales" ADD COLUMN     "causa_inactivacion" VARCHAR(50);

-- AlterTable
ALTER TABLE "eventos_sanitarios" ADD COLUMN     "diagnostico" TEXT,
ADD COLUMN     "estado" VARCHAR(20),
ADD COLUMN     "responsable" VARCHAR(100),
ADD COLUMN     "tipo_vacuna" VARCHAR(50);
