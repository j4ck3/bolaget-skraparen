# Bolaget Skraparen

A Next.js web application for searching and finding alcoholic beverages available at Systembolaget stores across Sweden. Users can select a drink, enter a city or area, and get detailed information about store availability.

## Features

- 🍷 Search for alcoholic beverages by selecting from a dropdown
- 📍 Search by city or area to find nearby stores
- 🏪 View detailed store information including availability and pricing
- ➕ Add custom drinks to the selection list
- 🎨 Modern, responsive UI built with Tailwind CSS
- ⚡ Fast and efficient with Next.js 15

## Tech Stack

- **Framework**: Next.js 15
- **Runtime**: Bun
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios

## Prerequisites

- [Bun](https://bun.sh/) installed on your system
- Access to the `stock-scraper` backend API service (running on port 5000)

## Installation

1. Clone the repository:
```bash
git clone git@gitlab.com:j4ck3/bolaget-skraparen.git
cd bolaget-skraparen
```

2. Install dependencies:
```bash
bun install
```

## Development

1. Make sure the `stock-scraper` backend service is running and accessible

2. Set the API URL (optional, defaults to `http://stock-scraper:5000`):
```bash
export API_URL=http://localhost:5000
```

3. Start the development server:
```bash
bun run start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Building for Production

```bash
bun run build
```

## Docker

### Development

Build and run the development Docker container:
```bash
docker build -f Dockerfile.dev -t bolaget-skraparen:dev .
docker run -p 3000:3000 bolaget-skraparen:dev
```

### Production

Build and run the production Docker container:
```bash
docker build -t bolaget-skraparen:prod .
docker run -p 3000:3000 -e API_URL=http://stock-scraper:5000 bolaget-skraparen:prod
```

## Project Structure

```
bolaget-skraparen/
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── data/            # Static data (cities, etc.)
│   ├── interfaces/      # TypeScript interfaces
│   ├── services/        # API service functions
│   └── styles/          # CSS styles
├── static/              # Static assets (images)
└── Dockerfile           # Production Docker configuration
```

## API Integration

This application requires the `stock-scraper` backend service to be running. The frontend makes requests to:
- `GET /api/bolaget/getstores?target={drinkUrl}&area={city}`

The API URL can be configured via the `API_URL` environment variable.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

Private project - All rights reserved
