import { createTRPCRouter } from "@/lib/trpc/init";

import { resourcesRouter } from "./routes/resources";
import { todoRouter } from "./routes/todo";
import { publicRouter } from "./routes/public";
import { adminRouter } from "./routes/admin";

export const trpcRouter = createTRPCRouter({
  todo: todoRouter,
  resources: resourcesRouter,
  public: publicRouter,
  admin: adminRouter,
});

export type TRPCRouter = typeof trpcRouter;
