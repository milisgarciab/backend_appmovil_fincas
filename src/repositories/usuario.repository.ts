import { prisma } from '@config/prisma';
import { usuarios } from '@prisma/client';

// Capa de acceso a datos: aquí solo se habla con Prisma/la base de datos, nada de lógica de negocio.
export class UsuarioRepository {
  async findByEmail(correo_electronico: string): Promise<usuarios | null> {
    return prisma.usuarios.findUnique({ where: { correo_electronico } });
  }

  async findById(id: number): Promise<usuarios | null> {
    return prisma.usuarios.findUnique({ where: { id } });
  }
    async update(id: number, data: Partial<{ nombre_usuario: string; contrasena: string }>): Promise<usuarios> {
    return prisma.usuarios.update({ where: { id }, data });
  }

  async updateEstado(id: number, estado: string): Promise<usuarios> {
    return prisma.usuarios.update({ where: { id }, data: { estado } });
  }

  async create(data: {
    nombre_usuario: string;
    correo_electronico: string;
    contrasena: string;
    telefono?: string | null;
    rol_id: number;
  }): Promise<usuarios> {
    return prisma.usuarios.create({ data });
  }
    async guardarResetToken(id: number, token: string, expira: Date): Promise<usuarios> {
    return prisma.usuarios.update({
      where: { id },
      data: { reset_token: token, reset_token_expira: expira },
    });
  }

  async buscarPorResetToken(token: string): Promise<usuarios | null> {
    return prisma.usuarios.findFirst({
      where: {
        reset_token: token,
        reset_token_expira: { gt: new Date() },
      },
    });
  }

  async limpiarResetToken(id: number): Promise<usuarios> {
    return prisma.usuarios.update({
      where: { id },
      data: { reset_token: null, reset_token_expira: null },
    });
  }
}
