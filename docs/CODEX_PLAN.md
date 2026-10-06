# Codex Implementation Plan — Personal Sales Gallery

## 1. Goal

Build a small, static React application that works as a personal catalog/gallery for items for sale.

The application should:

- Show a list/grid of items for sale.
- Show the main photo, item name, and price on each card.
- Allow the user to open an item detail page.
- Show all photos for the item in a gallery.
- Show a longer description and additional metadata.
- Include a WhatsApp contact button.
- Require **no admin UI, database, backend, or CMS**.
- Allow adding a new item simply by creating a folder containing:
  - `product.json`
  - the item's images

The project should be easy to deploy as a static site.

---

## 2. Recommended Stack

Use:

- React
- TypeScript
- Vite
- React Router
- CSS Modules, plain CSS, or another lightweight styling approach

Avoid adding unnecessary dependencies.

Do not add:

- Backend API
- Database
- Authentication
- CMS
- Admin dashboard
- State management libraries unless clearly needed

Prefer simple React state and derived data.

---

## 3. Initial Project Setup

If the repository is empty, initialize a Vite project using React + TypeScript.

Expected commands may be equivalent to:

```bash
npm create vite@latest . -- --template react-ts
npm install
npm install react-router-dom
```

Adapt to the existing package manager if the repository already contains package-manager configuration.

Before making changes, inspect the repository and preserve any existing conventions if files already exist.

---

## 4. Proposed Project Structure

Use approximately this structure:

```text
src/
  components/
    Layout/
    ProductCard/
    ProductGallery/
    Price/
    EmptyState/

  content/
    products/
      iphone-15-pro/
        product.json
        01.jpg
        02.jpg
        03.jpg

      sample-item/
        product.json
        01.jpg
        02.jpg

  data/
    products.ts

  pages/
    ProductsPage.tsx
    ProductPage.tsx
    NotFoundPage.tsx

  types/
    product.ts

  utils/
    currency.ts
    whatsapp.ts

  App.tsx
  main.tsx
  styles.css
```

The exact component folder organization may be adjusted if a simpler structure is more appropriate.

---

## 5. Product Content Model

Each item should live inside its own folder.

Example:

```text
src/content/products/iphone-15-pro/
  product.json
  01.jpg
  02.jpg
  03.jpg
```

Example `product.json`:

```json
{
  "name": "iPhone 15 Pro",
  "price": 18500,
  "description": "iPhone 15 Pro de 256 GB en excelentes condiciones.",
  "condition": "Usado",
  "status": "available",
  "featuredImage": "01.jpg",
  "images": [
    "01.jpg",
    "02.jpg",
    "03.jpg"
  ]
}
```

Use the folder name as the product slug.

For the example above:

```text
iphone-15-pro
```

should produce:

```text
/product/iphone-15-pro
```

---

## 6. TypeScript Model

Create an appropriate TypeScript type/interface.

Example:

```ts
export type ProductStatus = "available" | "sold" | "reserved";

export interface Product {
  slug: string;
  name: string;
  price: number;
  description: string;
  condition?: string;
  status: ProductStatus;
  featuredImage: string;
  images: string[];
}
```

The runtime product object may also contain resolved image URLs, for example:

```ts
export interface ResolvedProduct extends Product {
  featuredImageUrl: string;
  imageUrls: string[];
}
```

Use whatever naming produces the cleanest implementation.

---

## 7. Automatic Product Discovery

The app must NOT contain a manually maintained central array of products.

Use Vite's:

```ts
import.meta.glob()
```

to discover all `product.json` files automatically.

Conceptually:

```ts
const productFiles = import.meta.glob(
  "../content/products/*/product.json",
  {
    eager: true,
    import: "default"
  }
);
```

Also discover images using `import.meta.glob()`.

Conceptually:

```ts
const imageFiles = import.meta.glob(
  "../content/products/**/*.{jpg,jpeg,png,webp}",
  {
    eager: true,
    query: "?url",
    import: "default"
  }
);
```

Create a single data-loading module such as:

```text
src/data/products.ts
```

Its responsibilities should be:

1. Discover product JSON files.
2. Derive the slug from the parent directory name.
3. Resolve image filenames from the JSON to their final Vite asset URLs.
4. Return normalized `Product` objects.
5. Export helpers such as:

```ts
getProducts()
getProductBySlug(slug)
```

Avoid spreading `import.meta.glob()` logic throughout components.

---

## 8. Validation / Defensive Behavior

The loader should fail gracefully when product content is malformed.

At minimum, handle:

- Missing featured image
- Missing image listed in `images`
- Invalid or missing price
- Missing product name
- Unknown status

During development, useful console warnings are acceptable.

Do not make the content loader overly complex.

A full schema validation library is not required for the first version.

---

## 9. Product Listing Page

Route:

```text
/
```

Display the available products in a responsive grid.

Each product card should contain:

- Featured image
- Product name
- Formatted price
- Optional status indicator

The entire card should be clickable.

Clicking it should navigate to:

