import { Request, Response } from 'express';
import { AuditoriaService } from '../services/auditoria.service';

export class AuditoriaController {
  private service = new AuditoriaService();

  list = async (req: Request, res: Response) => {
    const usuarioId = req.query.usuario_id ? Number(req.query.usuario_id) : undefined;
    const metodo = req.query.metodo as string | undefined;
    res.json(await this.service.listAll({ usuario_id: usuarioId, metodo }));
  };
}