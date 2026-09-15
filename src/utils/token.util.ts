import jwt from 'jsonwebtoken';
import { env } from '@config/env';

export interface TokenPayload {
  id: number;
  rol_id: number;
}

// 15 minutos en segundos, para exponer el tiempo de expiración al cliente (login response)
export const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 15 * 60;

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn,
  } as jwt.SignOptions);
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn,
  } as jwt.SignOptions);
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwtRefreshSecret) as TokenPayload;
}