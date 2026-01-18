import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { goals } from "@/lib/db/schema";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const goal = await db
      .select()
      .from(goals)
      .where(eq(goals.userId, session.user.id))
      .limit(1);

    return NextResponse.json({ goal: goal[0] || null });
  } catch (error) {
    console.error("Error fetching goal:", error);
    return NextResponse.json(
      { error: "Failed to fetch goal" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      dailyCalories,
      proteinGrams,
      carbsGrams,
      fatGrams,
      weightGoalKg,
      currentWeightKg,
      activityLevel,
    } = body;

    if (!dailyCalories) {
      return NextResponse.json(
        { error: "Daily calories is required" },
        { status: 400 }
      );
    }

    const existingGoal = await db
      .select({ id: goals.id })
      .from(goals)
      .where(eq(goals.userId, session.user.id))
      .limit(1);

    const updatedAt = new Date();

    if (existingGoal.length > 0) {
      // Update existing goal
      await db
        .update(goals)
        .set({
          dailyCalories,
          proteinGrams: proteinGrams || null,
          carbsGrams: carbsGrams || null,
          fatGrams: fatGrams || null,
          weightGoalKg: weightGoalKg || null,
          currentWeightKg: currentWeightKg || null,
          activityLevel: activityLevel || "sedentary",
          updatedAt,
        })
        .where(eq(goals.userId, session.user.id));

      return NextResponse.json({ success: true, id: existingGoal[0].id });
    } else {
      // Create new goal
      const id = randomUUID();
      await db.insert(goals).values({
        id,
        userId: session.user.id,
        dailyCalories,
        proteinGrams: proteinGrams || null,
        carbsGrams: carbsGrams || null,
        fatGrams: fatGrams || null,
        weightGoalKg: weightGoalKg || null,
        currentWeightKg: currentWeightKg || null,
        activityLevel: activityLevel || "sedentary",
        updatedAt,
      });

      return NextResponse.json({ success: true, id });
    }
  } catch (error) {
    console.error("Error saving goal:", error);
    return NextResponse.json(
      { error: "Failed to save goal" },
      { status: 500 }
    );
  }
}
