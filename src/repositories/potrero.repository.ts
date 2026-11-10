import { prisma } from '../config/prisma';
 
export interface CrearPotreroData {
  nombre: string;
  capacidad_animales?: number;
  estado?: string;
  tamano_hectareas?: number;
  fecha_creacion?: Date;
  descripcion?: string;
  foto_url?: string;
}
 
export type ActualizarPotreroData = Partial<CrearPotreroData>;
 
const includeEncargados = {
  potrero_encargados: {
    include: { usuarios: { select: { id: true, nombre_usuario: true, correo_electronico: true } } },
  },
};
 
export class PotreroRepository {
  findAll() {
    return prisma.ubicaciones_potreros.findMany({
      orderBy: { nombre: 'asc' },
      include: includeEncargados,
    });
  }
 
  findById(id: number) {
    return prisma.ubicaciones_potreros.findUnique({
      where: { id },
      include: includeEncargados,
    });
  }
 
  create(data: CrearPotreroData) {
    return prisma.ubicaciones_potreros.create({ data });
  }
 
  update(id: number, data: ActualizarPotreroData) {
    return prisma.ubicaciones_potreros.update({ where: { id }, data });
  }
 
  delete(id: number) {
    return prisma.ubicaciones_potreros.delete({ where: { id } });
  }
 
  actualizarFoto(id: number, foto_url: string) {
    return prisma.ubicaciones_potreros.update({ where: { id }, data: { foto_url } });
  }
 
  // HU-29: ver los animales asignados directamente a un potrero.
  findAnimalesDelPotrero(potreroId: number) {
    return prisma.animales.findMany({
      where: { potrero_id: potreroId },
      include: { especies: true, razas: true },
      orderBy: { codigo: 'asc' },
    });
  }
 
  agregarEncargado(potreroId: number, usuarioId: number) {
    return prisma.potrero_encargados.create({
      data: { potrero_id: potreroId, usuario_id: usuarioId },
    });
  }
 
  quitarEncargado(potreroId: number, usuarioId: number) {
    return prisma.potrero_encargados.delete({
      where: { potrero_id_usuario_id: { potrero_id: potreroId, usuario_id: usuarioId } },
    });
  }
}
 