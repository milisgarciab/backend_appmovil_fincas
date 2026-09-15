import { prisma } from '../config/prisma';

export class BalanceRepository {
  findAll() {
    return prisma.balance.findMany({ orderBy: { periodo: 'desc' } });
  }

  findById(id: number) {
    return prisma.balance.findUnique({ where: { id } });
  }

  create(data: { periodo: Date; total_ventas: number; total_gastos: number; balance_neto: number }) {
    return prisma.balance.create({ data });
  }
}