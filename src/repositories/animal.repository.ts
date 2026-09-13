import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';

export interface AnimalFiltros {
  especie_id?: number;
  raza_id?: number;
  lote_id?: number;
  estado?: string;
  genero?: string;
  busqueda?: string;
}

export interface PaginacionInput {
  skip: number;
  take: number;
}

const INCLUDE_RELACIONES = {
  especies: true,
  razas: true,
  lotes_animales: true,
} satisfies Prisma.animalesInclude;

export class AnimalRepository {
  private buildWhere(filtros: AnimalFiltros): Prisma.animalesWhereInput {
    const where: Prisma.animalesWhereInput = {
      especie_id: filtros.especie_id,
      raza_id: filtros.raza_id,
      lote_id: filtros.lote_id,
      estado: filtros.estado,
      genero: filtros.genero,
    };

    if (filtros.busqueda) {
      where.OR = [
        { nombre: { contains: filtros.busqueda, mode: 'insensitive' } },
        { codigo: { contains: filtros.busqueda, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  findAll(filtros: AnimalFiltros, paginacion: PaginacionInput) {
    const where = this.buildWhere(filtros);

    return prisma.animales.findMany({
      where,
      include: INCLUDE_RELACIONES,
      orderBy: { creado_en: 'desc' },
      skip: paginacion.skip,
      take: paginacion.take,
    });
  }

  count(filtros: AnimalFiltros) {
    const where = this.buildWhere(filtros);
    return prisma.animales.count({ where });
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