import { prisma } from '../config/prisma';

export class CategoriaBodegaRepository {
  findAll() {
    return prisma.categorias_bodega.findMany({ orderBy: { nombre: 'asc' } });
  }

  findById(id: number) {
    return prisma.categorias_bodega.findUnique({ where: { id } });
  }

  create(data: { nombre: string }) {
    return prisma.categorias_bodega.create({ data });
  }

  update(id: number, data: { nombre?: string }) {
    return prisma.categorias_bodega.update({ where: { id }, data });
  }

  delete(id: number) {
    return prisma.categorias_bodega.delete({ where: { id } });
  }
}
