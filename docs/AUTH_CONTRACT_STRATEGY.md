# Estrategia de coordinación del contrato de Auth — Fincas y Patitas Móvil

Documento de síntesis. Trimestre 5, ADSO — SENA-CEET. Proyecto "Fincas y Patitas" (móvil).

## 1. Contexto

El módulo de **autenticación** (login/registro) es el único que toca ambos repos a la vez:

- Frontend (Dany, Flutter): pantallas de login/registro + manejo de sesión, en `feature/auth`
  del repo `fincas-patitas-movil-app`.
- Backend (Milena y el usuario, Express + TS + Prisma + Neon): endpoints de autenticación, en
  `feature/auth` del repo `fincas_patitas_app_movil`.

Ambos lados usan agentes Claude independientes, cada uno sin visibilidad de la conversación del
otro. Se necesitaba un mecanismo de coordinación que no dependiera de que las dos conversaciones
coincidieran en el tiempo.

## 2. Opciones evaluadas

1. **Archivo de contrato versionado en el repo del backend** (elegida) — el contrato de Auth se
   redacta como archivo (`AUTH_CONTRACT.md` y/o `docs.json`/OpenAPI generado por Swagger) y se
   sube al repo backend, que es público. El agente del frontend lo lee directo desde la URL de
   GitHub. Es asíncrono, versionado y no requiere que ambas IAs "conversen en vivo".
2. **Copy-paste dirigido entre las dos conversaciones** (aceptable, descartada) — un agente
   redacta la propuesta, el usuario se la pasa manualmente a Milena/Dany, y viceversa. Funciona
   pero depende de que alguien haga de mensajero cada vez que algo cambie; riesgo de que una
   parte trabaje con una versión desactualizada.
3. **Puentear dos sesiones de Claude directamente** (poco probable, descartada) — técnicamente
   posible en teoría, pero requiere que ambas cuentas/sesiones sean visibles entre sí, lo cual no
   aplica cuando son personas distintas con cuentas distintas. No es viable hoy sin configuración
   manual externa, y sería frágil.

## 3. Decisión

Se adopta la **opción 1**: archivo de contrato versionado en el repo backend, mismo patrón que ya
funcionó para traer los modelos de dominio (Animal, etc.) desde los repos web de referencia.

## 4. Plan de acción

| Paso | Responsable | Acción |
|---|---|---|
| 1 | Backend (usuario/Milena) | Definir una primera propuesta de contrato de Auth: endpoints (`POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, etc.), forma del JSON de entrada/salida, manejo del JWT (expiración, refresh), errores y códigos HTTP. |
| 2 | Backend | Publicar esa propuesta como `AUTH_CONTRACT.md` en la raíz o en `/docs` del repo `fincas_patitas_app_movil`, y/o completar la sección `/auth` del `docs.json` (OpenAPI) generado por Swagger. |
| 3 | Backend | Compartir con Dany el link directo al archivo en GitHub (no un PR todavía — es una propuesta para revisar). |
| 4 | Frontend (Dany + su agente) | Revisar la propuesta contra lo que la pantalla de login/registro y el manejo de sesión en Flutter realmente necesitan; proponer ajustes si hace falta. |
| 5 | Ambos | Confirmar el contrato final entre las dos partes (por chat/mensaje directo, no necesita ser otra reunión formal). |
| 6 | Backend | Implementar los endpoints de `feature/auth` en el backend siguiendo exactamente el contrato confirmado. |
| 7 | Frontend | Implementar el consumo de esos endpoints en `feature/auth` del frontend, contra el mismo contrato. |
| 8 | Ambos | Si el contrato cambia después de implementado, se actualiza primero el archivo en el repo backend (queda versionado en el historial de git) y se avisa al otro lado — no se cambia "en silencio". |

## 5. Qué falta para poder avanzar

Para redactar el `AUTH_CONTRACT.md` real (no solo la estrategia) todavía hace falta confirmar,
sin inventar reglas de negocio:

- Si el registro es solo con email/contraseña, o incluye más campos (nombre, rol, finca
  asociada, etc.).
- Si existen roles/perfiles de usuario desde ya (ej. administrador, operario) o eso queda para
  después.
- Duración deseada del access token y del refresh token.
- Si el `refresh` se maneja con cookie httpOnly o se envía el refresh token en el body (en
  móvil, normalmente se maneja explícito en el body/almacenamiento seguro del dispositivo, pero
  se debe confirmar).

Mientras se confirma esto, queda pendiente y se puede seguir avanzando con lo ya definido: el
esqueleto del backend (capas, Prisma, Swagger) y, en paralelo, ir definiendo el resto de
entidades del dominio (Animal, Reproducción, Producción, Inventario, Salud Animal) que no
dependen de esta decisión.
