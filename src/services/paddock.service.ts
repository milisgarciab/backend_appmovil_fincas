import { PaddockRepository } from '@repositories/paddock.repository';
import { AppError } from '@middlewares/errorHandler';

export class PaddockService {
  constructor(private readonly repository: PaddockRepository = new PaddockRepository()) {}

  async getAnimalesPorPotrero(id: number) {
    const potrero = await this.repository.findPotreroConAnimales(id);
    if (!potrero) {
      throw new AppError('Potrero no encontrado', 404, 'NOT_FOUND');
    }

    return {
      potrero: { id: potrero.id, nombre: potrero.nombre, estado: potrero.estado },
      conteo: potrero.animales_directo.length,
      animales: potrero.animales_directo,
      mensaje: potrero.animales_directo.length === 0 ? 'Sin animales asignados' : null,
    };
  }
}