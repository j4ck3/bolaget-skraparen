# Bolaget Skraparen

Find which Systembolaget stores have a drink in stock. Pick a drink, enter a city, and the app lists the stores in that city with their current stock.

Live at <https://bolaget.hjacke.com>.

## Repository layout

```
apps/
  web/        Next.js 15 frontend (Bun, TypeScript, Tailwind)
  scraper/    Elysia API on Bun that drives Chromium via Puppeteer
compose.dev.yml    local development stack
compose.prod.yml   production stack on the web host
deploy/            deploy script and notes
```

The frontend never calls the scraper from the browser. A Next.js server action in `apps/web/src/services/getStoresInfo.ts` calls `GET /api/bolaget/getstores?target=<product url>&area=<city>` on the scraper, using the `API_URL` environment variable.

The scraper calls Systembolaget's public JSON API (`api-extern.systembolaget.se/sb-api-ecommerce/v1`), the same one the website uses: it resolves the product number from the URL, lists stores in the city, and fetches stock per store. No browser is involved, so changes to the site's markup do not affect it. The API key is the one the site ships in its client bundle (`NEXT_PUBLIC_API_KEY_APIM`); on a 401 the scraper reads the current key from the site's JS and retries. Set `SYSTEMBOLAGET_API_KEY` to override it.

`.github/workflows/canary.yml` queries the live endpoint every morning and fails if no stores come back, so a breaking change on Systembolaget's side shows up as a failed workflow instead of a user report.

## Development

Requires Docker with Compose. No local Bun or Chromium install is needed.

```bash
cp .env.example .env   # optional; the defaults work
docker compose -f compose.dev.yml up --build
```

- Frontend: <http://localhost:3010>
- Scraper API: <http://localhost:5010>

Source is bind-mounted, so edits in `apps/web` and `apps/scraper` reload automatically. File watching uses polling because the Unraid share is a FUSE mount that does not forward inotify events. `node_modules` lives in named volumes. After changing a `package.json`, rebuild with `up --build` and recreate the volume (`docker compose -f compose.dev.yml down -v`).

Quick API check:

```bash
curl -G localhost:5010/api/bolaget/getstores \
  --data-urlencode 'target=https://www.systembolaget.se/produkt/sprit/absolut-8901/' \
  --data-urlencode 'area=Uppsala'
```

## Deployment

Pushing to `master` builds the changed apps as arm64 images on GitHub Actions, pushes them to `ghcr.io/j4ck3/bolaget-web` and `ghcr.io/j4ck3/stock-scraper`, and redeploys the web host over SSH. See [deploy/README.md](deploy/README.md) for the host setup and rollback steps.

## License

Private project. All rights reserved.
