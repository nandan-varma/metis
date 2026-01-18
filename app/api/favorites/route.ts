import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { favorites } from "@/lib/db/schema";
import { randomUUID } from "crypto";
import { eq, and, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userFavorites = await db
      .select()
      .from(favorites)
      .where(eq(favorites.userId, session.user.id))
      .orderBy(desc(favorites.createdAt));

    return NextResponse.json({ favorites: userFavorites });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
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
      barcode,
      productName,
      brand,
      servingSize,
      servingSizeGrams,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sugar,
    } = body;

    if (!productName || !calories) {
      return NextResponse.json(
        { error: "Product name and calories are required" },
        { status: 400 }
      );
    }

    const id = randomUUID();

    await db.insert(favorites).values({
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
      fiber: fiber || null,
      sugar: sugar || null,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error adding favorite:", error);
    return NextResponse.json(
      { error: "Failed to add favorite" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Favorite ID is required" },
        { status: 400 }
      );
    }

    await db
      .delete(favorites)
      .where(and(eq(favorites.id, id), eq(favorites.userId, session.user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting favorite:", error);
    return NextResponse.json(
      { error: "Failed to delete favorite" },
      { status: 500 }
    );
  }
}
