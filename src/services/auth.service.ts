import bcrypt from 'bcrypt';
import { UsuarioRepository } from '@repositories/usuario.repository';
import { AppError } from '@middlewares/errorHandler';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  ACCESS_TOKEN_EXPIRES_IN_SECONDS,
} from '@utils/token.util';

const SALT_ROUNDS = 10;
// Rol por defecto al auto-registrarse (decisión confirmada): un Administrador puede
// cambiarlo después. Corresponde a "Empleado" en la tabla roles.
const ROL_EMPLEADO_ID = 3;

export interface RegisterInput {
  nombre_usuario?: string;
  correo_electronico?: string;
  contrasena?: string;
  telefono?: string;
}

export interface LoginInput {
  correo_electronico?: string;
  contrasena?: string;
}

interface UsuarioPublico {
  id: number;
  nombre_usuario: string;
  correo_electronico: string;
  telefono: string | null;
  rol_id: number;
}

export class AuthService {
  constructor(private readonly usuarioRepository: UsuarioRepository = new UsuarioRepository()) {}

  async register(input: RegisterInput): Promise<UsuarioPublico> {
    if (!input.nombre_usuario || !input.correo_electronico || !input.contrasena) {
      throw new AppError(
        'nombre_usuario, correo_electronico y contrasena son obligatorios',
        400,
        'VALIDATION_ERROR',
      );
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
      rol_id: ROL_EMPLEADO_ID,
    });

    return this.toPublicUser(usuario);
  }

  async login(input: LoginInput) {
    if (!input.correo_electronico || !input.contrasena) {
      throw new AppError('correo_electronico y contrasena son obligatorios', 400, 'VALIDATION_ERROR');
    }

    const usuario = await this.usuarioRepository.findByEmail(input.correo_electronico);
    if (!usuario) {
      throw new AppError('Correo o contraseña incorrectos', 401, 'INVALID_CREDENTIALS');
    }

    const contrasenaValida = await bcrypt.compare(input.contrasena, usuario.contrasena);
    if (!contrasenaValida) {
      throw new AppError('Correo o contraseña incorrectos', 401, 'INVALID_CREDENTIALS');
    }

    const payload = { id: usuario.id, rol_id: usuario.rol_id };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
      user: this.toPublicUser(usuario),
    };
  }

  async refresh(refreshToken?: string) {
    if (!refreshToken) {
      throw new AppError('refreshToken es obligatorio', 400, 'VALIDATION_ERROR');
    }

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError('Refresh token inválido o expirado', 401, 'INVALID_REFRESH_TOKEN');
    }

    const usuario = await this.usuarioRepository.findById(payload.id);
    if (!usuario) {
      throw new AppError('Refresh token inválido o expirado', 401, 'INVALID_REFRESH_TOKEN');
    }

    const accessToken = generateAccessToken({ id: usuario.id, rol_id: usuario.rol_id });

    return {
      accessToken,
      expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
    };
  }

  // Sin rotación ni blacklist de refresh tokens (decisión confirmada: expiración simple).
  // Logout no tiene estado en el servidor; el cliente descarta los tokens que tenía guardados.
  private toPublicUser(usuario: {
    id: number;
    nombre_usuario: string;
    correo_electronico: string;
    telefono: string | null;
    rol_id: number;
  }): UsuarioPublico {
    return {
      id: usuario.id,
      nombre_usuario: usuario.nombre_usuario,
      correo_electronico: usuario.correo_electronico,
      telefono: usuario.telefono,
      rol_id: usuario.rol_id,
    };
  }
}
