import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/lib/db/schemas/index";

config({ path: ".env.local" }); // or

export const db = drizzle(process.env.DATABASE_URL!, {
  schema,
});
