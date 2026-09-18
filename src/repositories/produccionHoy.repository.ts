import { prisma } from '../config/prisma';

function rangoHoy() {
  const inicio = new Date();
  inicio.setHours(0, 0, 0, 0);
  const fin = new Date(inicio);
  fin.setDate(fin.getDate() + 1);
  return { inicio, fin };
}

export class ProduccionHoyRepository {
  async getResumen() {
    const { inicio, fin } = rangoHoy();
    const where = { registrado_en: { gte: inicio, lt: fin } };

    const [leche, huevos] = await Promise.all([
      prisma.produccion_leche.aggregate({ _sum: { litros: true }, where }),
      prisma.produccion_huevos.aggregate({ _sum: { cantidad: true }, where }),
    ]);

    return {
      litrosLeche: Number(leche._sum.litros ?? 0),
      cantidadHuevos: Number(huevos._sum.cantidad ?? 0),
    };
  }
}
