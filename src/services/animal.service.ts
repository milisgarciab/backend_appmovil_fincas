import { AnimalRepository, AnimalFiltros } from '../repositories/animal.repository';
import { EspecieRepository } from '../repositories/especie.repository';

export interface CrearAnimalInput {
  codigo: string;
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

export type ActualizarAnimalInput = Partial<CrearAnimalInput>;

export class AnimalService {
  private repository = new AnimalRepository();
  private especieRepository = new EspecieRepository();

  listAll(filtros: AnimalFiltros) {
    return this.repository.findAll(filtros);
  }

  getById(id: number) {
    return this.repository.findById(id);
  }

  async create(input: CrearAnimalInput) {
    this.validarCamposObligatorios(input);
    await this.validarEspecieExiste(input.especie_id);
    await this.validarCodigoDisponible(input.codigo);

    return this.repository.create({
      codigo: input.codigo.trim(),
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
    if (!input.codigo || input.codigo.trim().length === 0) {
      throw new Error('El código del animal es obligatorio');
    }
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
}