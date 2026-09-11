"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Droplet, GlassWater, CupSoda } from "lucide-react";

interface WaterIntakeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  currentIntake: number; // in ml
}

const presetAmounts = [
  { ml: 250, label: "1 Glass", icon: GlassWater },
  { ml: 500, label: "1 Bottle", icon: CupSoda },
  { ml: 1000, label: "1 Liter", icon: Droplet },
];

export function WaterIntakeDialog({ open, onOpenChange, onSuccess, currentIntake }: WaterIntakeDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleAddWater = async (amountMl: number) => {
    setLoading(true);
    try {
      const response = await fetch("/api/water/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountMl }),
      });

      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error logging water:", error);
    } finally {
      setLoading(false);
    }
  };

  const dailyGoal = 2000; // 2 liters
  const progress = Math.min((currentIntake / dailyGoal) * 100, 100);
  const glassesCount = Math.floor(currentIntake / 250);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Water Intake</DialogTitle>
          <DialogDescription>
            Track your daily water consumption
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Progress */}
          <Card className="p-6">
            <div className="text-center space-y-4">
              <div className="text-5xl font-mono font-bold tabular-nums text-primary">
                {(currentIntake / 1000).toFixed(1)}L
              </div>
              <p className="text-sm text-muted-foreground">
                {currentIntake}ml / {dailyGoal}ml
              </p>
              <div className="w-full bg-secondary h-3 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-center gap-1.5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Droplet
                    key={i}
                    className={i < glassesCount ? "size-5 fill-primary text-primary" : "size-5 text-muted-foreground/40"}
                    aria-hidden="true"
                  />
                ))}
              </div>
            </div>
          </Card>

          {/* Quick Add Buttons */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Quick Add</p>
            <div className="grid grid-cols-3 gap-2">
              {presetAmounts.map((preset) => (
                <Button
                  key={preset.ml}
                  variant="outline"
                  onClick={() => handleAddWater(preset.ml)}
                  disabled={loading}
                  className="h-auto py-4 flex flex-col gap-2"
                >
                  <preset.icon className="size-6" aria-hidden="true" />
                  <span className="text-xs">{preset.label}</span>
                  <span className="text-xs text-muted-foreground">{preset.ml}ml</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="text-center">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
