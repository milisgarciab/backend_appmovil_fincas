import { prisma } from '@config/prisma';

function rangoHoy() {
  const inicio = new Date();
  inicio.setHours(0, 0, 0, 0);
  const fin = new Date(inicio);
  fin.setDate(fin.getDate() + 1);
  return { inicio, fin };
}

export class ProduccionRepository {
  async resumenHoy() {
    const { inicio, fin } = rangoHoy();

    const [leche, huevos, registrosLeche, registrosHuevos] = await Promise.all([
      prisma.produccion_leche.aggregate({
        _sum: { litros: true },
        where: { registrado_en: { gte: inicio, lt: fin } },
      }),
      prisma.produccion_huevos.aggregate({
        _sum: { cantidad: true, cantidad_rotos: true },
        where: { registrado_en: { gte: inicio, lt: fin } },
      }),
      prisma.produccion_leche.findMany({
        where: { registrado_en: { gte: inicio, lt: fin } },
        include: { animales: { select: { codigo: true, nombre: true } } },
        orderBy: { registrado_en: 'desc' },
      }),
      prisma.produccion_huevos.findMany({
        where: { registrado_en: { gte: inicio, lt: fin } },
        include: { lotes_animales: { select: { nombre: true } } },
        orderBy: { registrado_en: 'desc' },
      }),
    ]);

    return {
      totalLitrosLeche: Number(leche._sum.litros ?? 0),
      totalHuevosBuenos: Number(huevos._sum.cantidad ?? 0),
      totalHuevosRotos: Number(huevos._sum.cantidad_rotos ?? 0),
      registrosLeche,
      registrosHuevos,
    };
  }
}