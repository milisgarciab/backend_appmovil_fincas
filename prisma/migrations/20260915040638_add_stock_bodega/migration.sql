-- AlterTable
ALTER TABLE "bodega" ADD COLUMN     "stock_actual" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "stock_minimo" DECIMAL(10,2) NOT NULL DEFAULT 0;
