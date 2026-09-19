import { AuditoriaRepository, AuditoriaFiltros } from '../repositories/auditoria.repository';

export class AuditoriaService {
  private repository = new AuditoriaRepository();

  listAll(filtros: AuditoriaFiltros) {
    return this.repository.findAll(filtros);
  }
}