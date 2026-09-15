import { Request, Response } from 'express';
import { RazaService, ServiceError } from '../services/raza.service';

export class RazaController {
  private service = new RazaService();

  list = async (req: Request, res: Response) => {
    const especieId = req.query.especie_id ? Number(req.query.especie_id) : undefined;
    const razas = await this.service.listAll(especieId);
    res.json(razas);
  };

  getById = async (req: Request, res: Response) => {
    const raza = await this.service.getById(Number(req.params.id));
    if (!raza) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Raza no encontrada' } });
    }
    res.json(raza);
  };

  create = async (req: Request, res: Response) => {
    try {
      const raza = await this.service.create(req.body);
      res.status(201).json(raza);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const raza = await this.service.update(Number(req.params.id), req.body);
      res.json(raza);
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
