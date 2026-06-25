FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci || npm install

COPY . .

RUN npm run build && \
    mkdir -p /tmp/nginx-html && \
    BROWSER_DIR="$(find dist -type d -name browser | head -n 1)" && \
    if [ -n "$BROWSER_DIR" ]; then \
      cp -r "$BROWSER_DIR"/* /tmp/nginx-html/; \
    else \
      APP_DIR="$(find dist -mindepth 1 -maxdepth 1 -type d | head -n 1)" && \
      cp -r "$APP_DIR"/* /tmp/nginx-html/; \
    fi

FROM nginxinc/nginx-unprivileged:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /tmp/nginx-html /usr/share/nginx/html

EXPOSE 8080