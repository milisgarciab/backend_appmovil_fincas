import { Request, Response } from 'express';
import { StockService, ServiceError } from '../services/stock.service';

export class StockController {
  private service = new StockService();

  listarStock = async (_req: Request, res: Response) => {
    try {
      res.json(await this.service.listarStock());
    } catch (error) {
      this.handleError(error, res);
    }
  };

  listarMovimientos = async (req: Request, res: Response) => {
    try {
      res.json(
        await this.service.listarMovimientos({
          producto: req.query.producto as string | undefined,
          origen: req.query.origen as string | undefined,
          limite: req.query.limite as string | undefined,
        }),
      );
    } catch (error) {
      this.handleError(error, res);
    }
  };

  ajustar = async (req: Request, res: Response) => {
    try {
      res.status(201).json(await this.service.ajustar(req.body, req.usuario!.id));
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
