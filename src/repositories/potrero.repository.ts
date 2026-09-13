import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';

export class PotreroRepository {
  findAll() {
    return prisma.ubicaciones_potreros.findMany({ orderBy: { nombre: 'asc' } });
  }

  findById(id: number) {
    return prisma.ubicaciones_potreros.findUnique({ where: { id } });
  }

  create(data: Prisma.ubicaciones_potrerosUncheckedCreateInput) {
    return prisma.ubicaciones_potreros.create({ data });
  }

  update(id: number, data: Prisma.ubicaciones_potrerosUncheckedUpdateInput) {
    return prisma.ubicaciones_potreros.update({ where: { id }, data });
  }

  delete(id: number) {
    return prisma.ubicaciones_potreros.delete({ where: { id } });
  }

  // Animales cuyo lote pertenece a este potrero (potrero → lotes → animales)
  findAnimalesDelPotrero(potreroId: number) {
    return prisma.animales.findMany({
      where: { lotes_animales: { potrero_id: potreroId } },
      include: { especies: true, razas: true, lotes_animales: true },
      orderBy: { creado_en: 'desc' },
    });
  }
}