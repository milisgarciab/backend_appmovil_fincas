import { prisma } from '../config/prisma';
 
export interface CrearLoteData {
  nombre: string;
  especie_id?: number;
  fecha_creacion?: Date;
  capacidad_estimada?: number;
  descripcion?: string;
  encargado_id?: number;
}
 
export type ActualizarLoteData = Partial<CrearLoteData>;
 
export class LoteAnimalRepository {
  findAll() {
    return prisma.lotes_animales.findMany({
      orderBy: { nombre: 'asc' },
      include: {
        especies: true,
        encargado: { select: { id: true, nombre_usuario: true, correo_electronico: true } },
        _count: { select: { animales: true } },
      },
    });
  }
 
  findById(id: number) {
    return prisma.lotes_animales.findUnique({
      where: { id },
      include: {
        especies: true,
        encargado: { select: { id: true, nombre_usuario: true, correo_electronico: true } },
        _count: { select: { animales: true } },
      },
    });
  }
 
  create(data: CrearLoteData) {
    return prisma.lotes_animales.create({ data });
  }
 
  update(id: number, data: ActualizarLoteData) {
    return prisma.lotes_animales.update({ where: { id }, data });
  }
 
  delete(id: number) {
    return prisma.lotes_animales.delete({ where: { id } });
  }
 
  // 2026-11-10: antes este método devolvía el resultado "en crudo" de
  // `update()`, sin las relaciones (`especies`/`encargado`/`_count`) -- por
  // eso la app no se enteraba de quién quedó como encargado hasta refrescar
  // la pantalla a mano (el equivalente en Potrero sí vuelve a consultar el
  // registro completo después de guardar). Se agrega el mismo `include`
  // que ya usan `findAll`/`findById`, para que la respuesta quede igual de
  // completa y la app pueda reflejar el cambio al instante.
  asignarEncargado(id: number, encargado_id: number | null) {
    return prisma.lotes_animales.update({
      where: { id },
      data: { encargado_id },
      include: {
        especies: true,
        encargado: { select: { id: true, nombre_usuario: true, correo_electronico: true } },
        _count: { select: { animales: true } },
      },
    });
  }
}
 