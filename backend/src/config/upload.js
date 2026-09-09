const multer = require("multer");
const path = require("path");
const fs = require("fs");

const pastaUploads = path.join(__dirname, "../../uploads");

if (!fs.existsSync(pastaUploads)) {
  fs.mkdirSync(pastaUploads, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, pastaUploads);
  },

  filename: function (req, file, cb) {
    const extensao = path.extname(file.originalname).toLowerCase();

    const nomeBase = path
      .basename(file.originalname, extensao)
      .replace(/[^a-zA-Z0-9-_]/g, "-");

    cb(null, `${nomeBase}-${Date.now()}${extensao}`);
  },
});

module.exports = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const tiposPermitidos = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (tiposPermitidos.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Formato de imagem não permitido. Use JPG, PNG ou WEBP.")
      );
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});