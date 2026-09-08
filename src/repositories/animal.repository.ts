import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';

export interface AnimalFiltros {
  especie_id?: number;
  raza_id?: number;
  lote_id?: number;
  estado?: string;
  genero?: string;
}

const INCLUDE_RELACIONES = {
  especies: true,
  razas: true,
  lotes_animales: true,
} satisfies Prisma.animalesInclude;

export class AnimalRepository {
  findAll(filtros: AnimalFiltros) {
    const where: Prisma.animalesWhereInput = {
      especie_id: filtros.especie_id,
      raza_id: filtros.raza_id,
      lote_id: filtros.lote_id,
      estado: filtros.estado,
      genero: filtros.genero,
    };

    return prisma.animales.findMany({
      where,
      include: INCLUDE_RELACIONES,
      orderBy: { creado_en: 'desc' },
    });
  }

  findById(id: number) {
    return prisma.animales.findUnique({
      where: { id },
      include: INCLUDE_RELACIONES,
    });
  }

  findByCodigo(codigo: string) {
    return prisma.animales.findUnique({ where: { codigo } });
  }

  create(data: Prisma.animalesUncheckedCreateInput) {
    return prisma.animales.create({ data, include: INCLUDE_RELACIONES });
  }

  update(id: number, data: Prisma.animalesUncheckedUpdateInput) {
    return prisma.animales.update({ where: { id }, data, include: INCLUDE_RELACIONES });
  }

  delete(id: number) {
    // DELETE real en base de datos — confirmado por el usuario, no soft delete.
    return prisma.animales.delete({ where: { id } });
  }
}