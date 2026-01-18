import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { waterIntake } from "@/lib/db/schema";
import { randomUUID } from "crypto";
import { eq, and, gte, lte, sum } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amountMl } = body;

    if (!amountMl || amountMl <= 0) {
      return NextResponse.json(
        { error: "Valid amount in ml is required" },
        { status: 400 }
      );
    }

    const id = randomUUID();
    const loggedAt = new Date();

    await db.insert(waterIntake).values({
      id,
      userId: session.user.id,
      amountMl,
      loggedAt,
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error logging water:", error);
    return NextResponse.json(
      { error: "Failed to log water intake" },
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
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await db
      .select({ total: sum(waterIntake.amountMl) })
      .from(waterIntake)
      .where(
        and(
          eq(waterIntake.userId, session.user.id),
          gte(waterIntake.loggedAt, startOfDay),
          lte(waterIntake.loggedAt, endOfDay)
        )
      );

    return NextResponse.json({
      total: Number(result[0]?.total) || 0,
      date,
    });
  } catch (error) {
    console.error("Error fetching water intake:", error);
    return NextResponse.json(
      { error: "Failed to fetch water intake" },
      { status: 500 }
    );
  }
}
