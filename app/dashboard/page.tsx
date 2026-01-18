"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { BarcodeScanner } from "../BarcodeScanner";
import { OpenFoodFactsClient } from "@/lib/off.client";
import { normalizeNutrients100g } from "@/lib/nutrient-helpers";
import { ManualFoodEntry } from "./ManualFoodEntry";
import { ActivityLogDialog } from "./ActivityLogDialog";
import { WaterIntakeDialog } from "./WaterIntakeDialog";

const client = new OpenFoodFactsClient();

interface DailySummary {
  entries: any[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  goal: {
    dailyCalories: number;
    proteinGrams?: number;
    carbsGrams?: number;
    fatGrams?: number;
  } | null;
  waterIntake: number;
  activities: any[];
  totalCaloriesBurned: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [showWaterDialog, setShowWaterDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/signin");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) {
      fetchSummary();
    }
  }, [session, selectedDate]);

  const fetchSummary = async () => {
    try {
      const response = await fetch(`/api/summary?date=${selectedDate}`);
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error("Error fetching summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScanSuccess = async (barcode: string) => {
    setShowScanner(false);
    try {
      const response = await client.getProductByBarcode(barcode);
      if (response.product) {
        const nutrients = normalizeNutrients100g(response.product.nutriments);
        
        // Log the food with 100g serving
        await fetch("/api/food/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            barcode,
            productName: response.product.product_name,
            brand: response.product.brands,
            servingSize: "100g",
            servingSizeGrams: 100,
            calories: nutrients.energyKcal || 0,
            protein: nutrients.protein,
            carbs: nutrients.carbs,
            fat: nutrients.fat,
            saturatedFat: nutrients.saturatedFat,
            fiber: nutrients.fiber,
            sugar: nutrients.sugars,
            sodium: nutrients.sodium,
            salt: nutrients.salt,
          }),
        });

        fetchSummary(); // Refresh the summary
      }
    } catch (error) {
      console.error("Error logging food:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const handleAddToFavorites = async (entry: any) => {
    try {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barcode: entry.barcode,
          productName: entry.product_name,
          brand: entry.brand,
          servingSize: entry.serving_size,
          servingSizeGrams: entry.serving_size_grams,
          calories: entry.calories,
          protein: entry.protein,
          carbs: entry.carbs,
          fat: entry.fat,
          fiber: entry.fiber,
          sugar: entry.sugar,
        }),
      });
      // TODO: Show success message
    } catch (error) {
      console.error("Error adding to favorites:", error);
    }
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

  const caloriesPercent = summary?.goal
    ? Math.min((summary.totals.calories / summary.goal.dailyCalories) * 100, 100)
    : 0;

  const proteinPercent = summary?.goal?.proteinGrams
    ? Math.min((summary.totals.protein / summary.goal.proteinGrams) * 100, 100)
    : 0;

  const carbsPercent = summary?.goal?.carbsGrams
    ? Math.min((summary.totals.carbs / summary.goal.carbsGrams) * 100, 100)
    : 0;

  const fatPercent = summary?.goal?.fatGrams
    ? Math.min((summary.totals.fat / summary.goal.fatGrams) * 100, 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">🥗 Metis</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {session.user.name}!</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/favorites">
              <Button variant="outline">⭐ Favorites</Button>
            </Link>
            <Link href="/goals">
              <Button variant="outline">⚙️ Goals</Button>
            </Link>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Date selector */}
        <div className="mb-6">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          />
        </div>

        {/* Daily Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Calories</CardDescription>
              <CardTitle className="text-3xl">
                {summary?.totals.calories.toFixed(0) || 0}
                <span className="text-sm text-muted-foreground font-normal">
                  {summary?.goal ? ` / ${summary.goal.dailyCalories}` : ""}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={caloriesPercent} className="h-2" />
              {summary && summary.totalCaloriesBurned > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Net: {(summary.totals.calories - summary.totalCaloriesBurned).toFixed(0)}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Protein</CardDescription>
              <CardTitle className="text-3xl">
                {summary?.totals.protein.toFixed(1) || 0}g
                <span className="text-sm text-muted-foreground font-normal">
                  {summary?.goal?.proteinGrams ? ` / ${summary.goal.proteinGrams}g` : ""}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={proteinPercent} className="h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Carbs</CardDescription>
              <CardTitle className="text-3xl">
                {summary?.totals.carbs.toFixed(1) || 0}g
                <span className="text-sm text-muted-foreground font-normal">
                  {summary?.goal?.carbsGrams ? ` / ${summary.goal.carbsGrams}g` : ""}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={carbsPercent} className="h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Fat</CardDescription>
              <CardTitle className="text-3xl">
                {summary?.totals.fat.toFixed(1) || 0}g
                <span className="text-sm text-muted-foreground font-normal">
                  {summary?.goal?.fatGrams ? ` / ${summary.goal.fatGrams}g` : ""}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={fatPercent} className="h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Water</CardDescription>
              <CardTitle className="text-3xl">
                {((summary?.waterIntake || 0) / 1000).toFixed(1)}L
                <span className="text-sm text-muted-foreground font-normal">
                  {" / 2.0L"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={Math.min(((summary?.waterIntake || 0) / 2000) * 100, 100)} className="h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button onClick={() => setShowScanner(true)}>
              📷 Scan Barcode
            </Button>
            <Button variant="outline" onClick={() => setShowManualEntry(true)}>
              ➕ Add Food Manually
            </Button>
            <Button variant="outline" onClick={() => setShowActivityLog(true)}>
              🏃 Log Activity
            </Button>
            <Button variant="outline" onClick={() => setShowWaterDialog(true)}>
              💧 Add Water
            </Button>
          </CardContent>
        </Card>

        {/* Food Log */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Today's Food Log</CardTitle>
            <CardDescription>
              {summary?.entries.length || 0} items logged
            </CardDescription>
          </CardHeader>
          <CardContent>
            {summary?.entries && summary.entries.length > 0 ? (
              <div className="space-y-4">
                {summary.entries.map((entry: any) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{entry.product_name}</h3>
                      {entry.brand && (
                        <p className="text-sm text-muted-foreground">{entry.brand}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {entry.serving_size || "100g"} • {" "}
                        {new Date(entry.logged_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold">{entry.calories.toFixed(0)} cal</p>
                        <p className="text-sm text-muted-foreground">
                          P: {entry.protein?.toFixed(1) || 0}g •{" "}
                          C: {entry.carbs?.toFixed(1) || 0}g •{" "}
                          F: {entry.fat?.toFixed(1) || 0}g
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddToFavorites(entry)}
                        className="text-xl hover:scale-110 transition-transform"
                      >
                        ⭐
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No food logged yet today</p>
                <p className="text-sm mt-2">Scan a barcode to get started!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activities */}
        {summary?.activities && summary.activities.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Activities</CardTitle>
              <CardDescription>
                {summary.activities.length} activities • {summary.totalCaloriesBurned.toFixed(0)} calories burned
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary.activities.map((activity: any) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{activity.activity_type}</h3>
                      <p className="text-sm text-muted-foreground">
                        {activity.duration_minutes} minutes • {" "}
                        {new Date(activity.logged_at).toLocaleTimeString()}
                      </p>
                      {activity.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{activity.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">-{activity.calories_burned.toFixed(0)} cal</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {!summary?.goal && (
          <Card className="mt-8 bg-accent">
            <CardContent className="pt-6">
              <p className="mb-4">
                ℹ️ Set your daily calorie and macro goals to track your progress!
              </p>
              <Link href="/goals">
                <Button>Set Goals</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>

      {showScanner && (
        <BarcodeScanner
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}

      <ManualFoodEntry
        open={showManualEntry}
        onOpenChange={setShowManualEntry}
        onSuccess={() => {
          fetchSummary();
          setShowManualEntry(false);
        }}
      />

      <ActivityLogDialog
        open={showActivityLog}
        onOpenChange={setShowActivityLog}
        onSuccess={() => {
          fetchSummary();
          setShowActivityLog(false);
        }}
      />

      <WaterIntakeDialog
        open={showWaterDialog}
        onOpenChange={setShowWaterDialog}
        currentIntake={summary?.waterIntake || 0}
        onSuccess={() => {
          fetchSummary();
        }}
      />
    </div>
  );
}
