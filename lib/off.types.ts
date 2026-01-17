// off.types.ts

export interface OffNutriments {
  energy_100g?: number;           // Energy in kJ per 100g
  'energy-kcal_100g'?: number;    // Energy in kcal per 100g
  fat_100g?: number;
  'saturated-fat_100g'?: number;
  carbohydrates_100g?: number;
  sugars_100g?: number;
  fiber_100g?: number;
  proteins_100g?: number;
  salt_100g?: number;
  sodium_100g?: number;
  [key: string]: number | string | undefined;
}

export interface OffProduct {
  code: string;                // barcode
  product_name?: string;
  brands?: string;
  nutriments?: OffNutriments;
  serving_size?: string;
  image_url?: string;          // product image
}

export interface OffProductResponse {
  code: string;
  status: 0 | 1;
  status_verbose: 'product found' | 'product not found' | string;
  product?: OffProduct;
}
