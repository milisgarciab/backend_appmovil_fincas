import { NextFunction, Request, Response } from 'express';
import { AuthService, solicitarRecuperacion, restablecerPassword } from '@services/auth.service';

// Capa de controladores: solo traduce HTTP <-> servicio, sin lógica de negocio ni acceso a datos directo.
export class AuthController {
  constructor(private readonly authService: AuthService = new AuthService()) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const usuario = await this.authService.register(req.body);
      res.status(201).json(usuario);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.login(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.refresh(req.body?.refreshToken);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  // Sin rotación ni blacklist de refresh tokens (decisión confirmada: expiración simple).
  // Logout no tiene estado en el servidor; el cliente descarta los tokens que tenía guardados.
  logout = async (_req: Request, res: Response) => {
    res.status(204).send();
  };

  // HU-03: Recuperar contraseña
  forgotPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res
          .status(400)
          .json({ error: { code: 'VALIDATION_ERROR', message: 'El email es obligatorio' } });
      }
      const resultado = await solicitarRecuperacion(email);
      res.status(200).json(resultado);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } });
    }
  };

  resetPassword = async (req: Request, res: Response) => {
    try {
      const { token, nueva_password } = req.body;
      if (!token || !nueva_password) {
        return res
          .status(400)
          .json({
            error: { code: 'VALIDATION_ERROR', message: 'token y nueva_password son obligatorios' },
          });
      }
      const resultado = await restablecerPassword(token, nueva_password);
      res.status(200).json(resultado);
    } catch (error) {
      res
        .status(400)
        .json({ error: { code: 'INVALID_RESET_TOKEN', message: (error as Error).message } });
    }
  };
}