import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@/lib/env.server";
import * as schema from "./schema";

const sql = neon(env.DATABASE_URL || "");

export const db = drizzle({
  schema,
  client: sql,
});

export type DB = typeof db;
