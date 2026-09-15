import bcrypt from 'bcrypt';
import { UsuarioRepository } from '@repositories/usuario.repository';
import { AppError } from '@middlewares/errorHandler';

const SALT_ROUNDS = 10;
const ESTADOS_VALIDOS = ['Activo', 'Inactivo'];

export interface ActualizarPerfilInput {
  nombre_usuario?: string;
  contrasena?: string;
}

export class UsuarioService {
  constructor(private readonly usuarioRepository: UsuarioRepository = new UsuarioRepository()) {}

  async actualizarPerfil(id: number, input: ActualizarPerfilInput) {
    if (!input.nombre_usuario && !input.contrasena) {
      throw new AppError('Debes enviar nombre_usuario y/o contrasena para actualizar', 400, 'VALIDATION_ERROR');
    }

    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404, 'NOT_FOUND');
    }

    const data: { nombre_usuario?: string; contrasena?: string } = {};
    if (input.nombre_usuario) data.nombre_usuario = input.nombre_usuario;
    if (input.contrasena) data.contrasena = await bcrypt.hash(input.contrasena, SALT_ROUNDS);

    const actualizado = await this.usuarioRepository.update(id, data);
    return this.toPublicUser(actualizado);
  }

  async resetearContrasena(id: number, nuevaContrasena?: string) {
    if (!nuevaContrasena || nuevaContrasena.length < 6) {
      throw new AppError('nueva_contrasena es obligatoria (mínimo 6 caracteres)', 400, 'VALIDATION_ERROR');
    }

    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404, 'NOT_FOUND');
    }

    const contrasenaHash = await bcrypt.hash(nuevaContrasena, SALT_ROUNDS);
    await this.usuarioRepository.update(id, { contrasena: contrasenaHash });
    return { message: 'Contraseña restablecida correctamente' };
  }

  async cambiarEstado(id: number, estado?: string) {
    if (!estado || !ESTADOS_VALIDOS.includes(estado)) {
      throw new AppError(`estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`, 400, 'VALIDATION_ERROR');
    }

    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404, 'NOT_FOUND');
    }

    const actualizado = await this.usuarioRepository.updateEstado(id, estado);
    return this.toPublicUser(actualizado);
  }

  private toPublicUser(usuario: {
    id: number;
    nombre_usuario: string;
    correo_electronico: string;
    telefono: string | null;
    rol_id: number;
    estado?: string | null;
  }) {
    return {
      id: usuario.id,
      nombre_usuario: usuario.nombre_usuario,
      correo_electronico: usuario.correo_electronico,
      telefono: usuario.telefono,
      rol_id: usuario.rol_id,
      estado: usuario.estado,
    };
  }
}