```text
/product/:slug
```

Suggested behavior:

- Desktop: multiple-column grid
- Tablet: 2-column grid where appropriate
- Mobile: 1–2 columns depending on available width

The UI should feel image-first and clean.

---

## 10. Product Detail Page

Route:

```text
/product/:slug
```

Display:

- Product name
- Price
- Main image
- Thumbnail gallery
- Description
- Condition, when provided
- Status
- WhatsApp contact button
- Back link to the catalog

If the slug does not exist, render the not-found page.

---

## 11. Product Gallery

Implement a simple gallery without adding a large carousel dependency unless clearly necessary.

Expected behavior:

- First image is selected initially.
- Large selected image is displayed.
- Remaining images appear as thumbnails.
- Clicking a thumbnail changes the selected image.
- Selected thumbnail should be visually identifiable.
- Images should preserve aspect ratio.
- Images should not distort.

Nice-to-have if simple:

- Keyboard navigation
- Previous/next buttons
- Click main photo to show a larger modal/lightbox

Do not let a lightbox delay the MVP.

---

## 12. Price Formatting

Create a reusable utility.

Prices should display as Mexican pesos.

Example:

```text
$18,500
```

Use `Intl.NumberFormat`.

Example configuration:

```ts
new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0
})
```

---

## 13. WhatsApp Contact

Include a WhatsApp button on each product detail page.

Keep the phone number configurable in one place.

For example:

```ts
export const WHATSAPP_NUMBER = "521XXXXXXXXXX";
```

Do not hardcode the number in multiple components.

Generate a message similar to:

```text
Hola, me interesa el iPhone 15 Pro que tienes en venta.
```

URL-encode the message.

Open WhatsApp in a new tab.

Create a helper utility rather than building the URL directly inside the component.

---

## 14. Product Status

Support at least:

```text
available
reserved
sold
```

Expected UI:

### available

- Show normal product card.
- WhatsApp button enabled.

### reserved

- Show a visible "Apartado" / "Reservado" indicator.
- WhatsApp button may remain available.

### sold

- Show a visible "Vendido" indicator.
- Card can remain visible in the catalog.
- Disable or hide the contact CTA if appropriate.
- Visually distinguish it without making the item unreadable.

Keep the behavior centralized enough that it can be changed later.

---

## 15. Sorting

Default product ordering:

1. `available`
2. `reserved`
3. `sold`

Within the same status, a deterministic ordering is sufficient.

Optional future enhancement:

Add an explicit field such as:

```json
"order": 10
```

Do not require it for the first version.

---

## 16. Responsive Design

The site should work well primarily on phones.

Requirements:

- Mobile-first layout.
- Large touch targets.
- Images load cleanly without horizontal overflow.
- Product detail page should become a two-column layout on wider desktop screens if appropriate.
- Thumbnails should remain usable on small screens.
- Text should remain readable without excessive margins.

---

## 17. Visual Direction

Keep the design minimal and neutral so the products are the focus.

Suggested design characteristics:

- Light background
- Cards with subtle borders
- Moderate rounded corners
- Large photography
- Strong product name
- Price visually prominent
- Minimal header
- Generous spacing
- Avoid excessive gradients, animations, or decorative UI

Do not spend too much implementation effort on elaborate styling before the app works.

---

## 18. Navigation

Basic navigation is enough.

Suggested header:

```text
Artículos en venta
```

Optional subtitle:

```text
Artículos disponibles
```

No navigation menu is required unless more sections are added later.

---

## 19. Routing

Use React Router.

Routes:

```text
/
  -> ProductsPage

/product/:slug
  -> ProductPage

*
  -> NotFoundPage
```

Make sure direct navigation to a product URL works in local development.

Keep the app compatible with static hosting.

If deployment requires SPA rewrite configuration, document it in the README rather than coupling the app to a specific hosting platform.

---

## 20. Image Handling

Do not use remote image hosting for the MVP.

Images belong inside each product folder.

Supported extensions should include at least:

```text
.jpg
.jpeg
.png
.webp
```

Prefer WebP or optimized JPEG files for real product content.

Do not implement automatic image optimization infrastructure for the first version.

Use:

```html
loading="lazy"
```

where appropriate on listing-page images.

The main image on a product detail page may load eagerly.

---

## 21. Sample Products

Create at least two sample products so the initial implementation can be tested immediately.

Use placeholder/local sample images that can later be replaced.

The examples should exercise:

- Multiple images
- Description
- Price
- Condition
- Different statuses if useful

Do not depend on external placeholder-image services if avoidable.

If binary sample photos are undesirable, create simple local SVG placeholder images.

---

## 22. Accessibility

At minimum:

- Add meaningful `alt` text to product images.
- Ensure clickable cards are keyboard accessible.
- Use semantic buttons and links.
- Provide visible focus states.
- Do not rely solely on color for status.
- Ensure image thumbnails have accessible labels.

---

## 23. README

Create/update `README.md`.

It should explain:

### Running locally

