import { NextFunction, Request, Response } from 'express';
import { UsuarioService } from '@services/usuario.service';
import { AppError } from '@middlewares/errorHandler';

const ROL_ADMINISTRADOR_ID = 1;

export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService = new UsuarioService()) {}

  list = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json(await this.usuarioService.listAll());
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json(await this.usuarioService.getById(Number(req.params.id)));
    } catch (error) {
      next(error);
    }
  };

  crear = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json(await this.usuarioService.crear(req.body));
    } catch (error) {
      next(error);
    }
  };

  asignarRol = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json(await this.usuarioService.asignarRol(Number(req.params.id), req.body?.rol_id));
    } catch (error) {
      next(error);
    }
  };

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