# AUTH_CONTRACT.md — Contrato de API de Autenticación

**Proyecto:** Fincas y Patitas — versión móvil (Trimestre 5, SENA-CEET)
**Repos:** backend `backend_appmovil_fincas` (Express+TS+Prisma+Neon) / frontend `fincas-patitas-movil-app` (Flutter)
**Propósito:** contrato versionado para que el frontend (Dany) desarrolle `feature/auth` sin depender del avance en tiempo real del backend. Cualquier cambio se refleja en este archivo y en su historial de git.

---

## 1. Esquema real de la base de datos (Neon)

**Tabla `roles`** (semilla ya cargada):

| id | nombre_rol     |
|----|----------------|
| 1  | Administrador  |
| 2  | Encargado      |
| 3  | Empleado       |

**Tabla `usuarios`**: actualmente vacía. Columnas confirmadas hasta ahora:

| Columna              | Tipo (propuesto) | Notas |
|----------------------|-------------------|-------|
| `correo_electronico` | string, único     | login |
| `contrasena`         | string (hash)     | nunca se devuelve en respuestas |
| `rol_id`             | int (FK a `roles.id`) | |

> ⚠️ **PENDIENTE DE CONFIRMAR:** solo estas 3 columnas están verificadas contra el `schema.prisma` real. Falta confirmar si `usuarios` tiene además `nombre`, `apellido`, `id` (uuid o serial), `creado_en`, `activo`, etc.

---

## 2. Endpoints

| Método | Ruta             | Uso                                   |
|--------|------------------|----------------------------------------|
| POST   | `/api/auth/register` | Crear usuario                     |
| POST   | `/api/auth/login`    | Autenticar y emitir tokens         |
| POST   | `/api/auth/refresh`  | Renovar `accessToken`              |
| POST   | `/api/auth/logout`   | Invalidar `refreshToken`           |

### POST `/api/auth/register`

**Request:**
```json
{
  "correo_electronico": "string",
  "contrasena": "string",
  "rol_id": 3
}
```

**Response 201:**
```json
{
  "id": "int|uuid",
  "correo_electronico": "string",
  "rol_id": 3,
  "rol": "Empleado"
}
```

> ⚠️ **PENDIENTE DE CONFIRMAR:** ¿el registro es autoservicio (cualquiera elige `rol_id`) o el backend fija `rol_id = 3` por defecto? Dejar que el cliente elija su propio rol es un riesgo de seguridad.

### POST `/api/auth/login`

**Request:**
```json
{
  "correo_electronico": "string",
  "contrasena": "string"
}
```

**Response 200:**
```json
{
  "accessToken": "jwt...",
  "refreshToken": "jwt...",
  "expiresIn": 900,
  "user": {
    "id": "int|uuid",
    "correo_electronico": "string",
    "rol_id": 3,
    "rol": "Empleado"
  }
}
```

### POST `/api/auth/refresh`

**Request:**
```json
{ "refreshToken": "jwt..." }
```

**Response 200:**
```json
{ "accessToken": "jwt...", "expiresIn": 900 }
```

### POST `/api/auth/logout`

**Request:**
```json
{ "refreshToken": "jwt..." }
```

**Response:** `204 No Content`

---

## 3. Manejo de tokens (JWT)

- **`accessToken`**: JWT (HS256), expira en **15 minutos**. Va en `Authorization: Bearer <token>`.
- **`refreshToken`**: JWT o string opaco, expira en **7 días**.

> ⚠️ **PENDIENTE DE CONFIRMAR:** duración exacta de tokens y si hay rotación de refresh token (invalidar el anterior al usar uno nuevo) o solo expiración simple.

---

## 4. Errores

Formato uniforme:
```json
{ "error": { "code": "STRING_CODE", "message": "mensaje legible" } }
```

| HTTP | `code`                  | Cuándo                                      |
|------|-------------------------|----------------------------------------------|
| 400  | `VALIDATION_ERROR`      | Campos faltantes o mal formados               |
| 401  | `INVALID_CREDENTIALS`   | Correo o contraseña incorrectos               |
| 401  | `INVALID_REFRESH_TOKEN` | Refresh token inválido, expirado o revocado   |
| 403  | `FORBIDDEN`             | Usuario sin permiso para la acción (por rol)  |
| 409  | `EMAIL_ALREADY_EXISTS`  | Registro con correo ya existente              |
| 500  | `INTERNAL_ERROR`        | Error no controlado                           |

---

## 5. Resumen de pendientes antes de cerrar el contrato

1. Columnas completas reales de `usuarios` (más allá de `correo_electronico`, `contrasena`, `rol_id`).
2. Regla de asignación de `rol_id` en el registro (autoservicio vs. rol fijo por defecto).
3. Duración final de `accessToken` / `refreshToken`.
4. Si hay rotación de refresh token o solo expiración simple.

Mientras se confirma lo anterior, este documento es la base para que Dany empiece las pantallas de login/registro en Flutter contra la forma de JSON aquí definida; los valores marcados como pendientes pueden ajustarse sin romper la forma general del contrato.