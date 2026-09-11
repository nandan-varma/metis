'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Camera,
  Target,
  Droplets,
  Star,
  Zap,
  Egg,
  Wheat,
  Candy,
  Leaf,
  Beef,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { OpenFoodFactsClient } from '@/lib/off.client';
import { normalizeNutrients100g } from '@/lib/nutrient-helpers';
import type { OffProduct } from '@/lib/off.types';
import { BarcodeScanner } from './BarcodeScanner';
import { useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/theme-toggle';
import { FullPageSpinner } from '@/components/full-page-spinner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const client = new OpenFoodFactsClient();

const features: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Camera,
    title: 'Scan any barcode',
    description:
      'Point your camera at a product and get instant, accurate nutrition facts sourced from Open Food Facts.',
  },
  {
    icon: Target,
    title: 'Personalized goals',
    description:
      'Set daily calorie and macro targets tailored to your activity level and weight goals.',
  },
  {
    icon: Droplets,
    title: 'Water & activity tracking',
    description:
      'Log workouts and water intake alongside your meals to see the full picture of your day.',
  },
  {
    icon: Star,
    title: 'One-tap favorites',
    description:
      'Save foods you eat often and log them again with a single tap — no re-entering data.',
  },
];

const steps = [
  { title: 'Create your account', description: 'Sign up free in under a minute — no credit card required.' },
  { title: 'Set your goals', description: 'Tell us your daily calorie and macro targets, or use our suggested defaults.' },
  { title: 'Scan and log', description: 'Scan barcodes, log meals, water, and workouts as you go about your day.' },
];

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

  if (isPending || session) {
    return <FullPageSpinner />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight">Metis</span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/signin">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up Free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b bg-linear-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 py-16 sm:py-24 text-center max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Track your nutrition without the busywork
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Scan a barcode, log a meal, and see your calories and macros update instantly.
            Metis makes calorie tracking fast enough that you&apos;ll actually stick with it.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started — It&apos;s Free
              </Button>
            </Link>
            <a href="#try-it" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Try a Barcode Lookup
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16 max-w-5xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
          Everything you need, nothing you don&apos;t
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardContent className="pt-6">
                <feature.icon className="size-6 text-primary mb-3" aria-hidden="true" />
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y bg-muted/30">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-mono font-bold">
                  {i + 1}
                </div>
                <h3 className="font-semibold mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live demo */}
      <section id="try-it" className="container mx-auto px-4 py-16 max-w-2xl scroll-mt-16">
        <Card className="p-4 sm:p-6 md:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-1">
            Try a barcode lookup
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            No account needed — see the nutrition data Metis pulls in automatically.
          </p>

          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex flex-col gap-3">
              <Label htmlFor="barcode-input" className="sr-only">
                Barcode
              </Label>
              <Input
                id="barcode-input"
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Enter barcode (e.g., 3017624010701)"
                className="h-auto px-4 py-3 text-base"
                disabled={loading}
              />
              <div className="flex gap-2 sm:gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowScanner(true)}
                  disabled={loading}
                  className="flex-1"
                >
                  <Camera className="size-4" aria-hidden="true" />
                  Scan
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </div>
          </form>

          {error && (
            <div className="bg-destructive/10 border-l-4 border-destructive p-4 mb-6 rounded">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {product && (
            <div className="space-y-6">
              <div className="rounded-xl bg-muted/50 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                  {product.image_url && (
                    <Image
                      src={product.image_url}
                      alt={product.product_name || 'Product image'}
                      width={96}
                      height={96}
                      unoptimized
                      className="w-24 h-24 object-contain rounded-lg bg-white p-2 mx-auto sm:mx-0"
                    />
                  )}
                  <div className="flex-1 w-full">
                    <h3 className="text-xl font-bold mb-2">
                      {product.product_name || 'Unknown Product'}
                    </h3>
                    {product.brands && (
                      <p className="text-muted-foreground text-sm mb-1">
                        <span className="font-semibold text-foreground">Brand:</span> {product.brands}
                      </p>
                    )}
                    {product.serving_size && (
                      <p className="text-muted-foreground text-sm">
                        <span className="font-semibold text-foreground">Serving size:</span> {product.serving_size}
                      </p>
                    )}
                    <p className="text-muted-foreground text-xs mt-2">Barcode: {product.code}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-bold mb-4">Nutritional Information (per 100g)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {nutrients.energyKcal !== undefined && (
                    <NutrientCard label="Energy" value={`${nutrients.energyKcal} kcal`} icon={Zap} />
                  )}
                  {nutrients.energyKj !== undefined && (
                    <NutrientCard label="Energy" value={`${nutrients.energyKj} kJ`} icon={Zap} />
                  )}
                  {nutrients.fat !== undefined && (
                    <NutrientCard label="Fat" value={`${nutrients.fat} g`} icon={Egg} />
                  )}
                  {nutrients.saturatedFat !== undefined && (
                    <NutrientCard label="Saturated Fat" value={`${nutrients.saturatedFat} g`} icon={Egg} />
                  )}
                  {nutrients.carbs !== undefined && (
                    <NutrientCard label="Carbohydrates" value={`${nutrients.carbs} g`} icon={Wheat} />
                  )}
                  {nutrients.sugars !== undefined && (
                    <NutrientCard label="Sugars" value={`${nutrients.sugars} g`} icon={Candy} />
                  )}
                  {nutrients.fiber !== undefined && (
                    <NutrientCard label="Fiber" value={`${nutrients.fiber} g`} icon={Leaf} />
                  )}
                  {nutrients.protein !== undefined && (
                    <NutrientCard label="Protein" value={`${nutrients.protein} g`} icon={Beef} />
                  )}
                  {nutrients.salt !== undefined && (
                    <NutrientCard label="Salt" value={`${nutrients.salt} g`} icon={Sparkles} />
                  )}
                  {nutrients.sodium !== undefined && (
                    <NutrientCard label="Sodium" value={`${nutrients.sodium} g`} icon={Sparkles} />
                  )}
                </div>
              </div>

              <div className="bg-primary/5 border-l-4 border-primary p-4 rounded">
                <p className="text-sm">
                  Data provided by{' '}
                  <a
                    href="https://world.openfoodfacts.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-semibold hover:text-primary"
                  >
                    Open Food Facts
                  </a>
                </p>
              </div>

              <div className="text-center">
                <Link href="/signup">
                  <Button>Sign up to save this to your log</Button>
                </Link>
              </div>
            </div>
          )}

          {!product && !error && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-base mb-3">Enter a barcode to get started</p>
              <p className="text-sm">
                Try example:{' '}
                <button
                  onClick={() => setBarcode('3017624010701')}
                  className="text-primary hover:underline font-semibold"
                >
                  3017624010701 (Nutella)
                </button>
              </p>
            </div>
          )}
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>
            Metis — nutrition data powered by{' '}
            <a
              href="https://world.openfoodfacts.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Open Food Facts
            </a>
          </p>
        </div>
      </footer>

      {showScanner && (
        <BarcodeScanner
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}

function NutrientCard({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
  return (
    <div className="bg-card border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2">
        <Icon className="size-5 text-primary shrink-0" aria-hidden="true" />
        <div>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">{label}</p>
          <p className="text-lg sm:text-xl font-mono font-bold tabular-nums">{value}</p>
        </div>
      </div>
    </div>
  );
}
