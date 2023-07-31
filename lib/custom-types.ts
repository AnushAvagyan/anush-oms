export interface Product {
  id: string;
  name: string;
  status?: string;
  description?: string;
  price: number | string;
  inventory: number | string;
  quantity?: number | string;
  category?: string;
  categoryId?: string;
  created?: string;
  updated?: string;
}

export type CreateProduct = Omit<Product, 'id'>;

export interface Order {
  id?: string;
  status: string;
  products: Product[];
  created?: string;
  updated?: string;
  trackingCompany?: string;
  trackingNumber?: string;
}

export interface CreateUpdateOrder {
  id?: string;
  status?: string;
  shipping?: {
    trackingCompany?: string;
    trackingNumber?: number | string;
  };
}
