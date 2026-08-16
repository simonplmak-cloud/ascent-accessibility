FROM node:20-slim

WORKDIR /app

RUN npm install -g pnpm@10

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Install Chromium + its OS dependencies for self-hosted headless Chrome
# (replaces Browserless — the worker launches Chromium locally).
RUN pnpm exec playwright install --with-deps chromium

COPY . .

RUN pnpm run worker:build

ENV NODE_ENV=production

CMD ["node", "dist/worker.js"]
