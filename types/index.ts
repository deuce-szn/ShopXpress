// Export Prisma types
import { Product as PrismaProduct } from '@prisma/client';

// Product type with extended fields (price and rating as strings)
export type Product = Omit<PrismaProduct, 'price' | 'rating'> & {
  price: string;
  rating: string;
};
