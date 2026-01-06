import { Mastra } from "@mastra/core/mastra";
import { PostgresStore, PgVector } from "@mastra/pg";
import { PinoLogger } from "@mastra/loggers";
import { knowledgeAgent } from "./agents/knowledge-agent";
import { BraintrustExporter } from "@mastra/braintrust";

export const mastra = new Mastra({
  agents: {
    "knowledge-agent": knowledgeAgent,
  },
  vectors: {
    pgVector: new PgVector({
      connectionString:
        process.env.DATABASE_URL ||
        "postgresql://postgres:password@localhost:5434/prakhar_chat",
    }),
  },
  storage: new PostgresStore({
    connectionString:
      process.env.DATABASE_URL ||
      "postgresql://postgres:password@localhost:5434/prakhar_chat",
  }),
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
  observability: {
    configs: {
      braintrust: {
        serviceName: "ideer",
        exporters: [
          new BraintrustExporter({
            apiKey: process.env.BRAINTRUST_API_KEY,
            projectName: "ideer",
          }),
        ],
      },
    },
  },
  server: {
    port: 4111,
    host: "0.0.0.0",
  },
});

// Export factory function for creating path-prefixed knowledge agents
export {
  createKnowledgeAgent,
  createKnowledgeAgentRuntimeContext,
} from "./agents/knowledge-agent";
