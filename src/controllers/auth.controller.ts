import { NextFunction, Request, Response } from 'express';
import { AuthService } from '@services/auth.service';

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

  logout = async (_req: Request, res: Response) => {
    res.status(204).send();
  };
}
