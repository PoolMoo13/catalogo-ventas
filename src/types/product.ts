export type ProductStatus = 'available' | 'reserved' | 'sold';

export interface Product {
  slug: string;
  name: string;
  price: number;
  description: string;
  condition?: string;
  status: ProductStatus;
  featuredImageUrl: string;
  imageUrls: string[];
}
