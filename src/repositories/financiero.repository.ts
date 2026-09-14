import { prisma } from '../config/prisma';

export class FinancieroRepository {
  async produccionHoy() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const [leche, huevos] = await Promise.all([
      prisma.produccion_leche.aggregate({
        _sum: { litros: true },
        where: { registrado_en: { gte: hoy, lt: manana } },
      }),
      prisma.produccion_huevos.aggregate({
        _sum: { cantidad: true },
        where: { registrado_en: { gte: hoy, lt: manana } },
      }),
    ]);

    return {
      litrosLeche: leche._sum.litros ?? 0,
      cantidadHuevos: huevos._sum.cantidad ?? 0,
    };
  }
}