import { Request, Response } from 'express';
import { FinancieroService } from '../services/financiero.service';

export class FinancieroController {
  private service = new FinancieroService();

  getResumen = async (req: Request, res: Response) => {
    const { desde, hasta } = req.query as { desde?: string; hasta?: string };
    res.json(await this.service.getResumen(desde, hasta));
  };

  getValorProduccion = async (_req: Request, res: Response) => {
    res.json(await this.service.getValorProduccionHoy());
  };
}