import { Request, Response } from 'express';
import { BodegaService, ServiceError } from '../services/bodega.service';

export class BodegaController {
  private service = new BodegaService();

  list = async (req: Request, res: Response) => {
    const categoria_id = req.query.categoria_id ? Number(req.query.categoria_id) : undefined;
    const insumos = await this.service.listAll({ categoria_id });
    res.json(insumos);
  };

  getById = async (req: Request, res: Response) => {
    try {
      const insumo = await this.service.getById(Number(req.params.id));
      res.json(insumo);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const insumo = await this.service.create(req.body);
      res.status(201).json(insumo);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const insumo = await this.service.update(Number(req.params.id), req.body);
      res.json(insumo);
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
