import placeholder from '../assets/placeholder.svg';
import { normalizeProducts } from './normalizeProducts';

// Read JSON as text so a syntax error in one product cannot break the entire catalog.
const files = import.meta.glob<string>('../content/products/*/product.json', {
  eager: true, query: '?raw', import: 'default',
});
const images = import.meta.glob<string>(
  '../content/products/*/*.{jpg,jpeg,png,webp,svg,JPG,JPEG,PNG,WEBP,SVG}',
  { eager: true, query: '?url', import: 'default' },
);
const warn = (message: string) => { if (import.meta.env.DEV) console.warn(message); };
const parsed: Record<string, unknown> = {};
for (const [path, json] of Object.entries(files)) {
  try { parsed[path] = JSON.parse(json); }
  catch { warn(`[${path}] Invalid JSON; skipping product.`); }
}
const products = normalizeProducts(parsed, images, placeholder, warn);

export const getProducts = () => products;
export const getProductBySlug = (slug: string) => products.find((product) => product.slug === slug);
