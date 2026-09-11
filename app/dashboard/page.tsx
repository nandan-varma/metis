"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  Camera,
  Plus,
  Activity as ActivityIcon,
  Droplet,
  Droplets,
  Flame,
  Beef,
  Wheat,
  Egg,
  Star,
  Target,
  Sunrise,
  SunMedium,
  Moon,
  Apple,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { BarcodeScanner } from "../BarcodeScanner";
import { OpenFoodFactsClient } from "@/lib/off.client";
import { normalizeNutrients100g } from "@/lib/nutrient-helpers";
import { ManualFoodEntry } from "./ManualFoodEntry";
import { ActivityLogDialog } from "./ActivityLogDialog";
import { WaterIntakeDialog } from "./WaterIntakeDialog";
import { AppHeader } from "@/components/app-header";
import { FullPageSpinner } from "@/components/full-page-spinner";
import { RadialStat } from "@/components/radial-stat";

const client = new OpenFoodFactsClient();

type MealType = "breakfast" | "lunch" | "dinner" | "snack" | null;

interface FoodLogEntry {
  id: string;
  barcode: string | null;
  productName: string;
  brand: string | null;
  servingSize: string | null;
  servingSizeGrams: number | null;
  calories: number;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fiber: number | null;
  sugar: number | null;
  mealType: MealType;
  loggedAt: string;
}

interface ActivityLogEntry {
  id: string;
  activityType: string;
  durationMinutes: number;
  caloriesBurned: number;
  notes: string | null;
  loggedAt: string;
}

interface DailySummary {
  entries: FoodLogEntry[];
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
  activities: ActivityLogEntry[];
  totalCaloriesBurned: number;
}

