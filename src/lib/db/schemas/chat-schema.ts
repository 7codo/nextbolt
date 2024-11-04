import { Message } from "ai";
import {
  json,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./auth-schema";
import { relations } from "drizzle-orm";

export const chats = pgTable("chats", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  title: text("title"),
  messages: json("messages").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Chat = typeof chats.$inferSelect;

export const chatsRelation = relations(chats, ({ one }) => ({
  user: one(users, {
    fields: [chats.userId],
    references: [users.id],
  }),
}));
