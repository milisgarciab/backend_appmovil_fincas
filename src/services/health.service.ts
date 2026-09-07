import { HealthRepository } from '@repositories/health.repository';

// Capa de servicios: orquesta reglas de negocio y llama a los repositorios.
export class HealthService {
  constructor(private readonly healthRepository: HealthRepository = new HealthRepository()) {}

  async getStatus() {
    const dbOk = await this.healthRepository.checkDatabaseConnection();
    return {
      status: 'ok',
      database: dbOk ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    };
  }
}
