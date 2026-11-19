import { Readable } from 'stream';
import { cloudinary, cloudinaryConfigurado } from '../config/cloudinary';
 
/**
 * Sube un buffer de imagen a Cloudinary y devuelve la URL pública (secure_url).
 * No guarda nada en disco local -- el buffer viaja directo desde memoria.
 */
export function subirImagenACloudinary(buffer: Buffer, carpeta: string): Promise<string> {
  if (!cloudinaryConfigurado) {
    return Promise.reject(
      new Error('Cloudinary no está configurado (faltan CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET en .env)'),
    );
  }
 
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream({ folder: carpeta }, (error, result) => {
      if (error || !result) {
        return reject(error ?? new Error('Cloudinary no devolvió resultado'));
      }
      resolve(result.secure_url);
    });
 
    Readable.from(buffer).pipe(uploadStream);
  });
}
 