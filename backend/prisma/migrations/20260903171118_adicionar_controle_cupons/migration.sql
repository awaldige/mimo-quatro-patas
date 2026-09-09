-- AlterTable
ALTER TABLE "Cupom" ADD COLUMN     "limiteUsos" INTEGER,
ADD COLUMN     "usosAtual" INTEGER NOT NULL DEFAULT 0;
