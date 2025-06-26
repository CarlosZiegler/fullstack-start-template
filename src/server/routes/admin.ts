import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/lib/trpc/init";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

// Type for user from database
type DbUser = typeof user.$inferSelect;

// Admin router with role checking in each procedure
export const adminRouter = createTRPCRouter({
  // Only admins can access this
  getSystemStats: protectedProcedure.query(async ({ ctx }) => {
    // Check if user is admin
    if (!ctx.session || ctx.session.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin access required",
      });
    }

    const totalUsers = await db.select().from(user);
    const adminUsers = totalUsers.filter((u: DbUser) => u.role === "admin");
    
    return {
      totalUsers: totalUsers.length,
      adminUsers: adminUsers.length,
      regularUsers: totalUsers.length - adminUsers.length,
    };
  }),
  
  // Only admins can delete users
  deleteUser: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (!ctx.session || ctx.session.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }

      return await db.delete(user).where(eq(user.id, input.userId));
    }),
  
  // Example: Only moderators or admins can access this
  getModerationQueue: protectedProcedure.query(async ({ ctx }) => {
    // Check if user has moderator or admin role
    if (!ctx.session) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Not authenticated",
      });
    }
    
    const userRole = ctx.session.user.role;
    if (userRole !== "moderator" && userRole !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Moderator access required",
      });
    }

    // Moderator-specific logic here
    return {
      pendingItems: [] as Array<unknown>,
      flaggedUsers: [] as Array<unknown>,
    };
  }),
});