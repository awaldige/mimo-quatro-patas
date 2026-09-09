const bcrypt = require("bcryptjs");

const prisma = require("../config/prisma");

async function criarAdmin() {
  try {
    const nome = "Administrador";
    const email = "admin@mimoquatropatas.com";
    const senha = "Admin@123";

    // Verifica se já existe
    const adminExistente = await prisma.admin.findUnique({
      where: {
        email,
      },
    });

    if (adminExistente) {
      console.log("⚠️ Este administrador já existe.");
      return;
    }

    // Criptografa a senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Cria o administrador
    const admin = await prisma.admin.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        ativo: true,
      },
    });

    console.log("======================================");
    console.log("✅ ADMINISTRADOR CRIADO COM SUCESSO");
    console.log("======================================");
    console.log(`ID: ${admin.id}`);
    console.log(`Nome: ${admin.nome}`);
    console.log(`E-mail: ${admin.email}`);
    console.log("Senha: Admin@123");
    console.log("======================================");
  } catch (error) {
    console.error(
      "❌ ERRO AO CRIAR ADMINISTRADOR:",
      error
    );
  } finally {
    await prisma.$disconnect();
  }
}

criarAdmin();