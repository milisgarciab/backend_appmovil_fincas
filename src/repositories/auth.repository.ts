import { prisma } from "../config/prisma";

export async function guardarResetToken(userId: number, token: string, expira: Date) {
  return prisma.usuarios.update({
    where: { id: userId },
    data: { reset_token: token, reset_token_expira: expira },
  });
}

export async function buscarPorResetToken(token: string) {
  return prisma.usuarios.findFirst({
    where: { reset_token: token, reset_token_expira: { gt: new Date() } },
  });
}

export async function actualizarPasswordYLimpiarToken(userId: number, nuevaContrasena: string) {
  return prisma.usuarios.update({
    where: { id: userId },
    data: { contrasena: nuevaContrasena, reset_token: null, reset_token_expira: null },
  });
}

export async function buscarPorEmail(correo: string) {
  return prisma.usuarios.findUnique({
    where: { correo_electronico: correo },
  });
}