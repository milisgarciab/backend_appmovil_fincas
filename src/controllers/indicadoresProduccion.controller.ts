import { Request, Response } from 'express';
import { IndicadoresProduccionService } from '../services/indicadoresProduccion.service';

export class IndicadoresProduccionController {
  private service = new IndicadoresProduccionService();

  obtener = async (req: Request, res: Response) => {
    try {
      const resultado = await this.service.obtener({
        fecha_inicio: req.query.fecha_inicio as string | undefined,
        fecha_fin: req.query.fecha_fin as string | undefined,
      });
      res.json(resultado);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } });
    }
  };
}