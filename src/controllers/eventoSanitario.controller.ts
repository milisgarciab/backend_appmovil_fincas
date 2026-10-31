import { Request, Response } from 'express';
import { EventoSanitarioService, ServiceError } from '../services/eventoSanitario.service';
 
export class EventoSanitarioController {
  private service = new EventoSanitarioService();
 
  list = async (req: Request, res: Response) => {
    const animal_id = req.query.animal_id ? Number(req.query.animal_id) : undefined;
    const tipo_evento = req.query.tipo_evento ? String(req.query.tipo_evento) : undefined;
    // 2026-11-01: ?incluir_eliminados=true trae también los eliminados
    // (borrado lógico) -- lo usa "Eventos de salud registrados" cuando se
    // activa el filtro "Eliminados".
    const incluir_eliminados = req.query.incluir_eliminados === 'true';
    const eventos = await this.service.listAll({ animal_id, tipo_evento, incluir_eliminados });
    res.json(eventos);
  };
 
  getById = async (req: Request, res: Response) => {
    try {
      const evento = await this.service.getById(Number(req.params.id));
      res.json(evento);
    } catch (error) {
      this.handleError(error, res);
    }
  };
 
  create = async (req: Request, res: Response) => {
    try {
      const evento = await this.service.create(req.body, req.usuario!.id);
      res.status(201).json(evento);
    } catch (error) {
      this.handleError(error, res);
    }
  };
 
  update = async (req: Request, res: Response) => {
    try {
      const evento = await this.service.update(Number(req.params.id), req.body, req.usuario!.id);
      res.json(evento);
    } catch (error) {
      this.handleError(error, res);
    }
  };
 
  cambiarEstado = async (req: Request, res: Response) => {
    try {
      const evento = await this.service.cambiarEstado(Number(req.params.id), req.body?.estado, req.usuario!.id);
      res.json(evento);
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
 