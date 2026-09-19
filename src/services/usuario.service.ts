import bcrypt from 'bcrypt';
import { UsuarioRepository } from '@repositories/usuario.repository';
import { AppError } from '@middlewares/errorHandler';

const SALT_ROUNDS = 10;
const ESTADOS_VALIDOS = ['Activo', 'Inactivo'];
const ROLES_VALIDOS = [1, 2, 3]; // Administrador, Encargado, Empleado

export interface ActualizarPerfilInput {
  nombre_usuario?: string;
  contrasena?: string;
}

export interface CrearUsuarioInput {
  nombre_usuario?: string;
  correo_electronico?: string;
  contrasena?: string;
  telefono?: string;
  rol_id?: number;
}

export class UsuarioService {
  constructor(private readonly usuarioRepository: UsuarioRepository = new UsuarioRepository()) {}

  async listAll() {
    const usuarios = await this.usuarioRepository.findAll();
    return usuarios.map((u) => this.toPublicUser(u));
  }

  async getById(id: number) {
    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404, 'NOT_FOUND');
    }
    return this.toPublicUser(usuario);
  }

  async crear(input: CrearUsuarioInput) {
    if (!input.nombre_usuario || !input.correo_electronico || !input.contrasena || !input.rol_id) {
      throw new AppError(
        'nombre_usuario, correo_electronico, contrasena y rol_id son obligatorios',
        400,
        'VALIDATION_ERROR',
      );
    }
    if (!ROLES_VALIDOS.includes(input.rol_id)) {
      throw new AppError(`rol_id debe ser uno de: ${ROLES_VALIDOS.join(', ')}`, 400, 'VALIDATION_ERROR');
    }

    const existente = await this.usuarioRepository.findByEmail(input.correo_electronico);
    if (existente) {
      throw new AppError('El correo ya está registrado', 409, 'EMAIL_ALREADY_EXISTS');
    }

    const contrasenaHash = await bcrypt.hash(input.contrasena, SALT_ROUNDS);
    const usuario = await this.usuarioRepository.create({
      nombre_usuario: input.nombre_usuario,
      correo_electronico: input.correo_electronico,
      contrasena: contrasenaHash,
      telefono: input.telefono,
      rol_id: input.rol_id,
    });

    return this.toPublicUser(usuario);
  }

  async asignarRol(id: number, rol_id?: number) {
    if (!rol_id || !ROLES_VALIDOS.includes(rol_id)) {
      throw new AppError(`rol_id debe ser uno de: ${ROLES_VALIDOS.join(', ')}`, 400, 'VALIDATION_ERROR');
    }

    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404, 'NOT_FOUND');
    }

    const actualizado = await this.usuarioRepository.updateRol(id, rol_id);
    return this.toPublicUser(actualizado);
  }

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