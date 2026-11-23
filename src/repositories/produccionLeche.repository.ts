import { prisma } from '../config/prisma';
import { compensarProduccion, registrarEntradaProduccion } from './stock.repository';

export interface ProduccionLecheFiltros {
  animal_id?: number;
  lote_id?: number;
  // Por defecto (false/undefined), las listas NO incluyen los registros
  // borrados lógicamente — igual que antes. Lo usa la pantalla de
  // "Historial completo" para traer también los eliminados, con sus
  // campos `eliminado_en`/`eliminado_por` ya resueltos (2026-10-01).
  incluir_eliminados?: boolean;
}

// Include común: trae el nombre del usuario que creó y, si aplica, el que
// eliminó el registro — así el frontend no tiene que hacer otra consulta
// para mostrar "registrado por" / "eliminado por" (2026-10-01).
const INCLUDE_CON_AUDITORIA = {
  animales: true,
  lotes_animales: true,
  creado_por: { select: { id: true, nombre_usuario: true } },
  eliminado_por: { select: { id: true, nombre_usuario: true } },
};

export class ProduccionLecheRepository {
  findAll(filtros: ProduccionLecheFiltros) {
    return prisma.produccion_leche.findMany({
      where: {
        animal_id: filtros.animal_id,
        lote_id: filtros.lote_id,
        ...(filtros.incluir_eliminados ? {} : { eliminado_en: null }),
      },
      include: INCLUDE_CON_AUDITORIA,
      orderBy: { registrado_en: 'desc' },
    });
  }

  findById(id: number) {
    return prisma.produccion_leche.findUnique({
      where: { id },
      include: INCLUDE_CON_AUDITORIA,
    });
  }

  create(data: {
    animal_id?: number;
    lote_id?: number;
    litros: number;
    jornada?: string;
    observaciones?: string;
    registrado_en?: Date;
    creado_por_id?: number;
  }) {
    // El registro y su entrada de stock se guardan juntos o ninguno.
    return prisma.$transaction(
      async (tx) => {
        const registro = await tx.produccion_leche.create({ data, include: INCLUDE_CON_AUDITORIA });
        await registrarEntradaProduccion(tx, {
          producto: 'Leche',
          origen: 'ProduccionLeche',
          origen_id: registro.id,
          cantidad: Number(registro.litros),
          usuario_id: data.creado_por_id,
        });
        return registro;
      },
      { timeout: 15000 },
    );
  }

  update(
    id: number,
    data: {
      litros?: number;
      jornada?: string;
      observaciones?: string;
      registrado_en?: Date;
      // Quién edita: solo para el movimiento de stock, no se guarda en el registro.
      usuario_id?: number;
    },
  ) {
    const { usuario_id, ...campos } = data;
    return prisma.$transaction(
      async (tx) => {
        const registro = await tx.produccion_leche.update({
          where: { id },
          data: campos,
          include: INCLUDE_CON_AUDITORIA,
        });
        await compensarProduccion(tx, {
          producto: 'Leche',
          origen: 'ProduccionLeche',
          origen_id: id,
          aprovechable: Number(registro.litros),
          usuario_id,
          motivo: 'Edición del registro de producción',
        });
        return registro;
      },
      { timeout: 15000 },
    );
  }

  // Borrado lógico (2026-10-01): el registro ya NUNCA se elimina
  // físicamente — se marca `eliminado_en`/`eliminado_por_id` para poder
  // mostrarlo en el historial ("Registro eliminado el ... por ..."). El
  // `delete()` real de Prisma ya no se usa en ningún flujo del API.
  softDelete(id: number, eliminadoPorId: number) {
    // La reversa de stock y el borrado lógico se guardan juntos o ninguno.
    return prisma.$transaction(
      async (tx) => {
        const registro = await tx.produccion_leche.update({
          where: { id },
          data: { eliminado_en: new Date(), eliminado_por_id: eliminadoPorId },
          include: INCLUDE_CON_AUDITORIA,
        });
        await compensarProduccion(tx, {
          producto: 'Leche',
          origen: 'ProduccionLeche',
          origen_id: id,
          aprovechable: 0,
          usuario_id: eliminadoPorId,
          motivo: 'Registro de producción eliminado',
        });
        return registro;
      },
      { timeout: 15000 },
    );
  }

  async resumenHoy() {
    const inicio = new Date();
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date(inicio);
    fin.setDate(fin.getDate() + 1);
    // `eliminado_en: null` — un registro borrado no debe seguir contando
    // en los totales de hoy (2026-10-01).
    const where = { registrado_en: { gte: inicio, lt: fin }, eliminado_en: null };

    const [totales, registros] = await Promise.all([
      prisma.produccion_leche.aggregate({ _sum: { litros: true }, where }),
      prisma.produccion_leche.findMany({
        where,
        include: INCLUDE_CON_AUDITORIA,
        orderBy: { registrado_en: 'desc' },
      }),
    ]);

    return {
      totalLitros: Number(totales._sum.litros ?? 0),
      registros,
    };
  }
}
