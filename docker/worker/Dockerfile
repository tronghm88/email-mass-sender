FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY packages/worker-service/package*.json ./packages/worker-service/
COPY shared/common/package*.json ./shared/common/
COPY shared/database/package*.json ./shared/database/
COPY shared/email/package*.json ./shared/email/

RUN npm install

COPY . .

RUN npm run build:worker

FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/packages/worker-service/package*.json ./packages/worker-service/
COPY --from=builder /app/packages/worker-service/dist ./packages/worker-service/dist
COPY --from=builder /app/shared ./shared

RUN npm install --production

ENV NODE_ENV=production

CMD ["node", "packages/worker-service/dist/main"]
