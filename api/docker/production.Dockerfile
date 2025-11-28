FROM node:16-alpine AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /workspace

COPY ./api/package.json ./api/package-lock.json ./

RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

FROM nginx:1.21.6-alpine

WORKDIR /workspace

# Nginx files
COPY ./api/docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY ./api/docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./api/docker/nginx/502.html /var/www/html/502.html

# Project files
COPY --from=deps /workspace/node_modules ./node_modules
COPY ./api .
# Installing dependencies
RUN apk update && apk add --no-cache openssl nodejs npm yarn
# Adding SSL
RUN ["./docker/create-certificate.sh"]
# Running the app
ENTRYPOINT [ "./docker/entrypoint.sh" ]
