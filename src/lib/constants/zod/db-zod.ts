import { z } from "zod";

export const UpsertChatSchema = z.object({
  id: z.string().uuid().optional(),
  messages: z.any(),
  title: z.string().optional(),
});
