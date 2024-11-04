"use server";
import { createScopedLogger } from "@/app/(root)/chat/_lib/utils/logger";
import { UpsertChatSchema } from "@/lib/constants/zod/db-zod";
import { safeAction } from "@/lib/utils/safe-action";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../config/drizzle";
import { chats } from "../schemas";

const logger = createScopedLogger("ChatHistory");

export const getAllChats = safeAction.action(async ({ ctx, parsedInput }) => {
  try {
    const allChats = await db.query.chats.findMany({
      where: eq(chats.userId, ctx.userId),
      orderBy: (chats, { desc }) => [desc(chats.createdAt)],
    });
    return allChats;
  } catch (error) {
    logger.error(error);
    throw error;
  }
});

export const upsertChat = safeAction
  .schema(UpsertChatSchema)
  .action(async ({ ctx, parsedInput }) => {
    try {
      await db
        .insert(chats)
        .values({
          ...parsedInput,
          userId: ctx.userId,
          messages: parsedInput.messages || [],
        })
        .onConflictDoUpdate({
          target: chats.id,
          set: { ...parsedInput },
        })
        .returning();
    } catch (error) {
      logger.error(error);
      throw error;
    }
  });

// Get messages by ID or URL ID
export const getChatById = safeAction
  .schema(z.string())
  .action(async ({ parsedInput }) => {
    try {
      const chatById = await db.query.chats.findFirst({
        where: eq(chats.id, parsedInput),
      });

      if (!chatById)
        throw new Error(`chat with this id ${parsedInput} is not found`);
      return chatById;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  });

export const deleteChat = safeAction
  .schema(z.string())
  .action(async ({ parsedInput }) => {
    try {
      await db.delete(chats).where(eq(chats.id, parsedInput));
    } catch (error) {
      logger.error(error);
      throw error;
    }
  });
