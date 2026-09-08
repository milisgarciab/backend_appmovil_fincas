import { Request, Response } from 'express';
import { SeguimientoGestacionService, ServiceError } from '../services/seguimientoGestacion.service';

export class SeguimientoGestacionController {
  private service = new SeguimientoGestacionService();

  list = async (req: Request, res: Response) => {
    const animal_id = req.query.animal_id ? Number(req.query.animal_id) : undefined;
    const estado = req.query.estado ? String(req.query.estado) : undefined;
    const registros = await this.service.listAll({ animal_id, estado });
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
