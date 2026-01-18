import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./db/schema";

const sqlite = new Database(process.env.DB_FILE_NAME || "database.sqlite");

export const db = drizzle(sqlite, { schema });

// Re-export types from schema
export type {
  User,
  Session,
  FoodEntry,
  InsertFoodEntry,
  CustomFood,
  InsertCustomFood,
  Goal,
  InsertGoal,
  Activity,
  InsertActivity,
  Favorite,
  WaterIntake,
  Streak,
} from "./db/schema";
