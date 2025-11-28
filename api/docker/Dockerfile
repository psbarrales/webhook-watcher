FROM node:20-alpine

WORKDIR /workspace

# Nginx files
COPY ./api/docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY ./api/docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./api/docker/nginx/502.html /var/www/html/502.html

# Project files
COPY ./api .

# Installing dependencies
RUN apk update \
  && apk add --no-cache nginx openssl \
  && npm ci \
  && npm cache clean --force

# Adding SSL
RUN ["./docker/create-certificate.sh"]
# Running the app
ENTRYPOINT [ "./docker/entrypoint.sh" ]
