import { AnimalRepository, AnimalFiltros } from '../repositories/animal.repository';
import { EspecieRepository } from '../repositories/especie.repository';

export interface CrearAnimalInput {
  nombre?: string;
  genero: string;
  fecha_nacimiento?: string;
  origen?: string;
  fecha_ingreso?: string;
  estado?: string;
  especie_id: number;
  raza_id: number;
  lote_id?: number;
  madre_id?: number;
  padre_id?: number;
}

export type ActualizarAnimalInput = Partial<CrearAnimalInput> & { codigo?: string };

export class AnimalService {
  private repository = new AnimalRepository();
  private especieRepository = new EspecieRepository();

  listAll(filtros: AnimalFiltros) {
    return this.repository.findAll(filtros);
  }

  getById(id: number) {
    return this.repository.findById(id);
  }

  getHistorial(id: number) {
    return this.repository.findHistorial(id);
  }

  async create(input: CrearAnimalInput) {
    this.validarCamposObligatorios(input);
    await this.validarEspecieExiste(input.especie_id);

    const codigo = await this.generarCodigoUnico();

    return this.repository.create({
      codigo,
      nombre: input.nombre?.trim(),
      genero: input.genero.trim(),
      fecha_nacimiento: input.fecha_nacimiento ? new Date(input.fecha_nacimiento) : undefined,
      origen: input.origen,
      fecha_ingreso: input.fecha_ingreso ? new Date(input.fecha_ingreso) : undefined,
      estado: input.estado,
      especie_id: input.especie_id,
      raza_id: input.raza_id,
      lote_id: input.lote_id,
      madre_id: input.madre_id,
      padre_id: input.padre_id,
    });
  }

  async update(id: number, input: ActualizarAnimalInput) {
    if (input.especie_id) {
      await this.validarEspecieExiste(input.especie_id);
    }
    if (input.codigo) {
      await this.validarCodigoDisponible(input.codigo, id);
    }

    return this.repository.update(id, {
      ...input,
      fecha_nacimiento: input.fecha_nacimiento ? new Date(input.fecha_nacimiento) : undefined,
      fecha_ingreso: input.fecha_ingreso ? new Date(input.fecha_ingreso) : undefined,
    });
  }

  delete(id: number) {
    return this.repository.delete(id);
  }

  private validarCamposObligatorios(input: CrearAnimalInput) {
    if (!input.genero || input.genero.trim().length === 0) {
      throw new Error('El género del animal es obligatorio');
    }
    if (!input.especie_id) {
      throw new Error('La especie del animal es obligatoria');
    }
    if (!input.raza_id) {
      throw new Error('La raza del animal es obligatoria');
    }
  }

  private async validarEspecieExiste(especieId: number) {
    const especie = await this.especieRepository.findById(especieId);
    if (!especie) {
      throw new Error(`No existe una especie con id ${especieId}`);
    }
  }

  private async validarCodigoDisponible(codigo: string, idAExcluir?: number) {
    const existente = await this.repository.findByCodigo(codigo.trim());
    if (existente && existente.id !== idAExcluir) {
      throw new Error(`Ya existe un animal con el código ${codigo}`);
    }
  }

  // Genera un código secuencial tipo ANI-0001. Si por una condición de carrera ya existe
  // (dos creaciones casi simultáneas), reintenta con el siguiente número.
  private async generarCodigoUnico(intentos = 5): Promise<string> {
    const total = await this.repository.count();
    for (let i = 0; i < intentos; i++) {
      const candidato = `ANI-${String(total + 1 + i).padStart(4, '0')}`;
      const existente = await this.repository.findByCodigo(candidato);
      if (!existente) {
        return candidato;
      }
    }
    throw new Error('No se pudo generar un código único para el animal, intenta de nuevo');
  }
}