export type Variant = {
  sku: string;
  label: string;
  available: boolean;
  stock?: number;
  price: number;
};
export type Product = {
  sku: string;
  name: string;
  description: string;
  images: string[];
  category?: string;
  collections: string[];
  createdAt?: string;
  variants: Variant[];
  fabric?: string;
  fit?: string;
  sizeGuide?: string;
  featured?: boolean;
};
export type CartLine = {
  sku: string;
  quantity: number;
  name: string;
  image?: string;
  variant: string;
  price: number;
};
export const money = (paise: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100);
