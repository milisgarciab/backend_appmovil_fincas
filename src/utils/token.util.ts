import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '@config/env';

export interface TokenPayload {
  id: number;
  rol_id: number;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
  } as SignOptions);
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  } as SignOptions);
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwt.accessSecret) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwt.refreshSecret) as TokenPayload;
}

// Segundos correspondientes al accessExpiresIn por defecto (15m), para exponer "expiresIn"
// en las respuestas de login/refresh sin que el cliente tenga que parsear "15m".
export const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 15 * 60;