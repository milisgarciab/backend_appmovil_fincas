import { prisma } from '../config/prisma';

export interface ProduccionLecheFiltros {
  animal_id?: number;
}

export class ProduccionLecheRepository {
  findAll(filtros: ProduccionLecheFiltros) {
    return prisma.produccion_leche.findMany({
      where: { animal_id: filtros.animal_id },
      include: { animales: true },
      orderBy: { registrado_en: 'desc' },
    });
  }

  findById(id: number) {
    return prisma.produccion_leche.findUnique({
      where: { id },
      include: { animales: true },
    });
  }

  create(data: { animal_id: number; litros: number; jornada?: string; registrado_en?: Date }) {
    return prisma.produccion_leche.create({ data });
  }

  update(
    id: number,
    data: { litros?: number; jornada?: string; registrado_en?: Date },
  ) {
    return prisma.produccion_leche.update({ where: { id }, data });
  }

  delete(id: number) {
    return prisma.produccion_leche.delete({ where: { id } });
  }
}
