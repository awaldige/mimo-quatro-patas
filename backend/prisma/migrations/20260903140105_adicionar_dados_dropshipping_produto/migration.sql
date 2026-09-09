-- AlterTable
ALTER TABLE "Produto" ADD COLUMN     "custoFornecedor" DECIMAL(10,2),
ADD COLUMN     "linkFornecedor" TEXT,
ADD COLUMN     "skuFornecedor" TEXT;
