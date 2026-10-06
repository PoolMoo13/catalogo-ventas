import { productStatus } from '../data/productStatus';
import type { ProductStatus } from '../types/product';

export function Status({ status }: { status: ProductStatus }) {
  return <span className={`status status-${status}`}><span aria-hidden="true" />{productStatus[status].label}</span>;
}
