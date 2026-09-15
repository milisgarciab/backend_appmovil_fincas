import { AnimalRepository, AnimalFiltros } from '../repositories/animal.repository';
import { EspecieRepository } from '../repositories/especie.repository';
import { RegistroPesoRepository } from '../repositories/registroPeso.repository';

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
  potrero_id?: number;
  madre_id?: number;
  padre_id?: number;
}

export type ActualizarAnimalInput = Partial<CrearAnimalInput> & {
  codigo?: string;
  observaciones?: string;
  causa?: string;
  peso?: number;
};

export interface ListaPaginada<T> {
  data: T[];
  paginacion: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
}

const ESTADOS_QUE_REQUIEREN_CAUSA = ['Muerto', 'Vendido'];

export class AnimalService {
  private repository = new AnimalRepository();
  private especieRepository = new EspecieRepository();
  private registroPesoRepository = new RegistroPesoRepository();

  async listAll(filtros: AnimalFiltros, pagina = 1, limite = 20): Promise<ListaPaginada<Awaited<ReturnType<AnimalRepository['findAll']>>[number]>> {
    const paginaSegura = pagina > 0 ? pagina : 1;
    const limiteSeguro = limite > 0 && limite <= 100 ? limite : 20;
    const skip = (paginaSegura - 1) * limiteSeguro;

    const [data, total] = await Promise.all([
      this.repository.findAll(filtros, { skip, take: limiteSeguro }),
      this.repository.count(filtros),
    ]);

    return {
      data,
      paginacion: {
        pagina: paginaSegura,
        limite: limiteSeguro,
        total,
        totalPaginas: Math.max(1, Math.ceil(total / limiteSeguro)),
      },
    };
  }

  getById(id: number) {
    return this.repository.findById(id);
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
      potrero_id: input.potrero_id,
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
    if (input.estado && ESTADOS_QUE_REQUIEREN_CAUSA.includes(input.estado) && !input.causa) {
      throw new Error(`Debes indicar una causa al cambiar el estado a "${input.estado}"`);
    }

    const { peso, ...datosAnimal } = input;

    const animalActualizado = await this.repository.update(id, {
      ...datosAnimal,
      fecha_nacimiento: input.fecha_nacimiento ? new Date(input.fecha_nacimiento) : undefined,
      fecha_ingreso: input.fecha_ingreso ? new Date(input.fecha_ingreso) : undefined,
    });

    if (peso !== undefined) {
      await this.registroPesoRepository.create({ animal_id: id, peso_kg: peso });
    }

    return animalActualizado;
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

  private async generarCodigoUnico(intentos = 5): Promise<string> {
    const total = await this.repository.count({});
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
