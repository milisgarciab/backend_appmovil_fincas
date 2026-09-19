import { Request, Response } from 'express';
import { MovimientoInventarioService, ServiceError } from '../services/movimientoInventario.service';

export class MovimientoInventarioController {
  private service = new MovimientoInventarioService();

  list = async (req: Request, res: Response) => {
    const insumoId = req.query.insumo_id ? Number(req.query.insumo_id) : undefined;
    const tipo = req.query.tipo as string | undefined;
    res.json(await this.service.listAll(insumoId, tipo));
  };

  registrar = async (req: Request, res: Response) => {
    try {
      res.status(201).json(await this.service.registrar(req.body));
    } catch (error) {
      if (error instanceof ServiceError) {
        return res.status(error.statusCode).json({ error: { code: error.code, message: error.message } });
      }
      console.error(error);
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } });
    }
  };
}