import { Request, Response } from 'express';
import { AnimalService } from '../services/animal.service';

export class AnimalController {
  private service = new AnimalService();

  list = async (req: Request, res: Response) => {
    const { especie_id, raza_id, lote_id, estado, genero, buscar, page, limit } = req.query;

    // Por defecto solo se listan animales Activos, salvo que se pida
    // explícitamente estado=Todos (para ver todos) u otro estado puntual.
    let estadoFiltro: string | undefined;
    if (!estado || estado === 'Todos') {
      estadoFiltro = estado === 'Todos' ? undefined : 'Activo';
    } else {
      estadoFiltro = estado as string;
    }

    const resultado = await this.service.listAll(
      {
        especie_id: especie_id ? Number(especie_id) : undefined,
        raza_id: raza_id ? Number(raza_id) : undefined,
        lote_id: lote_id ? Number(lote_id) : undefined,
        estado: estadoFiltro,
        genero: genero as string | undefined,
        busqueda: buscar as string | undefined,
      },
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
    res.json(resultado);
  };

  getById = async (req: Request, res: Response) => {
    const animal = await this.service.getById(Number(req.params.id));
    if (!animal) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Animal no encontrado' } });
    }
    res.json(animal);
  };

  create = async (req: Request, res: Response) => {
    try {
      const animal = await this.service.create(req.body);
      res.status(201).json(animal);
    } catch (err) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: (err as Error).message } });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const animal = await this.service.update(Number(req.params.id), req.body);
      res.json(animal);
    } catch (err) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: (err as Error).message } });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      await this.service.delete(Number(req.params.id));
      res.status(204).send();
    } catch (err) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Animal no encontrado' } });
    }
  };
}