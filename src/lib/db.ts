//  @ts-nocheck
import { PrismaClient } from "@prisma/client";

// Singleton pattern for Prisma Client
const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  // This declares a global variable for Prisma to prevent multiple instances
  var prisma: PrismaClient | undefined;
}

// Use the existing instance in the global scope or create a new one
const db = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  // In non-production environments, prevent multiple instances of Prisma Client
  globalThis.prisma = db;
}

export default db;
