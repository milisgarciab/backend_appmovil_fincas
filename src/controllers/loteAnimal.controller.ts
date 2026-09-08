import { Request, Response } from 'express';
import { LoteAnimalService, ServiceError } from '../services/loteAnimal.service';

export class LoteAnimalController {
  private service = new LoteAnimalService();

  list = async (_req: Request, res: Response) => {
    const lotes = await this.service.listAll();
    res.json(lotes);
  };

  getById = async (req: Request, res: Response) => {
    const lote = await this.service.getById(Number(req.params.id));
    if (!lote) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Lote no encontrado' } });
    }
    res.json(lote);
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
