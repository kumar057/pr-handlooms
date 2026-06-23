# 🪷 PR Handlooms Saree Search

**Elegant Saree Search with Multi-Platform Integration**

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel)](https://pr-handlooms.vercel.app/)
[![GitHub](https://img.shields.io/badge/Repository-GitHub-181717?style=for-the-badge&logo=github)](https://github.com/kumar057/pr-handlooms)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.2-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Puppeteer](https://img.shields.io/badge/Puppeteer-21.0-40B5A4?style=for-the-badge&logo=puppeteer&logoColor=white)](https://pptr.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](#license)

PR Handlooms Saree Search is a full-stack e-commerce experience for discovering premium Indian sarees across an internal product catalog and external marketplaces such as Amazon, Flipkart, and Myntra. It combines a luxury storefront, a full-screen search modal, image-assisted search, platform badges, cart interactions, and server-side marketplace aggregation.

## Live Demo

- **Production**: [https://pr-handlooms.vercel.app/](https://pr-handlooms.vercel.app/)
- **Repository**: [https://github.com/kumar057/pr-handlooms](https://github.com/kumar057/pr-handlooms)
- **Hosting**: Vercel
- **Database**: MongoDB Atlas in production, MongoDB/local fallback for development

### Screenshots

Add screenshots or GIFs after deploying:

| Home | Search Modal | Search Results |
| --- | --- | --- |
| ![Home](public/screenshots/home.png) | ![Search modal](public/screenshots/search-modal.png) | ![Search results](public/screenshots/search-results.png) |

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Search Architecture](#search-architecture)
- [API Reference](#api-reference)
- [Database](#database)
- [Deployment](#deployment)
- [Security Notes](#security-notes)
- [Roadmap](#roadmap)
- [License](#license)

## Features

- 🔍 Full-screen search modal with `Ctrl+K` / `Cmd+K` shortcut
- 🏷️ Platform badges for Amazon, Flipkart, and Myntra marketplace results
- 📱 Fully responsive, mobile-first e-commerce layout
- 🗄️ MongoDB product storage with optional auto-seeding
- 🚀 Vercel-ready deployment with automatic GitHub deployments
- 🔄 External marketplace scraping with daily `node-cache` caching
- ⌨️ Keyboard shortcuts: `Ctrl+K` / `Cmd+K` to open search, `Esc` to close
- 🎨 Premium Indian handloom UI with navy, cream, and gold theme tokens
- ⚡ Next.js App Router storefront with a Pages API search endpoint
- 🔒 Type-safe UI built with TypeScript, strict mode, and shared result types
- 🖼️ Image-assisted saree search for color, fabric, border, and tag detection
- 🛒 Internal products support cart actions, stock badges, and local store state
- 🌐 External products redirect to marketplace product pages with prices and images

## Tech Stack

### Frontend

- **Framework**: Next.js 16.2.6 with App Router
- **Language**: TypeScript 5.7
- **UI**: React 19, Base UI, shadcn-style components
- **Styling**: Tailwind CSS 4, custom CSS tokens, dark mode support
- **State Management**: React hooks and Context via `StoreProvider`
- **Icons**: Lucide React and React Icons
- **Notifications**: Sonner

### Backend

- **API**: Next.js Pages API route at `pages/api/search.js`
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Node-Cache for external marketplace search results
- **Scraping**: ScrapingBee, Puppeteer, Cheerio, and Axios
- **Rate Limiting**: In-memory per-IP rate limiter for search requests

### Deployment

- **Platform**: Vercel
- **Analytics**: Vercel Analytics in production
- **Version Control**: Git and GitHub
- **Environment**: `.env.local` for development, Vercel Environment Variables for production

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/kumar057/pr-handlooms.git
cd pr-handlooms

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local

# 4. Edit .env.local with your MongoDB URI and ScrapingBee key

# 5. Seed the database when using MongoDB
npm run seed:sarees

# 6. Start the development server
npm run dev

# 7. Open the app
# http://localhost:3000
```

## Environment Variables

Create `.env.local` from `.env.example` and configure the following values:

| Variable | Required | Description |
| --- | --- | --- |
| `MONGODB_URI` | Recommended | MongoDB Atlas or local MongoDB connection string. If omitted, search falls back to local catalog data. |
| `SEED_SAMPLE_PRODUCTS` | Optional | Set to `true` to auto-seed sample sarees when MongoDB is empty. Set to `false` to disable. |
| `SCRAPINGBEE_API_KEY` | Recommended | ScrapingBee API key used for Amazon, Flipkart, and Myntra marketplace fetching. |
| `FORMSPREE_ENDPOINT` | Optional | Contact/newsletter form endpoint. |

Example:

```env
MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER/DB_NAME?retryWrites=true&w=majority
SEED_SAMPLE_PRODUCTS=true
SCRAPINGBEE_API_KEY=your_scrapingbee_api_key_here
FORMSPREE_ENDPOINT=https://formspree.io/f/your-form-id
```

## Available Scripts

```bash
npm run dev          # Start the Next.js development server
npm run build        # Create a production build
npm run start        # Start the production server
npm run seed:sarees  # Seed MongoDB with sample saree products
npm run lint         # Run ESLint
```

## Project Structure

```text
app/
  (shop)/
    page.tsx                 # Home storefront
    search/page.tsx          # Search results page
    products/                # Product listing and details
    categories/              # Category routes
  api/
    checkout/route.ts        # Checkout handler
    cart-alert/route.ts      # Cart alert handler
  globals.css                # Tailwind and design tokens
  layout.tsx                 # Root layout, fonts, providers, analytics

components/
  home/saree-search-section.tsx
  search/SearchModal.tsx
  search/SearchFilters.tsx
  search/SearchProductCard.tsx
  site-header.tsx
  product-card.tsx
  ui/                        # Shared UI primitives

lib/
  data.ts                    # Local product catalog
  external-scrapers.js       # Amazon, Flipkart, Myntra integration
  image-search.ts            # Client-side image analysis helpers
  mongodb.js                 # MongoDB connection helper
  search.ts                  # Search intent and ranking utilities
  store.tsx                  # Cart, wishlist, and store context

models/
  Product.js                 # Mongoose product schema

pages/
  api/search.js              # Main search API endpoint

scripts/
  seed-sarees.js             # MongoDB seed script

public/
  products/                  # Product and storefront assets
```

## Search Architecture

The search experience is designed around one normalized product shape that can represent both internal PR Handlooms products and external marketplace products.

1. The header search button or `Ctrl+K` / `Cmd+K` opens `SearchModal`.
2. The modal builds query params for `/search`.
3. `app/(shop)/search/page.tsx` renders `SareeSearchSection`.
4. `SareeSearchSection` calls `/api/search`.
5. `pages/api/search.js` searches internal products from MongoDB or the local catalog.
6. The API also calls `searchExternalPlatforms()` for Amazon, Flipkart, and Myntra results.
7. Results are interleaved and returned with source metadata.
8. `SearchProductCard` renders internal cards with cart actions and external cards with platform badges and marketplace links.

### Internal Search

Internal results use MongoDB when `MONGODB_URI` is configured. If MongoDB is unavailable or not configured, the app falls back to the curated local catalog in `lib/data.ts`.

Supported filters:

- Query text
- Category
- Color
- Occasion
- Minimum price
- Maximum price
- Source: internal, external, or all

### External Marketplace Search

Marketplace results are fetched through `lib/external-scrapers.js`:

- Amazon search result parsing
- Flipkart search result parsing
- Myntra HTML and embedded payload parsing
- ScrapingBee support with direct-request fallback
- Puppeteer fallback for sparse marketplace responses
- 24-hour in-memory cache through `node-cache`
- Price range filtering and product de-duplication

## API Reference

### `GET /api/search`

Searches internal and external saree products.

#### Query Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `q` | string | Search text, such as `banarasi silk` or `maroon wedding`. |
| `category` | string | One of `Banarasi`, `Kanjivaram`, `Paithani`, `Chanderi`, `Bandhani`. |
| `color` | string | Color keyword. |
| `occasion` | string | One of `Wedding`, `Festive`, `Casual`, `Party`. |
| `minPrice` | number | Minimum product price. |
| `maxPrice` | number | Maximum product price. |
| `includeExternal` | boolean | Accepted by the route and used by search UI flows. |

#### Example

```bash
curl "http://localhost:3000/api/search?q=banarasi&maxPrice=20000"
```

#### Response Shape

```json
{
  "success": true,
  "count": 11,
  "internalCount": 2,
  "externalCount": 9,
  "results": [
    {
      "id": "gold-ivory-banarasi-saree",
      "source": "internal",
      "name": "Gold & Ivory Banarasi Brocade Saree",
      "price": 22499,
      "image": "/products/banarasi-gold.png",
      "inStock": true
    },
    {
      "id": "amazon-example",
      "source": "external",
      "platform": "amazon",
      "platformName": "Amazon",
      "name": "Banarasi Silk Saree",
      "price": 2099,
      "image": "https://example.com/product.jpg",
      "url": "https://www.amazon.in/example-product"
    }
  ]
}
```

## Database

The MongoDB product model lives in `models/Product.js` and includes:

- Product name
- Category
- Price
- Image list
- Description
- Stock status
- Occasion
- Color
- Material
- Text indexes for searchable fields

Seed sample products with:

```bash
npm run seed:sarees
```

When `SEED_SAMPLE_PRODUCTS` is not set to `false`, the search API can insert sample products automatically if the connected MongoDB collection is empty.

## Deployment

### Vercel

1. Push the repository to GitHub.
2. Import the repository in Vercel.
3. Add environment variables in **Project Settings → Environment Variables**.
4. Deploy with the default Next.js build command:

```bash
npm run build
```

Recommended Vercel variables:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
SEED_SAMPLE_PRODUCTS=true
SCRAPINGBEE_API_KEY=your_scrapingbee_api_key
FORMSPREE_ENDPOINT=your_formspree_endpoint
```

### GitHub Update Flow

```bash
git status
git add README.md
git commit -m "Add professional project README"
git push origin main
```

## Security Notes

- Never commit `.env.local` or real API keys.
- Keep ScrapingBee and MongoDB credentials in Vercel Environment Variables.
- Rotate any token that has ever been committed or shared.
- Use MongoDB Atlas network and user permission controls for production.
- External marketplace pages can change without notice, so scraper selectors should be monitored over time.
- Respect marketplace terms and prefer official affiliate/product APIs when available.

## Roadmap

- Add production screenshots and demo GIFs
- Add a `LICENSE` file for the MIT license badge
- Add official affiliate/API integrations for marketplace results
- Add automated tests for `/api/search`
- Add persistent search analytics and popular query tracking
- Add server-side image search integration for richer visual matching

## License

MIT License. Add a `LICENSE` file before distributing the project publicly.
