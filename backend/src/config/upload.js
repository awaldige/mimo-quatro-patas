const multer = require("multer");

const storage = multer.memoryStorage();

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
        new Error(
          "Formato de imagem não permitido. Use JPG, PNG ou WEBP."
        )
      );
    }
  },

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});