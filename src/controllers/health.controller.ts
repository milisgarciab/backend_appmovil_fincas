import { NextFunction, Request, Response } from 'express';
import { HealthService } from '@services/health.service';

// Capa de controladores: solo traduce HTTP <-> servicio, sin lógica de negocio ni acceso a datos directo.
export class HealthController {
  constructor(private readonly healthService: HealthService = new HealthService()) {}

  getStatus = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const status = await this.healthService.getStatus();
      res.status(200).json(status);
    } catch (error) {
      next(error);
    }
  };
}