const MEAL_GROUPS: { key: NonNullable<MealType> | "unspecified"; label: string; icon: LucideIcon }[] = [
  { key: "breakfast", label: "Breakfast", icon: Sunrise },
  { key: "lunch", label: "Lunch", icon: SunMedium },
  { key: "dinner", label: "Dinner", icon: Moon },
  { key: "snack", label: "Snack", icon: Apple },
  { key: "unspecified", label: "Other", icon: UtensilsCrossed },
];

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

        fetchSummary();
      }
    } catch (error) {
      console.error("Error logging food:", error);
    }
  };

  const handleAddToFavorites = async (entry: FoodLogEntry) => {
    try {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barcode: entry.barcode,
          productName: entry.productName,
          brand: entry.brand,
          servingSize: entry.servingSize,
          servingSizeGrams: entry.servingSizeGrams,
          calories: entry.calories,
          protein: entry.protein,
          carbs: entry.carbs,
          fat: entry.fat,
          fiber: entry.fiber,
          sugar: entry.sugar,
        }),
      });
    } catch (error) {
      console.error("Error adding to favorites:", error);
    }
  };

  const groupedEntries = useMemo(() => {
    const groups: Record<string, FoodLogEntry[]> = {};
    for (const entry of summary?.entries ?? []) {
      const key = entry.mealType ?? "unspecified";
      groups[key] = groups[key] ?? [];
      groups[key].push(entry);
    }
    return groups;
  }, [summary?.entries]);

  if (isPending || loading) {
    return <FullPageSpinner />;
  }

  if (!session) {
    return null;
  }

  const totals = summary?.totals;
  const goal = summary?.goal;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Dashboard" description={`Welcome back, ${session.user.name}`} />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Date selector */}
        <div className="mb-6 space-y-1.5">
          <Label htmlFor="log-date">Date</Label>
          <input
            id="log-date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-background"
          />
        </div>

        {/* Daily Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <RadialStat
            label="Calories"
            icon={Flame}
            value={totals?.calories ?? 0}
            max={goal?.dailyCalories}
            unit="kcal"
            footer={
              summary && summary.totalCaloriesBurned > 0
                ? `Net ${(totals!.calories - summary.totalCaloriesBurned).toFixed(0)} kcal`
                : undefined
            }
          />
          <RadialStat
            label="Protein"
            icon={Beef}
            value={totals?.protein ?? 0}
            max={goal?.proteinGrams}
            unit="g"
            formatValue={(n) => n.toFixed(1)}
          />
          <RadialStat
            label="Carbs"
            icon={Wheat}
            value={totals?.carbs ?? 0}
            max={goal?.carbsGrams}
            unit="g"
            formatValue={(n) => n.toFixed(1)}
          />
          <RadialStat
            label="Fat"
            icon={Egg}
            value={totals?.fat ?? 0}
            max={goal?.fatGrams}
            unit="g"
            formatValue={(n) => n.toFixed(1)}
          />
          <RadialStat
            label="Water"
            icon={Droplets}
            value={(summary?.waterIntake ?? 0) / 1000}
            max={2}
            unit="L"
            formatValue={(n) => n.toFixed(1)}
          />
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button onClick={() => setShowScanner(true)}>
              <Camera className="size-4" aria-hidden="true" />
              Scan Barcode
            </Button>
            <Button variant="outline" onClick={() => setShowManualEntry(true)}>
              <Plus className="size-4" aria-hidden="true" />
              Add Food Manually
            </Button>
            <Button variant="outline" onClick={() => setShowActivityLog(true)}>
              <ActivityIcon className="size-4" aria-hidden="true" />
              Log Activity
            </Button>
            <Button variant="outline" onClick={() => setShowWaterDialog(true)}>
              <Droplet className="size-4" aria-hidden="true" />
              Add Water
            </Button>
          </CardContent>
        </Card>

        {/* Food Log */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Today&apos;s Food Log</CardTitle>
            <CardDescription>
              {summary?.entries.length || 0} items logged
            </CardDescription>
          </CardHeader>
          <CardContent>
            {summary?.entries && summary.entries.length > 0 ? (
              <div className="space-y-6">
                {MEAL_GROUPS.filter((group) => groupedEntries[group.key]?.length).map((group) => {
                  const GroupIcon = group.icon;
                  const groupEntries = groupedEntries[group.key];
                  const groupCalories = groupEntries.reduce((sum, e) => sum + e.calories, 0);

                  return (
                    <div key={group.key}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                          <GroupIcon className="size-4" aria-hidden="true" />
                          {group.label}
                        </div>
                        <span className="text-xs text-muted-foreground">{groupCalories.toFixed(0)} kcal</span>
                      </div>
                      <div className="space-y-3">
                        {groupEntries.map((entry) => (
                          <div
                            key={entry.id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="flex-1">
                              <h3 className="font-semibold">{entry.productName}</h3>
                              {entry.brand && (
                                <p className="text-sm text-muted-foreground">{entry.brand}</p>
                              )}
                              <p className="text-sm text-muted-foreground">
                                {entry.servingSize || "100g"} •{" "}
                                {new Date(entry.loggedAt).toLocaleTimeString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="font-mono font-bold tabular-nums">{entry.calories.toFixed(0)} cal</p>
                                <p className="text-sm text-muted-foreground">
                                  P: {entry.protein?.toFixed(1) || 0}g •{" "}
                                  C: {entry.carbs?.toFixed(1) || 0}g •{" "}
                                  F: {entry.fat?.toFixed(1) || 0}g
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleAddToFavorites(entry)}
                                aria-label={`Add ${entry.productName} to favorites`}
                              >
                                <Star className="size-4" aria-hidden="true" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
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
                {summary.activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{activity.activityType}</h3>
                      <p className="text-sm text-muted-foreground">
                        {activity.durationMinutes} minutes •{" "}
                        {new Date(activity.loggedAt).toLocaleTimeString()}
                      </p>
                      {activity.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{activity.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold tabular-nums text-primary">
                        -{activity.caloriesBurned.toFixed(0)} cal
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {!summary?.goal && (
          <Card className="mt-8 bg-accent">
            <CardContent className="pt-6 flex items-center gap-4">
              <Target className="size-5 shrink-0" aria-hidden="true" />
              <p className="flex-1">Set your daily calorie and macro goals to track your progress.</p>
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
