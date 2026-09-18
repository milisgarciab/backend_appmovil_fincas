import { ProduccionLecheRepository } from './produccionLeche.repository';
import { ProduccionHuevosRepository } from './produccionHuevos.repository';

export class ProduccionRepository {
  private leche = new ProduccionLecheRepository();
  private huevos = new ProduccionHuevosRepository();

  async resumenHoy() {
    const [leche, huevos] = await Promise.all([
      this.leche.resumenHoy(),
      this.huevos.resumenHoy(),
    ]);

    return {
      totalLitrosLeche: leche.totalLitros,
      totalHuevosBuenos: huevos.totalBuenos,
      totalHuevosRotos: huevos.totalRotos,
      registrosLeche: leche.registros,
      registrosHuevos: huevos.registros,
    };
  }
}
