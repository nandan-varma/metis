'use client';

import { useState, useEffect } from 'react';
import { OpenFoodFactsClient } from '@/lib/off.client';
import { normalizeNutrients100g } from '@/lib/nutrient-helpers';
import type { OffProduct } from '@/lib/off.types';
import { BarcodeScanner } from './BarcodeScanner';
import { useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const client = new OpenFoodFactsClient();

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [barcode, setBarcode] = useState('');
  const [product, setProduct] = useState<OffProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    if (!isPending && session) {
      router.push('/dashboard');
    }
  }, [session, isPending, router]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!barcode.trim()) {
      setError('Please enter a barcode');
      return;
    }

    setLoading(true);
    setError(null);
    setProduct(null);

    try {
      const response = await client.getProductByBarcode(barcode.trim());
      setProduct(response.product || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  const handleScanSuccess = async (decodedText: string) => {
    setShowScanner(false);
    setBarcode(decodedText);
    setLoading(true);
    setError(null);
    setProduct(null);

    try {
      const response = await client.getProductByBarcode(decodedText);
      setProduct(response.product || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  const nutrients = normalizeNutrients100g(product?.nutriments);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-blue-50 p-3 sm:p-4 md:p-8">
      <main className="max-w-4xl mx-auto">
        <Card className="bg-card rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8">
          <div className="flex justify-end gap-2 mb-4">
            <Link href="/signin">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 text-center">
            🥗 Metis - Calorie Tracker
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground text-center mb-6 sm:mb-8">
            Track your nutrition, reach your goals
          </p>

          <form onSubmit={handleSearch} className="mb-6 sm:mb-8">
            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Enter barcode (e.g., 3017624010701)"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-input rounded-lg focus:outline-none focus:border-primary text-base sm:text-lg bg-background"
                disabled={loading}
              />
              <div className="flex gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  disabled={loading}
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 justify-center text-sm sm:text-base"
                >
                  📷 Scan
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 sm:px-8 py-2.5 sm:py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {product && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-linear-to-r from-green-50 to-blue-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.product_name || 'Product'}
                      className="w-24 h-24 sm:w-32 sm:h-32 object-contain rounded-lg bg-white p-2 mx-auto sm:mx-0"
                    />
                  )}
                  <div className="flex-1 w-full">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                      {product.product_name || 'Unknown Product'}
                    </h2>
                    {product.brands && (
                      <p className="text-gray-600 text-sm sm:text-lg mb-1">
                        <span className="font-semibold">Brand:</span> {product.brands}
                      </p>
                    )}
                    {product.serving_size && (
                      <p className="text-gray-600 text-sm sm:text-base">
                        <span className="font-semibold">Serving size:</span> {product.serving_size}
                      </p>
                    )}
                    <p className="text-gray-500 text-xs sm:text-sm mt-2">
                      Barcode: {product.code}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t-2 border-gray-200 pt-4 sm:pt-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
                  Nutritional Information (per 100g)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {nutrients.energyKcal !== undefined && (
                    <NutrientCard
                      label="Energy"
                      value={`${nutrients.energyKcal} kcal`}
                      icon="⚡"
                    />
                  )}
                  {nutrients.energyKj !== undefined && (
                    <NutrientCard
                      label="Energy"
                      value={`${nutrients.energyKj} kJ`}
                      icon="⚡"
                    />
                  )}
                  {nutrients.fat !== undefined && (
                    <NutrientCard
                      label="Fat"
                      value={`${nutrients.fat} g`}
                      icon="🧈"
                    />
                  )}
                  {nutrients.saturatedFat !== undefined && (
                    <NutrientCard
                      label="Saturated Fat"
                      value={`${nutrients.saturatedFat} g`}
                      icon="🧈"
                    />
                  )}
                  {nutrients.carbs !== undefined && (
                    <NutrientCard
                      label="Carbohydrates"
                      value={`${nutrients.carbs} g`}
                      icon="🌾"
                    />
                  )}
                  {nutrients.sugars !== undefined && (
                    <NutrientCard
                      label="Sugars"
                      value={`${nutrients.sugars} g`}
                      icon="🍯"
                    />
                  )}
                  {nutrients.fiber !== undefined && (
                    <NutrientCard
                      label="Fiber"
                      value={`${nutrients.fiber} g`}
                      icon="🌿"
                    />
                  )}
                  {nutrients.protein !== undefined && (
                    <NutrientCard
                      label="Protein"
                      value={`${nutrients.protein} g`}
                      icon="💪"
                    />
                  )}
                  {nutrients.salt !== undefined && (
                    <NutrientCard
                      label="Salt"
                      value={`${nutrients.salt} g`}
                      icon="🧂"
                    />
                  )}
                  {nutrients.sodium !== undefined && (
                    <NutrientCard
                      label="Sodium"
                      value={`${nutrients.sodium} g`}
                      icon="🧂"
                    />
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-blue-800">
                  Data provided by{' '}
                  <a
                    href="https://world.openfoodfacts.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-semibold hover:text-blue-900"
                  >
                    Open Food Facts
                  </a>
                </p>
              </div>
            </div>
          )}

          {!product && !error && !loading && (
            <div className="text-center py-8 sm:py-12 text-gray-500">
              <p className="text-base sm:text-lg mb-3 sm:mb-4">👆 Enter a barcode to get started</p>
              <p className="text-xs sm:text-sm">
                Try example: <button
                  onClick={() => setBarcode('3017624010701')}
                  className="text-green-600 hover:text-green-700 font-semibold underline"
                >
                  3017624010701 (Nutella)
                </button>
              </p>
            </div>
          )}
        </Card>
      </main>

      {showScanner && (
        <BarcodeScanner
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}

function NutrientCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2">
        <span className="text-xl sm:text-2xl">{icon}</span>
        <div>
          <p className="text-xs sm:text-sm text-gray-600 font-medium">{label}</p>
          <p className="text-lg sm:text-xl font-bold text-gray-800">{value}</p>
        </div>
      </div>
    </div>
  );
}
