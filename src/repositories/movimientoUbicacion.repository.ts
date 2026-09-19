import { prisma } from '../config/prisma';

export class MovimientoUbicacionRepository {
  findByAnimal(animalId: number) {
    return prisma.movimientos_ubicacion.findMany({
      where: { animal_id: animalId },
      orderBy: { fecha: 'desc' },
    });
  }

  animalExiste(animalId: number) {
    return prisma.animales.findUnique({ where: { id: animalId } });
  }

  async trasladar(animalId: number, potreroDestinoId: number) {
    return prisma.$transaction(async (tx) => {
      const animal = await tx.animales.findUnique({ where: { id: animalId } });
      if (!animal) {
        throw new Error('ANIMAL_NOT_FOUND');
      }

      const potreroDestino = await tx.ubicaciones_potreros.findUnique({ where: { id: potreroDestinoId } });
      if (!potreroDestino) {
        throw new Error('POTRERO_NOT_FOUND');
      }

      const potreroOrigenId = animal.potrero_id;

      await tx.animales.update({ where: { id: animalId }, data: { potrero_id: potreroDestinoId } });

      return tx.movimientos_ubicacion.create({
        data: {
          animal_id: animalId,
          potrero_origen_id: potreroOrigenId,
          potrero_destino_id: potreroDestinoId,
        },
      });
    });
  }
}