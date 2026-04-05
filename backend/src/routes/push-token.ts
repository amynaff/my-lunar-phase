import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { prisma } from "../prisma";
import { auth } from "../auth";

export const pushTokenRouter = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

// Register or update push token for the authenticated user
pushTokenRouter.post(
  "/",
  zValidator("json", z.object({ token: z.string().min(1) })),
  async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const { token } = c.req.valid("json");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        pushToken: token,
        pushTokenUpdatedAt: new Date(),
      },
    });

    return c.json({ success: true });
  }
);

// Remove push token (on logout or notification opt-out)
pushTokenRouter.delete("/", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      pushToken: null,
      pushTokenUpdatedAt: new Date(),
    },
  });

  return c.json({ success: true });
});
