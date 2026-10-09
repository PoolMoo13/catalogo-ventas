# Artículos en venta

A small, static personal sales catalog built with React, TypeScript, Vite, and React Router. Product folders are the source of truth; there is no backend, database, CMS, or admin UI. The interface is in Spanish and prices are in Mexican pesos.

## Run locally

Use Node.js 20.19+ or 22.12+ and npm.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Direct product URLs also work in development.

## Build and verify

```sh
npm test
npm run build
npm run preview
```

`npm test` checks validation, category references/filtering, image fallback, ordering, currency, WhatsApp encoding, and automatic discovery by temporarily adding product folders and removing them afterward. `npm run build` checks TypeScript and produces `dist/`. `npm run preview` serves the production build locally.

## Add a product

Create a folder with its JSON file and local images:

```text
src/content/products/my-new-product/
  product.json
  01.jpg
  02.jpg
```

```json
{
  "name": "iPhone 15 Pro",
  "category": "hogar",
  "price": 18500,
  "description": "iPhone 15 Pro de 256 GB en excelentes condiciones.\n\nIncluye caja y cable.",
  "condition": "Usado",
  "status": "available",
  "featuredImage": "01.jpg",
  "images": ["01.jpg", "02.jpg"]
}
```

- The folder name becomes the slug: `my-new-product` opens at `/product/my-new-product`. Prefer lowercase names with hyphens.
- No central product array, imports, or routing edits are required. Vite discovers the folders automatically.
- Images referenced in JSON must exist in the **same product folder**, with matching filename capitalization. Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`, and `.svg` (including uppercase extensions).
- `featuredImage` is the catalog image and should normally also appear in `images`.
- The gallery follows the `images` array, selecting its first image initially. A featured image omitted from the array is appended automatically.
- `price` is a non-negative number in MXN, without currency symbols or commas. The UI displays whole pesos.
- `name`, `category`, `price`, and `status` are required. `category` must reference an ID in `src/content/categories.json`. Supply a `description`; `condition` is optional. Use `\n\n` for paragraphs.
- Statuses: `available` (Disponible), `reserved` (Apartado), and `sold` (Vendido). Available and reserved products allow WhatsApp inquiries. Sold products remain visible with contact hidden.
- Within each category, products sort by available, reserved, then sold, followed by slug within each status.
- Malformed JSON, missing names, invalid prices, unknown statuses, and missing or unknown category IDs cause that product to be skipped, with a warning in development. Missing images are omitted; the featured image falls back to the first valid gallery image, then a local placeholder if none exist.
- Rebuild and redeploy after changing content. Static hosting does not read product folders at runtime.

The three included products use local SVG **sample illustrations**, not actual product photos. Replace or remove their folders before using the catalog for real sales. Optimized WebP or JPEG photos are recommended; no remote image service is needed.

## Categories

Keep the category list in `src/content/categories.json`, at the content root:

```json
[
  { "id": "music", "name": "Música" },
  { "id": "hogar", "name": "Hogar" }
]
```

Each product belongs to one category, referenced by ID, for example `"category": "music"`. IDs are unique lowercase URL-safe slugs (letters, numbers, and separating hyphens); names are the labels shown to visitors. Keeping IDs separate from labels avoids accent/capitalization mismatches and lets you rename a label without changing product files or URLs.

- `/` groups products into category sections in the order listed in the JSON file.
- `/category/music` and `/category/hogar` show only that category's products. The navigation indicates the current category.
- Empty categories remain visible with an empty-state message. Unknown category URLs show the not-found page.
- To add a category, add an `{ "id", "name" }` entry to the file, then reference its ID in product JSON files. Navigation and category pages are generated automatically; no source-code edits are needed.
- Keep IDs stable. If you change or remove an ID, update every product referencing it; old category URLs will no longer resolve. Rebuild and redeploy after content changes.

The product photos and JSON files are assigned to `music`. Move any product by changing its `category` field. This catalog uses one category per product; tags or multiple categories can be added later if needed.

## WhatsApp contact

The seller number is configured once in `src/config.ts`, currently `528261439244` (+52 826 143 9244). To override it without editing source:

```sh
cp .env.example .env.local
```

Set `VITE_WHATSAPP_NUMBER` to your international number, including country code. Restart Vite after changing it, and rebuild for deployment. This is a public contact number bundled into the client, not a secret. An invalid or empty override disables contact links.

The helper creates a URL-encoded message containing the product name. WhatsApp opens in a new tab; sold products have no contact link.

## Deploy to Vercel

The included `vercel.json` configures Vite, installs dependencies with `npm ci`, builds with `npm run build`, and publishes `dist/`. Its SPA rewrite enables direct product links and refreshes, following [Vercel's Vite guidance](https://vercel.com/docs/frameworks/frontend/vite#using-vite-to-make-spas).

1. Push this repository, including `package-lock.json` and `vercel.json`, to your Git provider.
2. Import the repository as a new project in Vercel. Use the repository root as the Root Directory and **Vite** as the Framework Preset. The build and output settings are supplied by `vercel.json`.
3. Optionally set `VITE_WHATSAPP_NUMBER=528261439244` in the project's Environment Variables for Production and Preview. If omitted, the configured seller number is used. Redeploy after changing this variable because it is embedded at build time.
4. Deploy. Open `/product/controlador-x-touch` and `/category/music` directly and refresh them to confirm routing; also check the gallery and WhatsApp link.

For deployment from the repository root with the Vercel CLI:

```sh
npx vercel
# Publish to production when ready:
npx vercel --prod
```

The CLI prompts you to sign in and link a project. Its local `.vercel/` directory is ignored by Git. Product edits require a new deployment; push the updated product folders to the connected repository to trigger a build.

## Other static hosts

Run `npm ci && npm run build` and publish **`dist/`** to a static host. Configure an SPA fallback: serve existing assets normally and rewrite other paths, including `/product/*`, to `/index.html` with status 200. This enables direct links and refreshes on detail pages. The default build assumes deployment at the domain root.

The application renders its own not-found screen for unknown routes and product slugs. The host must apply the SPA fallback for that screen to appear. No server application is needed, and this repository does not provision or deploy to a hosting provider.

## Implementation

- `src/data/products.ts`: Vite JSON/image discovery and parsing.
- `src/data/normalizeProducts.ts`: validation and normalized product data.
- `src/data/productStatus.ts`: labels, ordering, and contact behavior.
- `src/content/categories.json`: category IDs, display names, and display order.
- `src/content/products/`: editable product folders.
- `src/components/`: accessible cards, gallery, prices, and layout.
- `src/pages/`: catalog, detail, and not-found routes.
- `src/utils/`: MXN formatting and WhatsApp links.

See `docs/CODEX_PLAN.md` for the original six-wave implementation plan.
