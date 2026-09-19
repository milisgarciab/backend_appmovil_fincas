import { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma';

const METODOS_AUDITABLES = ['POST', 'PUT', 'PATCH', 'DELETE'];

// Registra cada acción de escritura (crear/editar/eliminar) sin bloquear la respuesta.
// Se ejecuta después de que la petición ya pasó por authenticate (si aplicaba),
// así que req.usuario ya está disponible cuando el response termina.
export function auditLog(req: Request, res: Response, next: NextFunction) {
  if (!METODOS_AUDITABLES.includes(req.method)) {
    return next();
  }

  res.on('finish', () => {
    prisma.auditoria
      .create({
        data: {
          usuario_id: req.usuario?.id,
          metodo: req.method,
          ruta: req.originalUrl,
          codigo_respuesta: res.statusCode,
        },
      })
            .catch((err: unknown) => console.error('No se pudo registrar auditoria:', err));
  });

  next();
}