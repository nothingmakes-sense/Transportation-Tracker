// src/utils/api.ts
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "~/server/api/root";

export const api = createTRPCReact<AppRouter>();

// This line now works because root.ts exports RouterInputs / RouterOutputs
export type { RouterInputs, RouterOutputs } from "~/server/api/root";
