import { prisma } from '../config/prisma';

export class PotreroRepository {
  findAll() {
    return prisma.ubicaciones_potreros.findMany({ orderBy: { nombre: 'asc' } });
  }

  findById(id: number) {
    return prisma.ubicaciones_potreros.findUnique({ where: { id } });
  }

  create(data: { nombre: string; capacidad_animales?: number; estado?: string }) {
    return prisma.ubicaciones_potreros.create({ data });
  }

  update(id: number, data: { nombre?: string; capacidad_animales?: number; estado?: string }) {
    return prisma.ubicaciones_potreros.update({ where: { id }, data });
  }

  delete(id: number) {
    return prisma.ubicaciones_potreros.delete({ where: { id } });
  }

  // HU-29: ver los animales asignados directamente a un potrero.
  findAnimalesDelPotrero(potreroId: number) {
    return prisma.animales.findMany({
      where: { potrero_id: potreroId },
      include: { especies: true, razas: true },
      orderBy: { codigo: 'asc' },
    });
  }
}