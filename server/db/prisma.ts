import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../prisma/generated/client.js";
import { env } from "../common/env.server";

const adapter = new PrismaPg({
  connectionString: env.databaseUrl,
});

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma = globalThis.__prisma || new PrismaClient({ adapter });

if (!env.isProduction) {
  globalThis.__prisma = prisma;
}
