import { Request, Response } from 'express';
import { NacimientoService, ServiceError } from '../services/nacimiento.service';

export class NacimientoController {
  private service = new NacimientoService();

  list = async (_req: Request, res: Response) => {
    res.json(await this.service.listAll());
  };

  getDescendencia = async (req: Request, res: Response) => {
    try {
      res.json(await this.service.getDescendencia(Number(req.params.id)));
    } catch (error) {
      if (error instanceof ServiceError) {
        return res.status(error.statusCode).json({ error: { code: error.code, message: error.message } });
      }
      console.error(error);
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } });
    }
  };
}