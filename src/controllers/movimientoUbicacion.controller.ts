import { Request, Response } from 'express';
import { MovimientoUbicacionService, ServiceError } from '../services/movimientoUbicacion.service';

export class MovimientoUbicacionController {
  private service = new MovimientoUbicacionService();

  getHistorial = async (req: Request, res: Response) => {
    try {
      res.json(await this.service.getHistorial(Number(req.params.id)));
    } catch (error) {
      this.handleError(error, res);
    }
  };

  trasladar = async (req: Request, res: Response) => {
    try {
      res.status(201).json(await this.service.trasladar(Number(req.params.id), req.body?.potrero_destino_id));
    } catch (error) {
      this.handleError(error, res);
    }
  };

  private handleError(error: unknown, res: Response) {
    if (error instanceof ServiceError) {
      return res.status(error.statusCode).json({ error: { code: error.code, message: error.message } });
    }
    console.error(error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } });
  }
}