```bash
npm install
npm run dev
```

### Building

```bash
npm run build
```

### Adding a product

Example:

```text
src/content/products/my-new-product/
  product.json
  01.jpg
  02.jpg
```

Then show the expected JSON format.

Explicitly explain:

- Folder name becomes slug.
- Images referenced in JSON must exist in the same product folder.
- `featuredImage` should normally also appear in `images`.
- Available statuses.

This documentation is important because adding/editing products is intentionally done through files rather than an admin UI.

---

# Implementation Waves

## Wave 1 — Bootstrap

Goal: obtain a running React application.

Tasks:

- Initialize React + TypeScript + Vite if needed.
- Install React Router.
- Remove unnecessary starter content.
- Create global styling foundation.
- Create the base application layout.
- Confirm `npm run dev` and `npm run build` work.

Acceptance criteria:

- App starts without errors.
- Production build succeeds.

---

## Wave 2 — Product Content System

Goal: make filesystem-based products work.

Tasks:

- Create `Product` types.
- Create sample product folders.
- Implement JSON discovery using `import.meta.glob`.
- Implement image discovery.
- Resolve product image filenames to Vite URLs.
- Derive slugs from folder names.
- Export normalized product data.
- Add basic validation/warnings.

Acceptance criteria:

- Adding a valid product folder automatically adds a product to application data.
- No central list needs manual modification.
- Images resolve correctly.

---

## Wave 3 — Catalog Page

Goal: show all products.

Tasks:

- Create `ProductsPage`.
- Create `ProductCard`.
- Create responsive product grid.
- Show:
  - image
  - name
  - price
  - status
- Link cards to product routes.
- Implement product ordering.

Acceptance criteria:

- All sample products render.
- Cards work on mobile and desktop.
- Clicking a card opens the correct product URL.

---

## Wave 4 — Product Detail + Gallery

Goal: make each product fully browsable.

Tasks:

- Create `ProductPage`.
- Resolve product from route slug.
- Create gallery state.
- Render main image.
- Render thumbnails.
- Render description and metadata.
- Add back navigation.
- Handle unknown slug.

Acceptance criteria:

- Direct URL navigation works.
- Gallery thumbnails change the main photo.
- Invalid products show a clear not-found state.

---

## Wave 5 — WhatsApp + Status Behavior

Goal: make the catalog useful for selling.

Tasks:

- Add centralized WhatsApp configuration.
- Add URL/message helper.
- Add WhatsApp CTA.
- Handle `available`, `reserved`, and `sold`.
- Adjust CTA behavior for sold products.

Acceptance criteria:

- WhatsApp URL contains correct product name.
- Message is correctly URL-encoded.
- Status behavior is visually clear.

---

## Wave 6 — Polish

Goal: prepare the app for real use.

Tasks:

- Improve responsive spacing.
- Add loading optimizations.
- Add image `alt` text.
- Add focus styles.
- Improve empty states.
- Improve not-found page.
- Verify mobile layout.
- Remove dead code.
- Verify TypeScript has no errors.
- Verify production build.
- Finish README.

Acceptance criteria:

```bash
npm run build
```

completes successfully.

The application is ready to deploy as a static SPA.

---

# Future Enhancements

Do NOT implement these unless they are extremely easy and do not complicate the MVP.

Potential future features:

- Categories
- Search
- Filtering
- Sort by price
- Explicit custom product order
- Multiple currencies
- Favorite/share buttons
- Lightbox
- Image swipe gestures
- Previous/next product navigation
- Product creation script
- Automatic image compression
- Markdown descriptions
- Cloud image storage
- Small CMS
- Sold-product archive
- Deployment preview
- Open Graph metadata for sharing individual products

---

# Optional Future Content Format

If descriptions become more complex, the architecture could later move from:

```text
product.json
```

to:

```text
product.json
description.md
```

Do NOT add this complexity now.

---

# Important Constraints for Codex

When implementing this project:

1. First inspect the repository.
2. Preserve existing code/conventions if the repo is not actually empty.
3. Implement incrementally.
4. Keep the code simple.
5. Avoid premature abstractions.
6. Avoid unnecessary dependencies.
7. Do not introduce a backend.
8. Do not create an admin UI.
9. Product folders must be the source of truth.
10. Adding a product must NOT require editing a central product list.
11. Keep the product-loading logic isolated from UI components.
12. Verify the build before considering the task complete.
13. Update the README with exact instructions for adding products.

---

# Definition of Done

The MVP is complete when:

- The application can be cloned and run locally.
- The home page automatically lists product folders.
- Every product shows its name, price, and featured image.
- Clicking a product opens its own route.
- The detail page shows all product photos.
- The detail page shows description and metadata.
- The user can initiate a WhatsApp conversation about an available product.
- Reserved/sold states are represented.
- A new product can be added only by:
  1. creating a folder,
  2. adding photos,
  3. creating `product.json`.
- No source-code array needs to be manually updated.
- The production build passes.
- The README documents the content workflow.
