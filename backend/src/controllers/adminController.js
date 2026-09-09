const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");

// =====================================================
// LOGIN DO ADMINISTRADOR
// =====================================================

async function loginAdmin(req, res) {
  try {
    const { email, senha } = req.body;

    // ==============================
    // VALIDAÇÃO
    // ==============================

    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        message: "Informe o e-mail e a senha.",
      });
    }

    const emailNormalizado = String(email)
      .trim()
      .toLowerCase();

    // ==============================
    // BUSCAR ADMIN
    // ==============================

    const admin = await prisma.admin.findUnique({
      where: {
        email: emailNormalizado,
      },
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "E-mail ou senha inválidos.",
      });
    }

    // ==============================
    // VERIFICAR ATIVO
    // ==============================

    if (!admin.ativo) {
      return res.status(403).json({
        success: false,
        message: "Este administrador está desativado.",
      });
    }

    // ==============================
    // COMPARAR SENHA
    // ==============================

    const senhaValida = await bcrypt.compare(
      String(senha),
      admin.senha
    );

    if (!senhaValida) {
      return res.status(401).json({
        success: false,
        message: "E-mail ou senha inválidos.",
      });
    }

    // ==============================
    // RESPOSTA
    // ==============================

    return res.json({
      success: true,
      message: "Login realizado com sucesso.",
      admin: {
        id: admin.id,
        nome: admin.nome,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("ERRO AO FAZER LOGIN:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao realizar login.",
    });
  }
}

module.exports = {
  loginAdmin,
};