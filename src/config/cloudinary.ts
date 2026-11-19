import { v2 as cloudinary } from 'cloudinary';
 
// Configuración del SDK de Cloudinary, usado para subir la foto de un
// Potrero (ver ubicaciones_potreros.foto_url). Solo se necesitan estas 3
// variables si se va a usar esa funcionalidad -- si faltan, el resto del
// backend sigue funcionando normal, y el endpoint de subida de foto
// responde con un error claro en vez de tumbar el servidor al arrancar.
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
 
export const cloudinaryConfigurado = Boolean(cloudName && apiKey && apiSecret);
 
if (cloudinaryConfigurado) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}
 
export { cloudinary };
 