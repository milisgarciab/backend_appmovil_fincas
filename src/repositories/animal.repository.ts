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

const INCLUDE_RELACIONES = {
  especies: true,
  razas: true,
  lotes_animales: true,
} satisfies Prisma.animalesInclude;

function construirWhere(filtros: AnimalFiltros): Prisma.animalesWhereInput {
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

export class AnimalRepository {
  findAll(filtros: AnimalFiltros, paginacion?: { skip: number; take: number }) {
    return prisma.animales.findMany({
      where: construirWhere(filtros),
      include: INCLUDE_RELACIONES,
      orderBy: { creado_en: 'desc' },
      skip: paginacion?.skip,
      take: paginacion?.take,
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

  count(filtros: AnimalFiltros) {
    return prisma.animales.count({ where: construirWhere(filtros) });
  }

  create(data: Prisma.animalesUncheckedCreateInput) {
    return prisma.animales.create({ data, include: INCLUDE_RELACIONES });
  }

  update(id: number, data: Prisma.animalesUncheckedUpdateInput) {
    return prisma.animales.update({ where: { id }, data, include: INCLUDE_RELACIONES });
  }

  delete(id: number) {
    return prisma.animales.delete({ where: { id } });
  }

  async findHistorial(animalId: number) {
    const [eventosSanitarios, produccionLeche, registrosPeso, seguimientoGestacion] = await Promise.all([
      prisma.eventos_sanitarios.findMany({ where: { animal_id: animalId }, orderBy: { fecha_evento: 'desc' } }),
      prisma.produccion_leche.findMany({ where: { animal_id: animalId }, orderBy: { registrado_en: 'desc' } }),
      prisma.registros_peso.findMany({ where: { animal_id: animalId }, orderBy: { registrado_en: 'desc' } }),
      prisma.seguimiento_gestacion.findMany({ where: { animal_id: animalId }, orderBy: { fecha_inseminacion: 'desc' } }),
    ]);

    const lineaDeTiempo = [
      ...eventosSanitarios.map((e) => ({ tipo: 'evento_sanitario' as const, fecha: e.fecha_evento, detalle: e })),
      ...produccionLeche.map((p) => ({ tipo: 'produccion_leche' as const, fecha: p.registrado_en, detalle: p })),
      ...registrosPeso.map((r) => ({ tipo: 'registro_peso' as const, fecha: r.registrado_en, detalle: r })),
      ...seguimientoGestacion.map((s) => ({ tipo: 'seguimiento_gestacion' as const, fecha: s.fecha_inseminacion, detalle: s })),
    ].sort((a, b) => {
      const fechaA = a.fecha ? new Date(a.fecha).getTime() : 0;
      const fechaB = b.fecha ? new Date(b.fecha).getTime() : 0;
      return fechaB - fechaA;
    });

    return { eventosSanitarios, produccionLeche, registrosPeso, seguimientoGestacion, lineaDeTiempo };
  }
}