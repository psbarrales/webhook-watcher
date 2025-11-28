# Webhook Watcher API

API HTTP en Koa para capturar, persistir y consultar webhooks. Cada webhook genera su propia base de datos SQLite mediante un adaptador siguiendo un enfoque hexagonal (puerto de repositorio + implementación SQLite).

## Endpoints principales

- `POST /webhooks` → crea un nuevo webhook y devuelve `{ id, url }`.
- `ALL /hooks/:webhookId` y `/hooks/:webhookId/*` → captura cualquier petición entrante y la guarda.
- `GET /webhooks/:webhookId/requests` → lista de solicitudes recibidas (ordenadas de más reciente a más antigua).
- `GET /webhooks/:webhookId/requests/:requestId` → detalle completo de una solicitud (headers, query, body, IP).
- Salud y métricas: `/health`, `/up`, `/ping`, `/metrics`.

## Configuración

- `PORT` (default `3000`)
- `WEBHOOK_STORAGE_PATH` (default `./data/webhooks`) → cada webhook se guarda en un archivo `*.sqlite` dentro de esta carpeta.
- `WEBHOOK_BASE_URL` o `WEBHOOK_HOST` (opcional) → URL base usada para construir el `url` devuelto al crear un webhook (si no se define, se usa `protocol://host` de la request).

## Ejecución en local

```bash
cd api
npm install
PORT=3000 npm run dev
```

La API quedará disponible en `http://localhost:3000`. Las bases de datos se escribirán en `data/webhooks`.

## Docker (solo API)

```bash
docker compose up api
```

Expone `localhost:3000` y persiste los SQLite en el volumen `api-data`.

## Arquitectura rápida

- `src/domain` → entidades y puertos (`WebhookRequest`, `WebhookRequestRepository`).
- `src/application` → casos de uso (`WebhookService`).
- `src/infrastructure/persistence/sqlite` → adaptador SQLite por webhook.
- `src/routes/webhooks.ts` → controladores HTTP que delegan en la capa de aplicación.
