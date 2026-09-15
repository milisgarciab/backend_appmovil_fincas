import { NextFunction, Request, Response } from 'express';
import { ProduccionService } from '@services/produccion.service';

export class ProduccionController {
  constructor(private readonly service: ProduccionService = new ProduccionService()) {}

  resumenHoy = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json(await this.service.resumenHoy());
    } catch (error) {
      next(error);
    }
  };
}