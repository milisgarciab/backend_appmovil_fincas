import multer from 'multer';
 
// Middleware de subida de archivos en memoria (no se escribe nada a disco):
// el buffer de la imagen se toma del request y se sube directo a Cloudinary
// desde el controller/service correspondiente.
const storage = multer.memoryStorage();
 
function filtroSoloImagenes(
  _req: unknown,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('El archivo debe ser una imagen (jpg, png, etc.)'));
  }
}
 
export const uploadImagen = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: filtroSoloImagenes,
});
 