# Webhook Watcher – Documentación técnica

## Visión general
- MVP full-stack para inspeccionar webhooks al estilo webhook.site: la API Koa recibe cualquier request y la guarda en un SQLite por webhook; la webapp React/Vite muestra la actividad en vivo con React Query.
- Orquestación con `docker-compose.yml`: levanta `api` en el puerto 3000 y `webapp` en 5173; volumen `api-data` para persistir los SQLite.

## Estructura de la raíz
- `api/`: servicio HTTP Koa + hexagonal (dominio/casos de uso/adaptadores). Incluye dockerizado con Nginx y certificados self-signed.
- `webapp/`: frontend React/Vite con arquitectura por capas (application/domain/infrastructure/presentation/providers), integra React Query y boilerplate de Firebase/Capacitor.
- `docker-compose.yml`: define imágenes de `api` (Dockerfile en `api/docker/Dockerfile`) y `webapp` (Dockerfile en `webapp/Dockerfile`), conecta servicios vía `VITE_API_URL` y monta volumen `api-data` en `/workspace/data`.
- `README.md`: guía rápida para correr API y webapp y lista de endpoints principales.

## API (`api/`)
- **Entrada**: `src/index.ts` carga `core.init()`. `core/index.ts` crea la app y hace `listen` en `PORT` (por defecto 3000, configurable vía `.env` o variables).
- **Core (`src/core`)**: carga automática de middlewares ordenados alfabéticamente:
  - `body.ts` (`koa-body` con multipart), `compress.ts` (gzip/deflate), `cors.ts`, `helmet.ts`, `views.ts` (nunjucks en `src/views`), `error.ts` (manejo 404/500 con respuesta JSON u HTML), `logger.ts` (koa-logger + métricas `request_total`), `graphql.ts` (inyecta schema combinado desde `src/graphql/*`), `swagger.ts` (UI en `/swagger` en entornos no productivos), `router.ts` (autodescubrimiento de rutas en `src/routes`).
  - Middlewares opcionales desde `src/middleware/*.onload.ts` (actualmente ninguno; `addAPITag.ts` existe pero no se carga por no usar sufijo `.onload.ts`).
- **Rutas (`src/routes`)**:
  - `webhooks.ts`: `POST /webhooks` crea ID y devuelve URL calculada (`WEBHOOK_BASE_URL`/`WEBHOOK_HOST` si existe); `GET /webhooks/:webhookId/requests` lista; `GET /webhooks/:webhookId/requests/:requestId` detalle; `ALL /hooks/:webhookId` y `/hooks/:webhookId/*` capturan cualquier request, guardan headers/query/body/metadatos y responden `202` con `stored: true`.
  - Salud: `health.ts` (`/`, `/health`, `/up`, `/ping`), Métricas: `metrics.ts` (`/metrics` de `prom-client`), GraphQL: `graphql.ts` (graphiql habilitado), estáticos: `public.ts` sirve `src/public` y favicon.
- **Dominios configurables**: la API puede escuchar en su host habitual, pero la URL que se expone al crear un webhook puede apuntar a un dominio distinto (p. ej. `webhook.devshook.space`) usando `WEBHOOK_PUBLIC_BASE_URL` (fallback a `WEBHOOK_BASE_URL`/`WEBHOOK_HOST` o `protocol://host` de la request).
- **Dominio y aplicación**:
  - `domain/entities/WebhookRequest.ts`: modelo y resumen.
  - `domain/ports/WebhookRequestRepository.ts`: puerto del repositorio.
  - `application/webhooks/WebhookService.ts`: casos de uso `createWebhook`, `recordRequest`, `listRequests`, `getRequest`; asegura `prepare` antes de leer/escribir.
- **Infraestructura**:
  - `config/storage.ts`: resuelve ruta de almacenamiento (`WEBHOOK_STORAGE_PATH`, por defecto `./data/webhooks`) y crea carpeta.
  - `persistence/sqlite/SQLiteWebhookRequestRepository.ts`: abre un SQLite por webhook (`<webhookId>.sqlite`), crea tabla `requests`, añade columnas faltantes, serializa headers/query/body a JSON, `list` ordena por `createdAt DESC`, `find` deserializa. Mantiene un máximo de 100 bases: al crear un nuevo webhook elimina el archivo `.sqlite` más antiguo si ya hay 100.
  - `container/webhookService.ts`: ensambla repositorio SQLite y servicio.
- **CORS**: controlable vía `CORS_ALLOWED_ORIGINS` (lista separada por comas). Ejemplo: `CORS_ALLOWED_ORIGINS=https://api.v1.devhook.space` solo emitirá `Access-Control-Allow-Origin` para ese dominio; sin valor se permite el `Origin` entrante.
- **GraphQL (`src/graphql/Post`)**: schema demo `Post` + resolvers (`models/Post`) sobre un modelo en memoria (`src/models/Post.ts` hereda de `models/Model.ts`).
- **Swagger (`src/swagger`)**: genera spec con `swagger-jsdoc` tomando anotaciones JSDoc de rutas/tareas.
- **Utils**: `metrics.ts` (wrapper `prom-client`, prefijo tomado del nombre del paquete o `PREFIX_METRICS`), `query.ts` (parseo seguro de `filter` para where/fields/options).
- **Vistas y estáticos**: `src/views/error.njk` para errores HTML; `src/public` para archivos servidos en `/public`.
- **Datos**: `data/webhooks/` (volumen de SQLite por webhook).
- **Tests**: `__tests__` con cobertura de core, rutas, swagger, utils y middleware (`jest`).
- **Docker**: `api/docker` con `Dockerfile` (Node 20 + Nginx + certificados self-signed), `entrypoint.sh` arranca `yarn dev|prod` + Nginx; `production.Dockerfile` alternativo; configuración Nginx en `api/docker/nginx`.

