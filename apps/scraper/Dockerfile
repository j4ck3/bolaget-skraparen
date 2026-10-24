FROM oven/bun:1

RUN apt-get update && \
    apt-get install -y --no-install-recommends chromium && \
    rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production \
    PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    PORT=5000

RUN groupadd -r app && useradd -rm -g app -G audio,video app

WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

COPY --chown=app:app . .

USER app
EXPOSE 5000
CMD ["bun", "run", "start"]
