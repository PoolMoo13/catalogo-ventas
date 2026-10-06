import type { Product, ProductStatus } from '../types/product';
import { productStatus } from './productStatus';
import { getCategoryById } from './categories';

type Warn = (message: string) => void;
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export function normalizeProducts(
  files: Record<string, unknown>,
  images: Record<string, string>,
  placeholder: string,
  warn: Warn = console.warn,
): Product[] {
  const products: Product[] = [];

  for (const [path, raw] of Object.entries(files)) {
    const directory = path.slice(0, path.lastIndexOf('/'));
    const slug = directory.split('/').at(-1)!;
    const report = (message: string) => warn(`[products/${slug}] ${message}`);

    if (!isRecord(raw) || typeof raw.name !== 'string' || !raw.name.trim()) {
      report('Missing product name; skipping product.');
      continue;
    }
    if (typeof raw.price !== 'number' || !Number.isFinite(raw.price) || raw.price < 0) {
      report('Price must be a finite, non-negative number; skipping product.');
      continue;
    }
    if (raw.status !== 'available' && raw.status !== 'reserved' && raw.status !== 'sold') {
      report('Unknown or missing status; use available, reserved, or sold. Skipping product.');
      continue;
    }

    if (typeof raw.category !== 'string' || !getCategoryById(raw.category)) {
      report('Missing or unknown category; use an ID from src/content/categories.json. Skipping product.');
      continue;
    }

    const resolve = (filename: unknown): string | undefined => {
      if (typeof filename !== 'string' || !filename || /[/\\]/.test(filename)) {
        report('Image must be a filename in the product folder.');
        return undefined;
      }
      const url = images[`${directory}/${filename}`];
      if (!url) report(`Image not found: ${filename}`);
      return url;
    };
    const featured = resolve(raw.featuredImage);
    if (!Array.isArray(raw.images)) report('Missing images array; using featured image or placeholder.');
    const imageUrls = [...new Set((Array.isArray(raw.images) ? raw.images : [])
      .map(resolve).filter((url): url is string => Boolean(url)))];
    if (featured && !imageUrls.includes(featured)) imageUrls.push(featured);
    if (!imageUrls.length) imageUrls.push(placeholder);
    if (typeof raw.description !== 'string') report('Missing description; using an empty description.');

    products.push({
      slug,
      name: raw.name.trim(),
      category: raw.category,
      price: raw.price,
      description: typeof raw.description === 'string' ? raw.description.trim() : '',
      condition: typeof raw.condition === 'string' ? raw.condition.trim() || undefined : undefined,
      status: raw.status as ProductStatus,
      featuredImageUrl: featured ?? imageUrls[0],
      imageUrls,
    });
  }

  return products.sort((a, b) => productStatus[a.status].order - productStatus[b.status].order
    || (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0));
}
