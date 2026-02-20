import { Hono } from "hono";
import { prisma } from "../prisma";
import { auth } from "../auth";

export const userRouter = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

// Delete user account
userRouter.delete("/delete-account", async (c) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    // Delete all user-related data
    // Delete sessions first (foreign key constraint)
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    // Delete accounts (OAuth/social connections)
    await prisma.account.deleteMany({
      where: { userId: user.id },
    });

    // Delete partner invites
    await prisma.partnerInvite.deleteMany({
      where: { creatorId: user.id },
    });

    // Delete partnerships
    await prisma.partnership.deleteMany({
      where: {
        OR: [
          { userId: user.id },
          { partnerId: user.id },
        ],
      },
    });

    // Delete shared cycle data
    await prisma.sharedCycleData.deleteMany({
      where: { userId: user.id },
    });

    // Delete mood entries
    await prisma.moodEntry.deleteMany({
      where: { userId: user.id },
    });

    // Finally, delete the user
    await prisma.user.delete({
      where: { id: user.id },
    });

    return c.json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    return c.json({ error: "Failed to delete account" }, 500);
  }
});
