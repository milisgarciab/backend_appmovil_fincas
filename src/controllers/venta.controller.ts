import { Request, Response } from 'express';
import { VentaService } from '../services/venta.service';

export class VentaController {
  private service = new VentaService();

  getAll = async (_req: Request, res: Response) => {
    res.json(await this.service.getAll());
  };

  getById = async (req: Request, res: Response) => {
    const venta = await this.service.getById(Number(req.params.id));
    if (!venta) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Venta no encontrada' } });
    }
    res.json(venta);
  };

  create = async (req: Request, res: Response) => {
    try {
      const venta = await this.service.create(req.body);
      res.status(201).json(venta);
    } catch (err: any) {
      res.status(err.status ?? 500).json({ error: { code: err.code ?? 'INTERNAL', message: err.message ?? 'Error interno' } });
    }
  };
}