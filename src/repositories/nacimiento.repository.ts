import { prisma } from '../config/prisma';

const INCLUDE_PROGENITORES = {
  especies: true,
  razas: true,
  animales_animales_madre_idToanimales: true,
  animales_animales_padre_idToanimales: true,
} as const;

export class NacimientoRepository {
  findAll() {
    return prisma.animales.findMany({
      where: { origen: 'Nacido', fecha_nacimiento: { not: null } },
      include: INCLUDE_PROGENITORES,
      orderBy: { fecha_nacimiento: 'desc' },
    });
  }

  findDescendencia(animalId: number) {
    return prisma.animales.findMany({
      where: { OR: [{ madre_id: animalId }, { padre_id: animalId }] },
      include: { especies: true, razas: true },
      orderBy: { fecha_nacimiento: 'desc' },
    });
  }

  animalExiste(animalId: number) {
    return prisma.animales.findUnique({ where: { id: animalId } });
  }
}