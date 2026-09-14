import { prisma } from '../config/prisma';

export class PrecioMercadoRepository {
  async create(data: { producto: string; precio: number; fecha: Date }) {
    return prisma.precios_mercado.create({ data });
  }

  async findLatestByProducto(producto: string) {
    return prisma.precios_mercado.findFirst({
      where: { producto },
      orderBy: { fecha: 'desc' },
    });
  }

  async findAll() {
    return prisma.precios_mercado.findMany({ orderBy: { fecha: 'desc' } });
  }
}