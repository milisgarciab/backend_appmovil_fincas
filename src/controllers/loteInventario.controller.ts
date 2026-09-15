import { Request, Response } from 'express';
import { LoteInventarioService, ServiceError } from '../services/loteInventario.service';

export class LoteInventarioController {
  private service = new LoteInventarioService();

  list = async (req: Request, res: Response) => {
    const insumo_id = req.query.insumo_id ? Number(req.query.insumo_id) : undefined;
    const proximosAVencer = req.query.vence_en_dias ? Number(req.query.vence_en_dias) : undefined;
    const lotes = await this.service.listAll({ insumo_id, proximosAVencer });
    res.json(lotes);
  };

  getById = async (req: Request, res: Response) => {
    try {
      const lote = await this.service.getById(Number(req.params.id));
      res.json(lote);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const lote = await this.service.create(req.body);
      res.status(201).json(lote);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const lote = await this.service.update(Number(req.params.id), req.body);
      res.json(lote);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      await this.service.delete(Number(req.params.id));
      res.status(204).send();
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
