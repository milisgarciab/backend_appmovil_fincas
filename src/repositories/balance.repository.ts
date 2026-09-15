import { prisma } from '../config/prisma';

export class BalanceRepository {
  async findAll() {
    return prisma.balance.findMany({ orderBy: { periodo: 'desc' } });
  }

  async findById(id: number) {
    return prisma.balance.findUnique({ where: { id } });
  }

  async create(data: {
    periodo: Date;
    total_ventas: number;
    total_gastos: number;
    balance_neto: number;
  }) {
    return prisma.balance.create({ data });
  }
}
