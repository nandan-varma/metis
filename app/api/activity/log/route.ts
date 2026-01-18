import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { activities } from "@/lib/db/schema";
import { randomUUID } from "crypto";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { activityType, durationMinutes, caloriesBurned, notes } = body;

    if (!activityType || !durationMinutes || caloriesBurned === undefined) {
      return NextResponse.json(
        { error: "Activity type, duration, and calories burned are required" },
        { status: 400 }
      );
    }

    const id = randomUUID();
    const loggedAt = new Date();

    await db.insert(activities).values({
      id,
      userId: session.user.id,
      activityType,
      durationMinutes,
      caloriesBurned,
      notes: notes || null,
      loggedAt,
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error logging activity:", error);
    return NextResponse.json(
      { error: "Failed to log activity" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const limit = parseInt(searchParams.get("limit") || "50");

    let conditions = [eq(activities.userId, session.user.id)];

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      conditions.push(gte(activities.loggedAt, startOfDay));
      conditions.push(lte(activities.loggedAt, endOfDay));
    }

    const activityList = await db
      .select()
      .from(activities)
      .where(and(...conditions))
      .orderBy(desc(activities.loggedAt))
      .limit(limit);

    return NextResponse.json({ activities: activityList });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
