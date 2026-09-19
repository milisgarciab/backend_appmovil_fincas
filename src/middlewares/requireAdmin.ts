import { NextFunction, Request, Response } from 'express';
import { AppError } from '@middlewares/errorHandler';

const ROL_ADMINISTRADOR_ID = 1;

// Debe usarse DESPUÉS de authenticate, ya que depende de req.usuario.
export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.usuario || req.usuario.rol_id !== ROL_ADMINISTRADOR_ID) {
    return next(new AppError('Requiere rol de Administrador', 403, 'FORBIDDEN'));
  }
  next();
}