import { prisma } from '../config/prisma';

export class LoteAnimalRepository {
  findAll() {
    return prisma.lotes_animales.findMany({ orderBy: { nombre: 'asc' } });
  }

  findById(id: number) {
    return prisma.lotes_animales.findUnique({ where: { id } });
  }

  create(data: { nombre: string; potrero_id?: number }) {
    return prisma.lotes_animales.create({ data });
  }

  update(id: number, data: { nombre?: string; potrero_id?: number }) {
    return prisma.lotes_animales.update({ where: { id }, data });
  }

  delete(id: number) {
    return prisma.lotes_animales.delete({ where: { id } });
  }
}
