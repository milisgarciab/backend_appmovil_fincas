import { prisma } from '../config/prisma';

export interface AuditoriaFiltros {
  usuario_id?: number;
  metodo?: string;
}

export class AuditoriaRepository {
  findAll(filtros: AuditoriaFiltros) {
    return prisma.auditoria.findMany({
      where: { usuario_id: filtros.usuario_id, metodo: filtros.metodo },
      orderBy: { fecha: 'desc' },
      take: 200,
    });
  }
}