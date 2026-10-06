import { EmptyState } from '../components/EmptyState';
import { ProductCard } from '../components/ProductCard';
import { getProducts } from '../data/products';

export function ProductsPage() {
  const products = getProducts();
  if (!products.length) return <EmptyState title="Pronto, nuevos artículos" message="Por ahora no hay artículos en el catálogo. Vuelve a visitarnos más adelante." />;
  return (
    <>
      <section className="catalog-intro"><span className="eyebrow">Una segunda vida, una buena compra</span><h1>Encuentra algo<br />para tu día a día.</h1><p>Explora los artículos, conoce sus detalles y conversemos por WhatsApp.</p></section>
      <div className="catalog-heading"><h2>El catálogo</h2><span>{products.length} {products.length === 1 ? 'artículo' : 'artículos'}</span></div>
      <div className="product-grid">{products.map(product => <ProductCard key={product.slug} product={product} />)}</div>
    </>
  );
}
