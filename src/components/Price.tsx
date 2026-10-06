import { formatPrice } from '../utils/currency';

export function Price({ value }: { value: number }) {
  return <span className="price">{formatPrice(value)} <span className="currency">MXN</span></span>;
}
