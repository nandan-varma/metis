"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ActivityLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const activityTypes = [
  { value: "running", label: "Running", caloriesPerMinute: 10 },
  { value: "walking", label: "Walking", caloriesPerMinute: 4 },
  { value: "cycling", label: "Cycling", caloriesPerMinute: 8 },
  { value: "swimming", label: "Swimming", caloriesPerMinute: 9 },
  { value: "weightlifting", label: "Weight Lifting", caloriesPerMinute: 6 },
  { value: "yoga", label: "Yoga", caloriesPerMinute: 3 },
  { value: "hiit", label: "HIIT", caloriesPerMinute: 12 },
  { value: "dancing", label: "Dancing", caloriesPerMinute: 7 },
  { value: "sports", label: "Sports", caloriesPerMinute: 8 },
  { value: "other", label: "Other", caloriesPerMinute: 5 },
];

export function ActivityLogDialog({ open, onOpenChange, onSuccess }: ActivityLogDialogProps) {
  const [loading, setLoading] = useState(false);
  const [activityType, setActivityType] = useState("running");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [manualCalories, setManualCalories] = useState("");

  const estimatedCalories = duration
    ? Math.round(
        parseFloat(duration) *
          (activityTypes.find((a) => a.value === activityType)?.caloriesPerMinute || 5)
      )
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/activity/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityType: activityTypes.find((a) => a.value === activityType)?.label || activityType,
          durationMinutes: parseInt(duration),
          caloriesBurned: manualCalories ? parseFloat(manualCalories) : estimatedCalories,
          notes: notes || null,
        }),
      });

      if (response.ok) {
        setActivityType("running");
        setDuration("");
        setNotes("");
        setManualCalories("");
        onSuccess();
      }
    } catch (error) {
      console.error("Error logging activity:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Activity</DialogTitle>
          <DialogDescription>
            Track your physical activities and calories burned
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="activityType">Activity Type</Label>
            <Select value={activityType} onValueChange={setActivityType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {activityTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes) *</Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
              placeholder="e.g., 30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manualCalories">
              Calories Burned (optional)
            </Label>
            <Input
              id="manualCalories"
              type="number"
              step="0.1"
              value={manualCalories}
              onChange={(e) => setManualCalories(e.target.value)}
              placeholder={`Estimated: ${estimatedCalories} cal`}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use estimated: {estimatedCalories} calories
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about your workout..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Logging..." : "Log Activity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
