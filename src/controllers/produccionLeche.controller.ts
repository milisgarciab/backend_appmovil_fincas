import { Request, Response } from 'express';
import { ProduccionLecheService, ServiceError } from '../services/produccionLeche.service';
 
export class ProduccionLecheController {
  private service = new ProduccionLecheService();
 
  list = async (req: Request, res: Response) => {
    const animal_id = req.query.animal_id ? Number(req.query.animal_id) : undefined;
    const lote_id = req.query.lote_id ? Number(req.query.lote_id) : undefined;
    // `incluir_eliminados=true` — lo usa la pantalla de Historial completo
    // para traer también los registros borrados lógicamente (2026-10-01).
    const incluir_eliminados = req.query.incluir_eliminados === 'true';
    const registros = await this.service.listAll({ animal_id, lote_id, incluir_eliminados });
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
      // `req.usuario.id` lo pone el middleware `authenticate` a partir del
      // token — nunca se confía en un `creado_por_id` que mande el cliente.
      const registro = await this.service.create(req.body, req.usuario!.id);
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
      await this.service.delete(Number(req.params.id), req.usuario!.id);
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
 