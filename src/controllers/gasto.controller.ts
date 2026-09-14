import { Request, Response } from 'express';
import { GastoService } from '../services/gasto.service';

export class GastoController {
  private service = new GastoService();

  getAll = async (_req: Request, res: Response) => {
    res.json(await this.service.getAll());
  };

  getById = async (req: Request, res: Response) => {
    const gasto = await this.service.getById(Number(req.params.id));
    if (!gasto) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Gasto no encontrado' } });
    }
    res.json(gasto);
  };

  create = async (req: Request, res: Response) => {
    try {
      const gasto = await this.service.create(req.body);
      res.status(201).json(gasto);
    } catch (err: any) {
      res.status(err.status ?? 500).json({ error: { code: err.code ?? 'INTERNAL', message: err.message ?? 'Error interno' } });
    }
  };
}