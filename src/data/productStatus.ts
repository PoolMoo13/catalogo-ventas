import type { ProductStatus } from '../types/product';

export const productStatus: Record<ProductStatus, { label: string; order: number; canContact: boolean }> = {
  available: { label: 'Disponible', order: 0, canContact: true },
  reserved: { label: 'Apartado', order: 1, canContact: true },
  sold: { label: 'Vendido', order: 2, canContact: false },
};
