const cloudinary = require("./cloudinary");

function uploadImagem(
buffer,
nomeArquivo,
pasta = "mimo-quatro-patas/produtos"
) {
return new Promise((resolve, reject) => {
const uploadStream = cloudinary.uploader.upload_stream(
{
folder: pasta,
public_id: nomeArquivo,
resource_type: "image",
},
(error, result) => {
if (error) {
return reject(error);
}


    resolve(result);
  }
);

uploadStream.end(buffer);


});
}

module.exports = uploadImagem;
