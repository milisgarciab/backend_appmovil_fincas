import { NextFunction, Request, Response } from 'express';
import { PaddockService } from '@services/paddock.service';

export class PaddockController {
  constructor(private readonly service: PaddockService = new PaddockService()) {}

  getAnimales = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json(await this.service.getAnimalesPorPotrero(Number(req.params.id)));
    } catch (error) {
      next(error);
    }
  };
}