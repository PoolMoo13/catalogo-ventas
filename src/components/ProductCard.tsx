import { Link } from 'react-router-dom';
import type { Product } from '../types/product';
import { Price } from './Price';
import { Status } from './Status';

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link className={`product-card product-card-${product.status}`} to={`/product/${encodeURIComponent(product.slug)}`}>
      <div className="card-photo"><img src={product.featuredImageUrl} alt={product.name} loading="lazy" decoding="async" width="800" height="640" /><Status status={product.status} /></div>
      <div className="card-content">
        <h3>{product.name}</h3>
        {product.condition && <p>{product.condition}</p>}
        <div className="card-bottom"><Price value={product.price} /><span className="card-arrow" aria-hidden="true">↗</span></div>
      </div>
    </Link>
  );
}
