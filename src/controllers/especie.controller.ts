import { Request, Response } from 'express';
import { EspecieService, ServiceError } from '../services/especie.service';

export class EspecieController {
  private service = new EspecieService();

  list = async (_req: Request, res: Response) => {
    const especies = await this.service.listAll();
    res.json(especies);
  };

  getById = async (req: Request, res: Response) => {
    const especie = await this.service.getById(Number(req.params.id));
    if (!especie) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Especie no encontrada' } });
    }
    res.json(especie);
  };

  create = async (req: Request, res: Response) => {
    try {
      const especie = await this.service.create(req.body);
      res.status(201).json(especie);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const especie = await this.service.update(Number(req.params.id), req.body);
      res.json(especie);
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