## Webapp (`webapp/`)
- **Stack**: React 18 + Vite + TypeScript, React Router v7, React Query, styled-components, Tailwind (clases utilitarias), boilerplate para Firebase/Capacitor/Storybook/Cypress.
- **Entrada**: `src/main.tsx` monta `<App />` dentro de `ThemeProvider` + `FrameworkProvider` y aplica `GlobalStyles`.
- **Router (`src/routes`)**: `index.tsx` define `<PublicRoute>` raíz con páginas Home (`/`), VersionUpdatePrompt (`/update`), NotImplemented (`/debug`), rutas de auth y app heredadas del boilerplate, y fallback a `/`. Guards en `routeGuards.tsx`.
- **Página funcional principal (`src/presentation/pages/Home/Home.tsx`)**:
  - Recupera/guarda `webhookId` en `localStorage` y cookie (`webhook-watcher:webhookId`); si no existe crea uno vía `webhookApi.createWebhook`.
  - Construye `webhookUrl` usando `webhookApi.webhookBase` (configurable vía `VITE_WEBHOOK_BASE_URL`, pensado para dominios dedicados como `webhook.devshook.space`) y muestra barra lateral con lista de solicitudes; usa React Query con `refetchInterval: 4000ms` para lista (`listRequests`) y detalle (`getRequest`), selecciona la última automáticamente.
  - UI estilo panel admin: botones “Nuevo webhook” (genera ID y resetea selección) y “Copiar URL”; tarjetas de metadatos (ruta, cliente, host, IDs, headers/query/body, user-agent, etc.) y avisos de error/carga.
- **API client (`src/infrastructure/api/webhooks.ts`)**:
  - Infere `apiBase`: `VITE_API_URL`, si está en dev `5173` usa `http://localhost:3000`, si no, `window.location.origin`.
  - Métodos `createWebhook` (POST `/webhooks`), `listRequests` y `getRequest`; `fetchJson` lanza error textual si `!response.ok`.
- **Capas adicionales (boilerplate reutilizable)**:
  - `src/application`: casos de uso de ejemplo (`useAuthorizationUseCase` para Firebase Auth, `usePostUseCase` con React Query).
  - `src/domain`: contratos (`IAuthorizationPort`, `IPost`).
  - `src/infrastructure`: adapters para Axios/fetch, Firebase (auth, analytics, remote config, error tracking), Capacitor (preferencias, push), clientes de API de autorización.
  - `src/providers`: HOCs y factories (`composeProviders`, `withReactQueryProvider`, `withAnalyticsProvider`, `AuthProvider`, `FrameworkProvider`, etc.) para envolver la app; muchos son plantillas y no se usan directamente en Home.
  - `src/hooks`, `src/theme`, `src/assets`, `src/presentation/pages/*` (NotFound, NotImplemented, VersionUpdatePrompt, Fallback, RequestPrompt) y componentes auxiliares.
  - `src/__test__` y `setupTests.ts` para pruebas con Testing Library; `cypress/` con pruebas E2E (Cucumber), `stories/` para Storybook, `docs/` con plantillas heredadas del boilerplate.
- **Config y scripts**: `package.json` define `dev`, `build`, `preview`, `test` (Vitest), `test:e2e` (start-server-and-test + Cypress), `storybook`, `lint`, `type-check`. Vite configurado en `vite.config.ts`. Variables Vite `VITE_API_URL` (API base) y varias `VITE_FIREBASE_*` (definidas en `webapp/.env`, usadas por adapters de Firebase).
- **Docker**: `webapp/Dockerfile` build multi-stage (Node 18 → Nginx), admite `ARG VITE_FIREBASE_*` para build; Nginx config en `webapp/docker/nginx/default.conf`, entrypoint `docker/entrypoint.production.sh`.

## Flujo funcional end-to-end
1. La webapp al cargar busca `webhookId`; si no existe, llama `POST /webhooks`, recibe `{id, url}` y persiste ID en localStorage + cookie.
2. El usuario envía cualquier request a la URL `/hooks/{id}` (o subrutas). La API captura método, path, headers, query, body y metadatos y los guarda en `data/webhooks/{id}.sqlite`.
3. La webapp consulta cada 4 s `GET /webhooks/{id}/requests` para poblar la lista y `GET /webhooks/{id}/requests/{requestId}` para el detalle, mostrando headers/query/body en panel.
4. Botón “Nuevo webhook” regenera ID y limpia selección; “Copiar URL” usa Clipboard API.

## Ejecución rápida
- Sin Docker: `cd api && corepack yarn install && PORT=3000 WEBHOOK_STORAGE_PATH=./data/webhooks yarn dev`; en otra terminal `cd webapp && npm install && VITE_API_URL=http://localhost:3000 npm run dev`.
- Con Docker Compose: `docker compose up --build` expone API en `http://localhost:3000` y webapp en `http://localhost:5173`.
