import { ProduccionRepository } from '@repositories/produccion.repository';

export class ProduccionService {
  constructor(private readonly repository: ProduccionRepository = new ProduccionRepository()) {}

  async resumenHoy() {
    const resumen = await this.repository.resumenHoy();
    const hayRegistros = resumen.registrosLeche.length > 0 || resumen.registrosHuevos.length > 0;

    return {
      ...resumen,
      mensaje: hayRegistros ? null : 'Aún no hay producción registrada hoy',
    };
  }
}