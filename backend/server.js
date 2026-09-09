const app = require("./src/app");

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🐾 Mimo Quatro Patas API rodando em http://localhost:${PORT}`);
});