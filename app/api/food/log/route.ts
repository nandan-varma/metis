import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { foodEntries } from "@/lib/db/schema";
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
    const {
      barcode,
      productName,
      brand,
      servingSize,
      servingSizeGrams,
      calories,
      protein,
      carbs,
      fat,
      saturatedFat,
      fiber,
      sugar,
      sodium,
      salt,
      mealType,
    } = body;

    if (!productName || calories === undefined) {
      return NextResponse.json(
        { error: "Product name and calories are required" },
        { status: 400 }
      );
    }

    const id = randomUUID();
    const loggedAt = new Date();

    await db.insert(foodEntries).values({
      id,
      userId: session.user.id,
      barcode: barcode || null,
      productName,
      brand: brand || null,
      servingSize: servingSize || null,
      servingSizeGrams: servingSizeGrams || null,
      calories,
      protein: protein || null,
      carbs: carbs || null,
      fat: fat || null,
      saturatedFat: saturatedFat || null,
      fiber: fiber || null,
      sugar: sugar || null,
      sodium: sodium || null,
      salt: salt || null,
      mealType: mealType || null,
      loggedAt,
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error logging food:", error);
    return NextResponse.json(
      { error: "Failed to log food entry" },
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
    const limit = parseInt(searchParams.get("limit") || "100");

    let conditions = [eq(foodEntries.userId, session.user.id)];

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      conditions.push(gte(foodEntries.loggedAt, startOfDay));
      conditions.push(lte(foodEntries.loggedAt, endOfDay));
    }

    const entries = await db
      .select()
      .from(foodEntries)
      .where(and(...conditions))
      .orderBy(desc(foodEntries.loggedAt))
      .limit(limit);

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Error fetching food entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch food entries" },
      { status: 500 }
    );
  }
}
