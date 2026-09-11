import { prisma } from '../config/prisma';

export interface RegistroPesoFiltros {
  animal_id?: number;
}

export class RegistroPesoRepository {
  findAll(filtros: RegistroPesoFiltros) {
    return prisma.registros_peso.findMany({
      where: { animal_id: filtros.animal_id },
      include: { animales: true },
      orderBy: { registrado_en: 'desc' },
    });
  }

  findById(id: number) {
    return prisma.registros_peso.findUnique({
      where: { id },
      include: { animales: true },
    });
  }

  create(data: { animal_id: number; peso_kg: number; registrado_en?: Date }) {
    return prisma.registros_peso.create({ data });
  }

  update(id: number, data: { peso_kg?: number; registrado_en?: Date }) {
    return prisma.registros_peso.update({ where: { id }, data });
  }

  delete(id: number) {
    return prisma.registros_peso.delete({ where: { id } });
  }
}
