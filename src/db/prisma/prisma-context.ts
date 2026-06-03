import { DefaultArgs } from '@prisma/client/runtime/wasm-compiler-edge';
import { AsyncLocalStorage } from 'async_hooks';
import { PrismaClient } from '@prisma/client';

export const prismaContext = new AsyncLocalStorage<{
  txId: string;
  prismaClient: PrismaClient;
}>();
