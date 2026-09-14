import { Request, Response } from 'express';
import { PrecioMercadoService } from '../services/precioMercado.service';

export class PrecioMercadoController {
  private service = new PrecioMercadoService();

  getAll = async (_req: Request, res: Response) => {
    res.json(await this.service.getAll());
  };

  setPrecio = async (req: Request, res: Response) => {
    try {
      const precio = await this.service.setPrecio(req.body);
      res.status(201).json(precio);
    } catch (err: any) {
      res.status(err.status ?? 500).json({ error: { code: err.code ?? 'INTERNAL', message: err.message ?? 'Error interno' } });
    }
  };
}