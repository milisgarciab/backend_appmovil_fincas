# Fincas y Patitas — Backend Móvil

API REST (Express + TypeScript + Prisma + Neon/PostgreSQL) para la app móvil Flutter de
**Fincas y Patitas** — Trimestre 5, Análisis y Desarrollo de Software, SENA-CEET.

Repos del proyecto:
- Backend (este repo): `fincas_patitas_app_movil`
- Frontend (Dany, Flutter): `fincas-patitas-movil-app`

> Este repo es exclusivo para la entrega móvil. Los repos de la versión web (Next.js +
> Supabase) NO se tocan — solo se usan como referencia de lectura para traducir los
> modelos de dominio.

## Arquitectura

Backend por capas:

```
src/
├── config/         # env, prisma client, swagger
├── controllers/     # capa HTTP: request/response, sin lógica de negocio
├── services/        # lógica de negocio, orquesta repositorios
├── repositories/     # acceso a datos (Prisma)
├── routes/          # definición de endpoints + anotaciones Swagger
├── middlewares/      # manejo de errores, auth, etc.
├── types/           # tipos e interfaces compartidos
├── app.ts           # configuración de Express
└── server.ts        # punto de entrada
```

## Requisitos

- Node.js 18+
- Una base de datos PostgreSQL en Neon (proyecto exclusivo para el móvil, distinto al de la web)

## Puesta en marcha

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus cadenas de conexión reales de Neon (DATABASE_URL con -pooler, DIRECT_URL sin -pooler)

# 3. Generar el cliente de Prisma
npm run prisma:generate

# 4. Aplicar el esquema a la base de datos (cuando ya haya modelos definidos)
npm run prisma:migrate

# 5. Levantar el servidor en modo desarrollo
npm run dev
```

El servidor queda en `http://localhost:3000`, con documentación Swagger interactiva en
`http://localhost:3000/docs` y el contrato OpenAPI en crudo en `http://localhost:3000/docs.json`.

## Estado actual

- [x] Proyecto Express + TypeScript corriendo localmente
- [x] Conexión a Neon vía Prisma
- [x] Swagger configurado desde el inicio
- [x] Endpoint de ejemplo (`GET /api/health`) siguiendo el patrón de capas
- [ ] Modelos de dominio (Animal, Reproducción, Producción, Inventario, Salud Animal) — se
      definen junto con el equipo, entidad por entidad
- [ ] Módulo de autenticación (login/registro) — contrato de API a coordinar con el frontend
      antes de implementar

## Flujo de trabajo

Ver [`GIT_WORKFLOW.md`](./GIT_WORKFLOW.md) para la estrategia de ramas, commits semánticos y
Pull Requests.
