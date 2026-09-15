import { Request, Response } from "express";
import * as authService from "../services/auth.service";


export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "El email es obligatorio" });

    const resultado = await authService.solicitarRecuperacion(email);
    return res.status(200).json(resultado);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, nueva_password } = req.body;
    if (!token || !nueva_password) {
      return res.status(400).json({ error: "token y nueva_password son obligatorios" });
    }

    const resultado = await authService.restablecerPassword(token, nueva_password);
    return res.status(200).json(resultado);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
  
}
export async function logout(req: Request, res: Response) {
  try {
    const usuarioId = (req as any).usuario?.id; // ajusta según cómo guardes el usuario autenticado
    const resultado = await authService.logout(usuarioId);
    return res.status(200).json(resultado);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}