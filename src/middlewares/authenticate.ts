import { NextFunction, Request, Response } from 'express';
import { AppError } from '@middlewares/errorHandler';
import { verifyAccessToken, TokenPayload } from '@utils/token.util';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      usuario?: TokenPayload;
    }
  }
}

// Exige un accessToken válido en el header Authorization: Bearer <token>.
// Se aplica con router.use(authenticate) al inicio de cada archivo de rutas que deba protegerse.
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Token de acceso requerido', 401, 'MISSING_TOKEN'));
  }

  const token = authHeader.slice('Bearer '.length);

  try {
    req.usuario = verifyAccessToken(token);
    next();
  } catch {
    next(new AppError('Token de acceso inválido o expirado', 401, 'INVALID_ACCESS_TOKEN'));
  }
}
