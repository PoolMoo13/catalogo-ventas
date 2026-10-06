import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom' });
after(() => server.close());
const { normalizeProducts } = await server.ssrLoadModule('/src/data/normalizeProducts.ts');
const { formatPrice } = await server.ssrLoadModule('/src/utils/currency.ts');
const { getWhatsAppUrl } = await server.ssrLoadModule('/src/utils/whatsapp.ts');
const root = '../content/products';
const valid = { name: 'Example', price: 1250, description: 'Details', status: 'available', featuredImage: '01.jpg', images: ['01.jpg', '02.webp'] };
const files = (product) => ({ [`${root}/example/product.json`]: product });
const images = { [`${root}/example/01.jpg`]: '/assets/one.jpg', [`${root}/example/02.webp`]: '/assets/two.webp' };
const normalize = (product, assets = images) => normalizeProducts(files(product), assets, '/fallback.svg', () => {});

test('resolves local images, derives slug and preserves gallery order', () => {
  const [product] = normalize(valid);
  assert.equal(product.slug, 'example');
  assert.equal(product.featuredImageUrl, '/assets/one.jpg');
  assert.deepEqual(product.imageUrls, ['/assets/one.jpg', '/assets/two.webp']);
});

test('rejects missing names, invalid prices and unknown statuses', () => {
  for (const value of [null, [], { ...valid, name: ' ' }, { ...valid, name: undefined },
    ...[undefined, '100', -1, NaN, Infinity].map(price => ({ ...valid, price })),
    { ...valid, status: 'unknown' }, { ...valid, status: undefined }]) {
    assert.deepEqual(normalize(value), []);
  }
  assert.equal(normalize({ ...valid, price: 0 })[0].price, 0);
});

test('missing images fall back gracefully without hiding the product', () => {
  assert.equal(normalize({ ...valid, featuredImage: 'missing.jpg' })[0].featuredImageUrl, '/assets/one.jpg');
  assert.deepEqual(normalize(valid, {})[0].imageUrls, ['/fallback.svg']);
  assert.deepEqual(normalize({ ...valid, images: ['missing.png', '02.webp', '02.webp'] })[0].imageUrls, ['/assets/two.webp', '/assets/one.jpg']);
  assert.deepEqual(normalize({ ...valid, images: null })[0].imageUrls, ['/assets/one.jpg']);
  assert.equal(normalize({ ...valid, featuredImage: '../other/01.jpg', images: [] })[0].featuredImageUrl, '/fallback.svg');
});

test('validation emits actionable warnings', () => {
  const warnings = [];
  normalizeProducts(files({ ...valid, featuredImage: 'missing.jpg' }), images, '/fallback.svg', message => warnings.push(message));
  assert.ok(warnings.some(message => message.includes('[products/example]') && message.includes('missing.jpg')));
});

test('sorts available, reserved and sold, then deterministically by slug', () => {
  const entries = Object.fromEntries([['z', 'sold'], ['b', 'available'], ['c', 'reserved'], ['a', 'available']]
    .map(([slug, status]) => [`${root}/${slug}/product.json`, { ...valid, status }]));
  assert.deepEqual(normalizeProducts(entries, {}, '/fallback.svg', () => {}).map(p => p.slug), ['a', 'b', 'c', 'z']);
});

test('formats MXN and builds encoded WhatsApp messages with the configured number', () => {
  assert.equal(formatPrice(18500), '$18,500');
  const name = 'Lámpara & mesa #1';
  const url = new URL(getWhatsAppUrl(name, '528261439244'));
  assert.equal(url.pathname, '/528261439244');
  assert.equal(url.searchParams.get('text'), `Hola, me interesa el ${name} que tienes en venta.`);
  assert.equal(new URL(getWhatsAppUrl(name, '+52 (826) 143-9244')).pathname, '/528261439244');
  assert.equal(getWhatsAppUrl(name, 'INVALID'), null);
  assert.equal(getWhatsAppUrl(name, ''), null);
});

test('Vite discovers new folders and real image extensions without a central list, and skips invalid JSON', async () => {
  const slug = `qa-autodiscovery-${process.pid}`;
  const directory = new URL(`../src/content/products/${slug}/`, import.meta.url);
  const broken = new URL(`../src/content/products/${slug}-broken/`, import.meta.url);
  const extensions = ['jpg', 'jpeg', 'png', 'webp'];
  try {
    await mkdir(directory);
    await mkdir(broken);
    await writeFile(new URL('product.json', directory), JSON.stringify({ ...valid, featuredImage: '01.png', images: extensions.map(ext => `01.${ext}`) }));
    await writeFile(new URL('product.json', broken), '{invalid json');
    for (const ext of extensions) await writeFile(new URL(`01.${ext}`, directory), 'local asset fixture');
    const { getProducts, getProductBySlug } = await server.ssrLoadModule('/src/data/products.ts');
    const product = getProductBySlug(slug);
    assert.ok(product);
    assert.equal(product.imageUrls.length, 4);
    assert.ok(product.imageUrls.every(url => typeof url === 'string' && url.length > 0));
    assert.equal(getProductBySlug(`${slug}-broken`), undefined);
    assert.ok(getProducts().length >= 3);
  } finally {
    await rm(directory, { recursive: true, force: true });
    await rm(broken, { recursive: true, force: true });
  }
});
