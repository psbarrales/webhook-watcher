# Webhook Watcher

Full-stack MVP para inspeccionar webhooks (similar a webhook.site). La API guarda cada webhook en su propio archivo SQLite y la webapp muestra las solicitudes recibidas en tiempo casi real.

## Inicio rápido (sin Docker)

```bash
# API
cd api
corepack yarn install
PORT=3000 WEBHOOK_STORAGE_PATH=./data/webhooks yarn dev

# Webapp (en otra terminal)
cd webapp
npm install
VITE_API_URL=http://localhost:3000 npm run dev
```

- API: http://localhost:3000
- Webapp: http://localhost:5173

La webapp genera y persiste el `webhookId` en `localStorage` y cookie; al entrar muestra la URL para copiar y empieza a listar las solicitudes entrantes.

## Docker Compose

```bash
docker compose up --build
```

- API: `http://localhost:3000` (volumen `api-data` para los SQLite).
- Webapp: `http://localhost:5173` (usa `VITE_API_URL=http://localhost:3000` por defecto).

## Dominios configurables

- Puedes servir la API en un dominio y exponer los webhooks en otro (p. ej. `api.v1.devhook.space` y `webhook.devshook.space`). Configura `WEBHOOK_PUBLIC_BASE_URL` (fallback a `WEBHOOK_BASE_URL`/`WEBHOOK_HOST`) para que la API devuelva la URL pública de los webhooks. En la webapp puedes fijar el dominio mostrado/copiar usando `VITE_WEBHOOK_BASE_URL`; las peticiones a la API siguen usando `VITE_API_URL`.

## Endpoints clave

- `POST /webhooks` → crea un webhook `{ id, url }`.
- `ALL /hooks/:webhookId` y `/hooks/:webhookId/*` → captura cualquier request.
- `GET /webhooks/:webhookId/requests` → lista de solicitudes.
- `GET /webhooks/:webhookId/requests/:requestId` → detalle con headers/query/body/IP.

## Notas de arquitectura

- API en Koa con diseño hexagonal: dominio + casos de uso + adaptador SQLite por webhook (`./api/src`).
- Webapp en React/Vite con React Query para refrescar la lista y detalle automáticamente.
- Puedes fijar el host base de los webhooks con `WEBHOOK_BASE_URL` o `WEBHOOK_HOST`; si no, se usa `protocol://host` de la petición entrante.
