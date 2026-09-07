# Git Workflow — Fincas y Patitas Móvil (Backend)

Estrategia de control de versiones para el repo `fincas_patitas_app_movil` (Express + TypeScript).
Trimestre 5, ADSO — SENA-CEET. Espejo del flujo adoptado en el repo del frontend
(`fincas-patitas-movil-app`), para que ambos equipos trabajen bajo las mismas reglas.

## 1. Ramas principales

- **`main`** — versión estable del proyecto. Solo recibe código que ya pasó por `develop`,
  fue probado, y está listo para mostrarse (por ejemplo, antes de una entrega o sustentación).
  Nunca se desarrolla directamente aquí.
- **`develop`** — rama de integración. Todo el trabajo de los módulos se junta aquí primero.
- **`feature/*`** — una rama por módulo o funcionalidad concreta del backend. Sale de `develop`
  y vuelve a `develop` vía Pull Request.
- **`release/*`** — (opcional) prepara el paso de `develop` a `main` antes de una entrega:
  solo correcciones finales, no features nuevas.
- **`hotfix/*`** — corrección urgente directo sobre `main`. Se aplica también sobre `develop`.

```text
feature/*  →  develop  →  release/*  →  main
```

## 2. Mapa de ramas por módulo (backend)

```text
main
│
└── develop
    │
    ├── feature/auth              (login/registro — coordinado con el frontend)
    ├── feature/animals
    ├── feature/reproduction
    ├── feature/production
    ├── feature/inventory
    └── feature/vaccination        (salud animal)
```

Cada módulo empieza con una sola rama; se subdivide solo si crece lo suficiente (por ejemplo
`feature/animals-crud` vs `feature/animals-search` si hiciera falta más adelante).

## 3. Convención de nombres de ramas

```text
feature/nombre-modulo
fix/nombre-error
refactor/nombre-cambio
docs/nombre-documentacion
test/nombre-prueba
```

Minúsculas, guiones, cortos, descriptivos. Evitar `cambios`, `prueba`, `nuevo`, `fix2`.

## 4. Commits semánticos (Conventional Commits)

Formato: `tipo(alcance): descripción`. El alcance es el módulo o capa afectada.

| Tipo | Cuándo usarlo |
|---|---|
| `feat` | Nueva funcionalidad (endpoint, servicio, modelo) |
| `fix` | Corrección de un error |
| `refactor` | Cambio de estructura sin cambiar comportamiento |
| `docs` | Documentación (README, Swagger, este archivo) |
| `style` | Formato/lint, sin lógica |
| `test` | Pruebas |
| `chore` | Mantenimiento (dependencias, configuración, scripts) |

Ejemplos:

```text
feat(auth): add POST /auth/login endpoint
feat(animals): implement animal repository with Prisma
fix(auth): correct token expiration validation
docs(swagger): document /auth endpoints
refactor(animals): extract validation to service layer
chore(prisma): add Animal model migration
```

## 5. Coherencia módulo → rama → commits → PR

```text
Módulo:          Auth
Rama:             feature/auth
Commits:          feat(auth): add register endpoint
                  feat(auth): add login endpoint with JWT
                  docs(auth): document auth endpoints in swagger
Pull Request:     feat(auth): implement authentication module
Destino:          develop
```

## 6. Flujo de trabajo por funcionalidad

```bash
# 1. Actualizar develop
git checkout develop
git pull origin develop

# 2. Crear la rama del módulo
git checkout -b feature/auth

# 3-4. Desarrollar por capas y hacer commits pequeños
git add src/repositories/auth.repository.ts
git commit -m "feat(auth): add user repository"
git add src/services/auth.service.ts
git commit -m "feat(auth): add login service with JWT"
git add src/controllers/auth.controller.ts src/routes/auth.routes.ts
git commit -m "feat(auth): add login and register endpoints"

# 5. Probar (npm run dev + Swagger /docs, o tests si existen)

# 6. Subir la rama
git push -u origin feature/auth

# 7. Crear Pull Request hacia develop (en GitHub)
#    Título sugerido: feat(auth): implement authentication module

# 8-9. Fusionar el PR (en GitHub, o localmente si se trabaja sin PR formal)
git checkout develop
git pull origin develop
git merge --no-ff feature/auth
git push origin develop

# 10. Eliminar la rama ya integrada
git branch -d feature/auth
git push origin --delete feature/auth
```

## 7. De develop a main (cuando haya una entrega)

```bash
git checkout develop
git checkout -b release/entrega-trimestre5
# solo correcciones finales aquí, no features nuevas

git checkout main
git merge --no-ff release/entrega-trimestre5
git tag -a v1.0-trimestre5 -m "Entrega Trimestre 5"
git push origin main --tags

git checkout develop
git merge --no-ff release/entrega-trimestre5
git push origin develop
git branch -d release/entrega-trimestre5
```

## 8. Módulo compartido con el frontend: Auth

`auth` es el único módulo que toca a los dos repos a la vez. Cada repo tiene su propia rama
`feature/auth` (no se comparte rama entre repos). El contrato de la API (endpoints, forma del
JSON, manejo del token JWT y expiración) se define y confirma con el equipo de frontend
**antes** de escribir código en esta rama, usando un archivo de contrato versionado
(`AUTH_CONTRACT.md` o `docs.json`/OpenAPI) publicado en este mismo repo backend.

## 9. Reglas de calidad

- No mezclar varios módulos grandes en un mismo commit.
- Commits pequeños y entendibles, no gigantes.
- No desarrollar directamente en `main`.
- Mantener `develop` actualizado (`git pull` antes de crear una rama nueva).
- Pull Requests pequeños cuando sea posible.
- Resolver conflictos antes de integrar, nunca forzar el merge.
- Nunca subir `.env` ni credenciales — verificar `.gitignore` antes de cada commit inicial.
- Todo endpoint nuevo se documenta en Swagger en el mismo PR que lo introduce, no después.
