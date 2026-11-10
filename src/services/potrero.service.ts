import { Prisma } from '@prisma/client';
import { PotreroRepository, CrearPotreroData, ActualizarPotreroData } from '../repositories/potrero.repository';
import { subirImagenACloudinary } from '../utils/cloudinaryUpload.util';
 
export class ServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
  ) {
    super(message);
  }
}
 
export interface CrearPotreroInput {
  nombre?: string;
  capacidad_animales?: number;
  estado?: string;
  tamano_hectareas?: number;
  fecha_creacion?: string;
  descripcion?: string;
}
 
export type ActualizarPotreroInput = Partial<CrearPotreroInput>;
 
export class PotreroService {
  private repository = new PotreroRepository();
 
  listAll() {
    return this.repository.findAll();
  }
 
  async getById(id: number) {
    const potrero = await this.repository.findById(id);
    if (!potrero) {
      throw new ServiceError('Potrero no encontrado', 404, 'NOT_FOUND');
    }
    return potrero;
  }
 
  async create(input: CrearPotreroInput) {
    if (!input.nombre) {
      throw new ServiceError('nombre es obligatorio', 400, 'VALIDATION_ERROR');
    }
 
    const data: CrearPotreroData = {
      nombre: input.nombre,
      capacidad_animales: input.capacidad_animales,
      estado: input.estado,
      tamano_hectareas: input.tamano_hectareas,
      fecha_creacion: input.fecha_creacion ? new Date(input.fecha_creacion) : undefined,
      descripcion: input.descripcion,
    };
 
    return this.repository.create(data);
  }
 
  async update(id: number, input: ActualizarPotreroInput) {
    await this.getById(id);
 
    const data: ActualizarPotreroData = {
      nombre: input.nombre,
      capacidad_animales: input.capacidad_animales,
      estado: input.estado,
      tamano_hectareas: input.tamano_hectareas,
      fecha_creacion: input.fecha_creacion ? new Date(input.fecha_creacion) : undefined,
      descripcion: input.descripcion,
    };
 
    return this.repository.update(id, data);
  }
 
  async delete(id: number) {
    await this.getById(id);
    try {
      await this.repository.delete(id);
    } catch (error) {
      throw this.mapPrismaError(error);
    }
  }
 
  async getAnimalesDelPotrero(id: number) {
    const potrero = await this.getById(id);
    const animales = await this.repository.findAnimalesDelPotrero(id);
    return {
      potrero: { id: potrero.id, nombre: potrero.nombre, estado: potrero.estado },
      conteo: animales.length,
      animales,
      mensaje: animales.length === 0 ? 'Sin animales asignados' : null,
    };
  }
 
  async agregarEncargado(potreroId: number, usuarioId: number) {
    await this.getById(potreroId);
    try {
      await this.repository.agregarEncargado(potreroId, usuarioId);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ServiceError('Ese usuario ya es encargado de este potrero', 409, 'ALREADY_ASSIGNED');
        }
        if (error.code === 'P2003') {
          throw new ServiceError('El usuario no existe', 409, 'INVALID_REFERENCE');
        }
      }
      console.error(error);
      throw new ServiceError('Error interno del servidor', 500, 'INTERNAL_ERROR');
    }
    return this.getById(potreroId);
  }
 
  async quitarEncargado(potreroId: number, usuarioId: number) {
    await this.getById(potreroId);
    try {
      await this.repository.quitarEncargado(potreroId, usuarioId);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new ServiceError('Ese usuario no es encargado de este potrero', 404, 'NOT_FOUND');
      }
      console.error(error);
      throw new ServiceError('Error interno del servidor', 500, 'INTERNAL_ERROR');
    }
    return this.getById(potreroId);
  }
 
  async subirFoto(id: number, archivo: Express.Multer.File | undefined) {
    await this.getById(id);
    if (!archivo) {
      throw new ServiceError('Falta el archivo de la foto (campo "foto")', 400, 'VALIDATION_ERROR');
    }
 
    let url: string;
    try {
      url = await subirImagenACloudinary(archivo.buffer, 'fincas-patitas/potreros');
    } catch (error) {
      console.error(error);
      throw new ServiceError('No se pudo subir la imagen a Cloudinary', 502, 'UPLOAD_FAILED');
    }
 
    return this.repository.actualizarFoto(id, url);
  }
 
  private mapPrismaError(error: unknown): ServiceError {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return new ServiceError(
        'No se puede eliminar: hay animales asignados a este potrero',
        409,
        'HAS_DEPENDENTS',
      );
    }
    console.error(error);
    return new ServiceError('Error interno del servidor', 500, 'INTERNAL_ERROR');
  }
}
 