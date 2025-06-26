import { auth } from "@/lib/auth/auth";
import { getCookie } from "@tanstack/react-start/server";
import { TRPCError, initTRPC } from "@trpc/server";
import * as Sentry from "@sentry/node";

import superjson from "superjson";
import { ZodError } from "zod";
import type { Language } from "../intl/i18n";

export const createTRPCContext = async (opts: {
  headers: Headers;
  req: Request;
}) => {
  const locale = (getCookie("i18next") as Language) || "en";
  const session = await auth.api.getSession({
    headers: opts.headers,
  });

  return {
    session,
    locale,
  };
};

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  // TODO: add transformer that can use formData split :)
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
  sse: {
    maxDurationMs: 5 * 60 * 1_000, // 5 minutes
    ping: {
      enabled: true,
      intervalMs: 3_000,
    },
    client: {
      reconnectAfterInactivityMs: 5_000,
    },
  },
});

export const createTRPCRouter = t.router;

const sentryMiddleware = t.middleware(
  Sentry.trpcMiddleware({
    attachRpcInput: true,
  }),
);


export const publicProcedure = t.procedure.use(sentryMiddleware);
export const protectedProcedure = t.procedure.use(sentryMiddleware).use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
      cause: "No session",
    });
  }
  return next();
});

/**
 * Create a router
 * @see https://trpc.io/docs/v11/router
 */
export const router = t.router;

/**
 * @see https://trpc.io/docs/v11/merging-routers
 */
export const mergeRouters = t.mergeRouters;
export const createCallerFactory = t.createCallerFactory;
