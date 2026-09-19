-- CreateTable
CREATE TABLE "animales" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(30) NOT NULL,
    "nombre" VARCHAR(50),
    "especie_id" INTEGER NOT NULL,
    "raza_id" INTEGER NOT NULL,
    "genero" VARCHAR(10) NOT NULL,
    "fecha_nacimiento" DATE,
    "origen" VARCHAR(20) NOT NULL DEFAULT 'Nacido',
    "fecha_ingreso" DATE,
    "madre_id" INTEGER,
    "padre_id" INTEGER,
    "lote_id" INTEGER,
    "potrero_id" INTEGER,
    "estado" VARCHAR(20) DEFAULT 'Activo',
    "creado_en" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "animales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alimentacion" (
    "id" SERIAL NOT NULL,
    "animal_id" INTEGER NOT NULL,
    "tipo_alimento" VARCHAR(50) NOT NULL,
    "cantidad" DECIMAL(8,2) NOT NULL,
    "unidad" VARCHAR(20) NOT NULL,
    "fecha" DATE NOT NULL DEFAULT CURRENT_DATE,
    "creado_en" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alimentacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "balance" (
    "id" SERIAL NOT NULL,
    "periodo" DATE NOT NULL,
    "total_ventas" DECIMAL(10,2) NOT NULL,
    "total_gastos" DECIMAL(10,2) NOT NULL,
    "balance_neto" DECIMAL(10,2) NOT NULL,
    "creado_en" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "balance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bodega" (
    "id" SERIAL NOT NULL,
    "categoria_id" INTEGER NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "unidad_medida" VARCHAR(20) NOT NULL,

    CONSTRAINT "bodega_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias_bodega" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,

    CONSTRAINT "categorias_bodega_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "especies" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,

    CONSTRAINT "especies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos_sanitarios" (
    "id" SERIAL NOT NULL,
    "animal_id" INTEGER NOT NULL,
    "tipo_evento" VARCHAR(30) NOT NULL,
    "dosis_aplicada" DECIMAL(6,2),
    "descripcion_tratamiento" TEXT,
    "fecha_evento" DATE DEFAULT CURRENT_DATE,

    CONSTRAINT "eventos_sanitarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gastos" (
    "id" SERIAL NOT NULL,
    "categoria" VARCHAR(30) NOT NULL,
    "descripcion" TEXT,
    "monto" DECIMAL(10,2) NOT NULL,
    "fecha" DATE NOT NULL,
    "creado_en" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gastos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lotes_animales" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "potrero_id" INTEGER,

    CONSTRAINT "lotes_animales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lotes_inventario" (
    "id" SERIAL NOT NULL,
    "insumo_id" INTEGER NOT NULL,
    "numero_lote" VARCHAR(50),
    "fecha_vencimiento" DATE NOT NULL,
    "cantidad_disponible" DECIMAL(10,2) NOT NULL,
    "costo_unitario" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "lotes_inventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "precios_mercado" (
    "id" SERIAL NOT NULL,
    "producto" VARCHAR(50) NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "fecha" DATE NOT NULL,
    "creado_en" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "precios_mercado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produccion_huevos" (
    "id" SERIAL NOT NULL,
    "lote_id" INTEGER,
    "cantidad" INTEGER NOT NULL,
    "registrado_en" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "produccion_huevos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produccion_leche" (
    "id" SERIAL NOT NULL,
    "animal_id" INTEGER NOT NULL,
    "litros" DECIMAL(5,2) NOT NULL,
    "jornada" VARCHAR(20),
    "registrado_en" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "produccion_leche_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "razas" (
    "id" SERIAL NOT NULL,
    "especie_id" INTEGER NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,

    CONSTRAINT "razas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_peso" (
    "id" SERIAL NOT NULL,
    "animal_id" INTEGER NOT NULL,
    "peso_kg" DECIMAL(6,2) NOT NULL,
    "registrado_en" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registros_peso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reportes_finca" (
    "id" SERIAL NOT NULL,
    "tipo_reporte" VARCHAR(50) NOT NULL,
    "filtros_aplicados" JSONB,
    "generado_en" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reportes_finca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "nombre_rol" VARCHAR(50) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seguimiento_gestacion" (
    "id" SERIAL NOT NULL,
    "animal_id" INTEGER NOT NULL,
    "macho_id" INTEGER,
    "tipo" VARCHAR(20),
    "fecha_inseminacion" DATE NOT NULL,
    "fecha_estimada_parto" DATE NOT NULL,
    "fecha_real_parto" DATE,
    "estado" VARCHAR(20) DEFAULT 'Gestante',
    "notas" TEXT,

    CONSTRAINT "seguimiento_gestacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ubicaciones_potreros" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "capacidad_animales" INTEGER,
    "estado" VARCHAR(20) DEFAULT 'Disponible',

    CONSTRAINT "ubicaciones_potreros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nombre_usuario" VARCHAR(100) NOT NULL,
    "correo_electronico" VARCHAR(100) NOT NULL,
    "telefono" VARCHAR(20),
    "contrasena" VARCHAR(255) NOT NULL,
    "rol_id" INTEGER NOT NULL,
    "creado_en" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ventas" (
    "id" SERIAL NOT NULL,
    "producto" VARCHAR(50) NOT NULL,
    "cantidad" DECIMAL(10,2) NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "comprador" VARCHAR(100),
    "fecha" DATE NOT NULL,
    "creado_en" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ventas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "animales_codigo_key" ON "animales"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_bodega_nombre_key" ON "categorias_bodega"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "especies_nombre_key" ON "especies"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_rol_key" ON "roles"("nombre_rol");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_electronico_key" ON "usuarios"("correo_electronico");

-- AddForeignKey
ALTER TABLE "animales" ADD CONSTRAINT "animales_especie_id_fkey" FOREIGN KEY ("especie_id") REFERENCES "especies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "animales" ADD CONSTRAINT "animales_lote_id_fkey" FOREIGN KEY ("lote_id") REFERENCES "lotes_animales"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "animales" ADD CONSTRAINT "animales_potrero_id_fkey" FOREIGN KEY ("potrero_id") REFERENCES "ubicaciones_potreros"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "animales" ADD CONSTRAINT "animales_madre_id_fkey" FOREIGN KEY ("madre_id") REFERENCES "animales"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "animales" ADD CONSTRAINT "animales_padre_id_fkey" FOREIGN KEY ("padre_id") REFERENCES "animales"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "animales" ADD CONSTRAINT "animales_raza_id_fkey" FOREIGN KEY ("raza_id") REFERENCES "razas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "alimentacion" ADD CONSTRAINT "alimentacion_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animales"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bodega" ADD CONSTRAINT "bodega_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias_bodega"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "eventos_sanitarios" ADD CONSTRAINT "eventos_sanitarios_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animales"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lotes_animales" ADD CONSTRAINT "lotes_animales_potrero_id_fkey" FOREIGN KEY ("potrero_id") REFERENCES "ubicaciones_potreros"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lotes_inventario" ADD CONSTRAINT "lotes_inventario_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "bodega"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "produccion_huevos" ADD CONSTRAINT "produccion_huevos_lote_id_fkey" FOREIGN KEY ("lote_id") REFERENCES "lotes_animales"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "produccion_leche" ADD CONSTRAINT "produccion_leche_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animales"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "razas" ADD CONSTRAINT "razas_especie_id_fkey" FOREIGN KEY ("especie_id") REFERENCES "especies"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registros_peso" ADD CONSTRAINT "registros_peso_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animales"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "seguimiento_gestacion" ADD CONSTRAINT "seguimiento_gestacion_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animales"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "seguimiento_gestacion" ADD CONSTRAINT "seguimiento_gestacion_macho_id_fkey" FOREIGN KEY ("macho_id") REFERENCES "animales"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
