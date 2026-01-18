"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

export default function GoalsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dailyCalories, setDailyCalories] = useState("");
  const [proteinGrams, setProteinGrams] = useState("");
  const [carbsGrams, setCarbsGrams] = useState("");
  const [fatGrams, setFatGrams] = useState("");
  const [weightGoalKg, setWeightGoalKg] = useState("");
  const [currentWeightKg, setCurrentWeightKg] = useState("");
  const [activityLevel, setActivityLevel] = useState("sedentary");

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/signin");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) {
      fetchGoal();
    }
  }, [session]);

  const fetchGoal = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/goals");
      const data = await response.json();
      
      if (data.goal) {
        setDailyCalories(data.goal.dailyCalories?.toString() || "");
        setProteinGrams(data.goal.proteinGrams?.toString() || "");
        setCarbsGrams(data.goal.carbsGrams?.toString() || "");
        setFatGrams(data.goal.fatGrams?.toString() || "");
        setWeightGoalKg(data.goal.weightGoalKg?.toString() || "");
        setCurrentWeightKg(data.goal.currentWeightKg?.toString() || "");
        setActivityLevel(data.goal.activityLevel || "sedentary");
      }
    } catch (error) {
      console.error("Error fetching goal:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dailyCalories: parseInt(dailyCalories),
          proteinGrams: proteinGrams ? parseFloat(proteinGrams) : null,
          carbsGrams: carbsGrams ? parseFloat(carbsGrams) : null,
          fatGrams: fatGrams ? parseFloat(fatGrams) : null,
          weightGoalKg: weightGoalKg ? parseFloat(weightGoalKg) : null,
          currentWeightKg: currentWeightKg ? parseFloat(currentWeightKg) : null,
          activityLevel,
        }),
      });

      if (response.ok) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error saving goal:", error);
    } finally {
      setSaving(false);
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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">⚙️ Goals & Settings</h1>
          <Link href="/dashboard">
            <Button variant="outline">← Back to Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Set Your Daily Goals</CardTitle>
            <CardDescription>
              Configure your daily calorie and macro targets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="dailyCalories">Daily Calorie Target *</Label>
                <Input
                  id="dailyCalories"
                  type="number"
                  value={dailyCalories}
                  onChange={(e) => setDailyCalories(e.target.value)}
                  required
                  placeholder="2000"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="proteinGrams">Protein (g)</Label>
                  <Input
                    id="proteinGrams"
                    type="number"
                    step="0.1"
                    value={proteinGrams}
                    onChange={(e) => setProteinGrams(e.target.value)}
                    placeholder="150"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carbsGrams">Carbs (g)</Label>
                  <Input
                    id="carbsGrams"
                    type="number"
                    step="0.1"
                    value={carbsGrams}
                    onChange={(e) => setCarbsGrams(e.target.value)}
                    placeholder="200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fatGrams">Fat (g)</Label>
                  <Input
                    id="fatGrams"
                    type="number"
                    step="0.1"
                    value={fatGrams}
                    onChange={(e) => setFatGrams(e.target.value)}
                    placeholder="70"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="activityLevel">Activity Level</Label>
                <Select value={activityLevel} onValueChange={setActivityLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
                    <SelectItem value="light">Light (exercise 1-3 days/week)</SelectItem>
                    <SelectItem value="moderate">Moderate (exercise 3-5 days/week)</SelectItem>
                    <SelectItem value="active">Active (exercise 6-7 days/week)</SelectItem>
                    <SelectItem value="very_active">Very Active (intense exercise daily)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentWeightKg">Current Weight (kg)</Label>
                  <Input
                    id="currentWeightKg"
                    type="number"
                    step="0.1"
                    value={currentWeightKg}
                    onChange={(e) => setCurrentWeightKg(e.target.value)}
                    placeholder="70.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weightGoalKg">Goal Weight (kg)</Label>
                  <Input
                    id="weightGoalKg"
                    type="number"
                    step="0.1"
                    value={weightGoalKg}
                    onChange={(e) => setWeightGoalKg(e.target.value)}
                    placeholder="65.0"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? "Saving..." : "Save Goals"}
                </Button>
                <Link href="/dashboard">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• A common macro split is 40% carbs, 30% protein, 30% fat</p>
            <p>• For weight loss, aim for a 500 calorie deficit per day</p>
            <p>• For muscle gain, aim for a 200-300 calorie surplus</p>
            <p>• Protein recommendation: 1.6-2.2g per kg of body weight</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
