import { createSafeActionClient } from "next-safe-action";
import { auth } from "../config/auth";

export const safeAction = createSafeActionClient({
  handleServerError(e, utils) {
    const { clientInput, bindArgsClientInputs, metadata, ctx } = utils;

    console.error("Action error:", e.message);

    throw e;
  },
}).use(async ({ next }) => {
  const session = await auth();

  if (!session) {
    throw new Error("Session not found!");
  }

  const userId = session.user?.id;

  if (!userId) {
    throw new Error("Session is not valid!");
  }

  return next({ ctx: { userId } });
});

export const actionClient = createSafeActionClient();
