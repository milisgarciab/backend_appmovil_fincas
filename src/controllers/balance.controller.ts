import { Request, Response } from 'express';
import { BalanceService, ServiceError } from '../services/balance.service';

export class BalanceController {
  private service = new BalanceService();

  list = async (_req: Request, res: Response) => {
    res.json(await this.service.listAll());
  };

  getById = async (req: Request, res: Response) => {
    try {
      res.json(await this.service.getById(Number(req.params.id)));
    } catch (error) {
      this.handleError(error, res);
    }
  };

  generar = async (req: Request, res: Response) => {
    try {
      res.status(201).json(await this.service.generar(req.body));
    } catch (error) {
      this.handleError(error, res);
    }
  };

  resumenRapido = async (req: Request, res: Response) => {
    const rangoQuery = (req.query.rango as string) ?? 'hoy';
    const rango = ['hoy', 'semana', 'mes'].includes(rangoQuery) ? (rangoQuery as 'hoy' | 'semana' | 'mes') : 'hoy';
    res.json(await this.service.resumenRapido(rango));
  };

  private handleError(error: unknown, res: Response) {
    if (error instanceof ServiceError) {
      return res.status(error.statusCode).json({ error: { code: error.code, message: error.message } });
    }
    console.error(error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } });
  }
}