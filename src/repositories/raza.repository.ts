import { prisma } from '../config/prisma';

export class RazaRepository {
  findAll(especieId?: number) {
    return prisma.razas.findMany({
      where: especieId ? { especie_id: especieId } : undefined,
      orderBy: { nombre: 'asc' },
    });
  }

  findById(id: number) {
    return prisma.razas.findUnique({ where: { id } });
  }

  create(data: { nombre: string; especie_id: number }) {
    return prisma.razas.create({ data });
  }

  update(id: number, data: { nombre?: string; especie_id?: number }) {
    return prisma.razas.update({ where: { id }, data });
  }

  delete(id: number) {
    return prisma.razas.delete({ where: { id } });
  }
}
