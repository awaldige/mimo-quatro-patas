-- AlterTable
ALTER TABLE "PedidoItem" ADD COLUMN     "custoFornecedor" DECIMAL(10,2),
ADD COLUMN     "dataEncaminhamento" TIMESTAMP(3),
ADD COLUMN     "dataEntregaFornecedor" TIMESTAMP(3),
ADD COLUMN     "dataEnvioFornecedor" TIMESTAMP(3),
ADD COLUMN     "dataPedidoFornecedor" TIMESTAMP(3),
ADD COLUMN     "fornecedorId" INTEGER,
ADD COLUMN     "fornecedorNome" TEXT,
ADD COLUMN     "linkFornecedor" TEXT,
ADD COLUMN     "numeroPedidoFornecedor" TEXT,
ADD COLUMN     "skuFornecedor" TEXT,
ADD COLUMN     "statusFornecedor" TEXT NOT NULL DEFAULT 'AGUARDANDO_FORNECEDOR';

-- AddForeignKey
ALTER TABLE "PedidoItem" ADD CONSTRAINT "PedidoItem_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "Fornecedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
