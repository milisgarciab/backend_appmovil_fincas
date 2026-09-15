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
}
