import { Request, Response } from 'express';
import { PotreroService, ServiceError } from '../services/potrero.service';

export class PotreroController {
  private service = new PotreroService();

  list = async (_req: Request, res: Response) => {
    const potreros = await this.service.listAll();
    res.json(potreros);
  };

  getById = async (req: Request, res: Response) => {
    try {
      const potrero = await this.service.getById(Number(req.params.id));
      res.json(potrero);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const potrero = await this.service.create(req.body);
      res.status(201).json(potrero);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const potrero = await this.service.update(Number(req.params.id), req.body);
      res.json(potrero);
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

  getAnimales = async (req: Request, res: Response) => {
    try {
      const animales = await this.service.getAnimalesDelPotrero(Number(req.params.id));
      res.json(animales);
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