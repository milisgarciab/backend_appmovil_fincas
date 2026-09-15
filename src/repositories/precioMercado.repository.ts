import { prisma } from '../config/prisma';

export class PrecioMercadoRepository {
  findAll() {
    return prisma.precios_mercado.findMany({ orderBy: { fecha: 'desc' } });
  }

  findById(id: number) {
    return prisma.precios_mercado.findUnique({ where: { id } });
  }

  create(data: { producto: string; precio: number; fecha: Date }) {
    return prisma.precios_mercado.create({ data });
  }

  update(id: number, data: Partial<{ producto: string; precio: number; fecha: Date }>) {
    return prisma.precios_mercado.update({ where: { id }, data });
  }

  delete(id: number) {
    return prisma.precios_mercado.delete({ where: { id } });
  }
}