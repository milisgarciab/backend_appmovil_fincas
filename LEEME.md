# feature/auth — instrucciones de integración

## 1. Instalar dependencias nuevas

```bash
npm install bcrypt jsonwebtoken
npm install -D @types/bcrypt @types/jsonwebtoken
```

## 2. Copiar/reemplazar archivos

Con el proyecto en la rama `feature/auth`, copia estos archivos en las rutas exactas
(reemplazan a los existentes donde aplica):

- `src/middlewares/errorHandler.ts`  → **reemplaza** el actual (ahora `{ error: { code, message } }`)
- `src/config/env.ts`                → **reemplaza** el actual (agrega bloque `jwt`)
- `src/routes/index.ts`              → **reemplaza** el actual (monta `authRoutes`)
- `src/utils/token.util.ts`          → archivo nuevo
- `src/repositories/usuario.repository.ts` → archivo nuevo
- `src/services/auth.service.ts`     → archivo nuevo
- `src/controllers/auth.controller.ts` → archivo nuevo
- `src/routes/auth.routes.ts`        → archivo nuevo

## 3. Agregar variables a tu `.env` (y a `.env.example` con placeholders)

```env
JWT_ACCESS_SECRET="pon_aqui_un_secreto_largo_y_aleatorio"
JWT_REFRESH_SECRET="otro_secreto_distinto_igual_de_largo"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
```

Genera secretos rápidos (no uses palabras predecibles) con:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Corre eso dos veces (uno para cada secreto) y pega los valores.

## 4. Verificar

```bash
npm run dev
```

Prueba en `http://localhost:3000/docs` — deberías ver el tag **Auth** con los 4 endpoints,
y `POST /api/auth/register` / `login` funcionando contra tu base de Neon.

## 5. Commit y push

```bash
git add .
git commit -m "feat(auth): implementar register, login, refresh y logout con JWT"
git push origin feature/auth
```

## Qué cambió y por qué

- **`errorHandler.ts`**: se extendió de `{ error: "mensaje" }` a `{ error: { code, message } }`
  para que Dany pueda distinguir casos (`INVALID_CREDENTIALS`, `EMAIL_ALREADY_EXISTS`, etc.) sin
  parsear texto — esto coincide con lo que ya prometía `docs/AUTH_CONTRACT.md`.
- **Registro**: auto-registro abierto, `rol_id` queda fijo en `3` (Empleado); no se acepta
  `rol_id` desde el cliente. Un Administrador debe cambiarlo después (ese endpoint de gestión
  de usuarios se hace en otro módulo, no en `feature/auth`).
- **Tokens**: `accessToken` 15 min, `refreshToken` 7 días, sin rotación ni blacklist — logout
  es un no-op del lado del servidor (decisiones ya confirmadas contigo).
- **Contraseñas**: hasheadas con `bcrypt` (10 salt rounds), nunca se devuelven en las respuestas.

## Pendiente fuera de este módulo

- Middleware de autenticación (`Authorization: Bearer <accessToken>`) para proteger las rutas
  de las demás entidades (animales, reproducción, etc.) — lo armamos cuando empecemos esa rama,
  ya que hasta ahora `feature/auth` solo emite y valida tokens.
