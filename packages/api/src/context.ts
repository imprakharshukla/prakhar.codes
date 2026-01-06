import { mastra } from "./mastra";

export const createContext = async (): Promise<{
  mastra: typeof mastra;
}> => {
  return {
    mastra,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
