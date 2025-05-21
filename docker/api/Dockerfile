FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY packages/api-service/package*.json ./packages/api-service/
COPY shared/common/package*.json ./shared/common/
COPY shared/database/package*.json ./shared/database/
COPY shared/email/package*.json ./shared/email/

RUN npm install

COPY . .

RUN npm run build:api

FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/packages/api-service/package*.json ./packages/api-service/
COPY --from=builder /app/packages/api-service/dist ./packages/api-service/dist
COPY --from=builder /app/shared ./shared

RUN npm install --production

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "packages/api-service/dist/main"]
