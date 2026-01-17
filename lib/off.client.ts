// off.client.ts

const OFF_BASE_URL = 'https://world.openfoodfacts.net/api/v2';

import type { OffProductResponse } from './off.types';

export class OpenFoodFactsClient {
  constructor(private readonly baseUrl: string = OFF_BASE_URL) {}

  async getProductByBarcode(
    barcode: string,
    fields: string[] = [
      'code',
      'product_name',
      'brands',
      'nutriments',
      'serving_size',
      'image_url',
    ],
  ): Promise<OffProductResponse> {
    const params = new URLSearchParams({
      fields: fields.join(','),
    });

    const url = `${this.baseUrl}/product/${encodeURIComponent(
      barcode,
    )}?${params.toString()}`;

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Open Food Facts request failed: ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as OffProductResponse;

    if (data.status !== 1 || !data.product) {
      throw new Error(`Product not found for barcode ${barcode}`);
    }

    return data;
  }
}
