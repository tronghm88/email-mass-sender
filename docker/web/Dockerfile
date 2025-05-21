FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY packages/web-app/package*.json ./packages/web-app/
COPY shared/common/package*.json ./shared/common/

RUN npm install

COPY . .

RUN npm run build:web

FROM nginx:alpine

COPY --from=builder /app/packages/web-app/build /usr/share/nginx/html
COPY docker/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
