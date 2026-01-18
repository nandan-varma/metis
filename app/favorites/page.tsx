"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Favorite {
  id: string;
  barcode: string | null;
  product_name: string;
  brand: string | null;
  serving_size: string | null;
  serving_size_grams: number | null;
  calories: number;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fiber: number | null;
  sugar: number | null;
  created_at: string;
}

export default function FavoritesPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/signin");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) {
      fetchFavorites();
    }
  }, [session]);

  const fetchFavorites = async () => {
    try {
      const response = await fetch("/api/favorites");
      const data = await response.json();
      setFavorites(data.favorites || []);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLog = async (favorite: Favorite) => {
    try {
      await fetch("/api/food/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barcode: favorite.barcode,
          productName: favorite.product_name,
          brand: favorite.brand,
          servingSize: favorite.serving_size,
          servingSizeGrams: favorite.serving_size_grams,
          calories: favorite.calories,
          protein: favorite.protein,
          carbs: favorite.carbs,
          fat: favorite.fat,
          fiber: favorite.fiber,
          sugar: favorite.sugar,
        }),
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Error logging food:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/favorites?id=${id}`, { method: "DELETE" });
      fetchFavorites();
    } catch (error) {
      console.error("Error deleting favorite:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">⭐ Favorites</h1>
            <p className="text-sm text-muted-foreground">Your saved foods for quick logging</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="outline">← Back to Dashboard</Button>
            </Link>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {favorites.length > 0 ? (
          <div className="space-y-4">
            {favorites.map((favorite) => (
              <Card key={favorite.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{favorite.product_name}</h3>
                      {favorite.brand && (
                        <p className="text-sm text-muted-foreground">{favorite.brand}</p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        {favorite.serving_size || "100g"}
                      </p>
                      <div className="flex gap-4 mt-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Calories</p>
                          <p className="font-semibold">{favorite.calories.toFixed(0)}</p>
                        </div>
                        {favorite.protein !== null && (
                          <div>
                            <p className="text-xs text-muted-foreground">Protein</p>
                            <p className="font-semibold">{favorite.protein.toFixed(1)}g</p>
                          </div>
                        )}
                        {favorite.carbs !== null && (
                          <div>
                            <p className="text-xs text-muted-foreground">Carbs</p>
                            <p className="font-semibold">{favorite.carbs.toFixed(1)}g</p>
                          </div>
                        )}
                        {favorite.fat !== null && (
                          <div>
                            <p className="text-xs text-muted-foreground">Fat</p>
                            <p className="font-semibold">{favorite.fat.toFixed(1)}g</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button onClick={() => handleQuickLog(favorite)}>
                        ➕ Quick Log
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDelete(favorite.id)}
                      >
                        🗑️ Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <div className="text-5xl mb-4">⭐</div>
              <p className="text-lg font-semibold mb-2">No favorites yet</p>
              <p className="text-sm mb-4">
                Star foods from your food log to save them here for quick access
              </p>
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
