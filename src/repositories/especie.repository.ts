import { prisma } from '../config/prisma';

export class EspecieRepository {
  findAll() {
    return prisma.especies.findMany({ orderBy: { nombre: 'asc' } });
  }

  findById(id: number) {
    return prisma.especies.findUnique({ where: { id } });
  }

  create(data: { nombre: string }) {
    return prisma.especies.create({ data });
  }

  update(id: number, data: { nombre?: string }) {
    return prisma.especies.update({ where: { id }, data });
  }

  delete(id: number) {
    return prisma.especies.delete({ where: { id } });
  }
}
