import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { todo } from "@/lib/db/schema/todo";
import { getI18n } from "@/lib/intl/server";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/lib/trpc/init";

export const todoRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const { t } = await getI18n(ctx.locale);
    console.log(t("ADMIN_DASHBOARD"));
    return await db.select().from(todo);
  }),
  create: protectedProcedure.input(z.object({ text: z.string().min(1) })).mutation(async ({ input }) => {
    return await db.insert(todo).values({
      text: input.text,
    });
  }),
  toggle: protectedProcedure.input(z.object({ id: z.number(), completed: z.boolean() })).mutation(async ({ input }) => {
    return await db.update(todo).set({ completed: input.completed }).where(eq(todo.id, input.id));
  }),
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    return await db.delete(todo).where(eq(todo.id, input.id));
  }),
});
