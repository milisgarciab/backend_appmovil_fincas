import { Request, Response } from 'express';
import { CategoriaBodegaService, ServiceError } from '../services/categoriaBodega.service';

export class CategoriaBodegaController {
  private service = new CategoriaBodegaService();

  list = async (_req: Request, res: Response) => {
    const categorias = await this.service.listAll();
    res.json(categorias);
  };

  getById = async (req: Request, res: Response) => {
    const categoria = await this.service.getById(Number(req.params.id));
    if (!categoria) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Categoría no encontrada' } });
    }
    res.json(categoria);
  };

  create = async (req: Request, res: Response) => {
    try {
      const categoria = await this.service.create(req.body);
      res.status(201).json(categoria);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const categoria = await this.service.update(Number(req.params.id), req.body);
      res.json(categoria);
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
