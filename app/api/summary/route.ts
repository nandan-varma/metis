import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { foodEntries, goals, waterIntake, activities } from "@/lib/db/schema";
import { eq, and, gte, lte, desc, sum } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get food entries for the day
    const entries = await db
      .select()
      .from(foodEntries)
      .where(
        and(
          eq(foodEntries.userId, session.user.id),
          gte(foodEntries.loggedAt, startOfDay),
          lte(foodEntries.loggedAt, endOfDay)
        )
      )
      .orderBy(desc(foodEntries.loggedAt));

    // Calculate totals
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
    };

    entries.forEach((entry) => {
      totals.calories += entry.calories || 0;
      totals.protein += entry.protein || 0;
      totals.carbs += entry.carbs || 0;
      totals.fat += entry.fat || 0;
      totals.fiber += entry.fiber || 0;
    });

    // Get goal
    const goalResult = await db
      .select()
      .from(goals)
      .where(eq(goals.userId, session.user.id))
      .limit(1);

    // Get water intake
    const waterResult = await db
      .select({ total: sum(waterIntake.amountMl) })
      .from(waterIntake)
      .where(
        and(
          eq(waterIntake.userId, session.user.id),
          gte(waterIntake.loggedAt, startOfDay),
          lte(waterIntake.loggedAt, endOfDay)
        )
      );

    // Get activities
    const activitiesList = await db
      .select()
      .from(activities)
      .where(
        and(
          eq(activities.userId, session.user.id),
          gte(activities.loggedAt, startOfDay),
          lte(activities.loggedAt, endOfDay)
        )
      )
      .orderBy(desc(activities.loggedAt));

    const totalCaloriesBurned = activitiesList.reduce(
      (sum, activity) => sum + (activity.caloriesBurned || 0),
      0
    );

    return NextResponse.json({
      entries,
      totals,
      goal: goalResult[0] || null,
      waterIntake: Number(waterResult[0]?.total) || 0,
      activities: activitiesList,
      totalCaloriesBurned,
    });
  } catch (error) {
    console.error("Error fetching summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch summary" },
      { status: 500 }
    );
  }
}
