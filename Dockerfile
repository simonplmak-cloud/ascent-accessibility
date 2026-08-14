FROM node:20-slim

WORKDIR /app

RUN npm install -g pnpm@10

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run worker:build

ENV NODE_ENV=production

CMD ["node", "dist/worker.js"]
