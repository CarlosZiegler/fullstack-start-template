import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth";
import {
  createTRPCRouter,
  adminProcedure,
  createRoleProcedure,
} from "@/lib/trpc/init";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Example of using role-based procedures
export const adminRouter = createTRPCRouter({
  // Only admins can access this
  getSystemStats: adminProcedure.query(async () => {
    const totalUsers = await db.select().from(user);
    const adminUsers = totalUsers.filter(u => u.role === "admin");
    
    return {
      totalUsers: totalUsers.length,
      adminUsers: adminUsers.length,
      regularUsers: totalUsers.length - adminUsers.length,
    };
  }),
  
  // Only admins can delete users
  deleteUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input }) => {
      return await db.delete(user).where(eq(user.id, input.userId));
    }),
  
  // Example: Only moderators or admins can access this
  // You can create custom role procedures like this:
  getModerationQueue: createRoleProcedure("moderator")
    .query(async () => {
      // Moderator-specific logic here
      return {
        pendingItems: [],
        flaggedUsers: [],
      };
    }),
});