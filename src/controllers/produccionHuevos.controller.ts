import { Request, Response } from 'express';
import { ProduccionHuevosService, ServiceError } from '../services/produccionHuevos.service';

export class ProduccionHuevosController {
  private service = new ProduccionHuevosService();

  list = async (req: Request, res: Response) => {
    const lote_id = req.query.lote_id ? Number(req.query.lote_id) : undefined;
    const registros = await this.service.listAll({ lote_id });
    res.json(registros);
  };

  getById = async (req: Request, res: Response) => {
    try {
      const registro = await this.service.getById(Number(req.params.id));
      res.json(registro);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const registro = await this.service.create(req.body);
      res.status(201).json(registro);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const registro = await this.service.update(Number(req.params.id), req.body);
      res.json(registro);
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
