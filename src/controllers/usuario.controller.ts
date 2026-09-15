import { NextFunction, Request, Response } from 'express';
import { UsuarioService } from '@services/usuario.service';
import { AppError } from '@middlewares/errorHandler';

const ROL_ADMINISTRADOR_ID = 1;

export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService = new UsuarioService()) {}

  actualizarPerfil = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const idSolicitado = Number(req.params.id);
      const esPropio = req.usuario?.id === idSolicitado;
      const esAdmin = req.usuario?.rol_id === ROL_ADMINISTRADOR_ID;

      if (!esPropio && !esAdmin) {
        throw new AppError('Solo puedes editar tu propio perfil', 403, 'FORBIDDEN');
      }

      const usuario = await this.usuarioService.actualizarPerfil(idSolicitado, req.body);
      res.status(200).json(usuario);
    } catch (error) {
      next(error);
    }
  };

  resetearContrasena = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.usuarioService.resetearContrasena(Number(req.params.id), req.body?.nueva_contrasena);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  cambiarEstado = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const usuario = await this.usuarioService.cambiarEstado(Number(req.params.id), req.body?.estado);
      res.status(200).json(usuario);
    } catch (error) {
      next(error);
    }
  };
}