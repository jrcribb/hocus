import type { PrebuildEventFiles } from "@prisma/client";

import type { CreateActivity } from "./types";
import { withActivityHeartbeat } from "./utils";

import { Token } from "~/token";

export type CreatePrebuildFilesActivity = (args: {
  prebuildEventId: bigint;
  sourceProjectDrivePath: string;
}) => Promise<PrebuildEventFiles>;
export const createPrebuildFiles: CreateActivity<CreatePrebuildFilesActivity> =
  ({ injector, db }) =>
  async (args) => {
    const prebuildService = injector.resolve(Token.PrebuildService);
    const agentUtilService = injector.resolve(Token.AgentUtilService);
    const perfService = injector.resolve(Token.PerfService);

    perfService.log("createPrebuildFiles", "start", args);
    const result = await withActivityHeartbeat({}, async () => {
      const agentInstance = await db.$transaction(async (tdb) =>
        agentUtilService.getOrCreateSoloAgentInstance(tdb),
      );
      return await prebuildService.createPrebuildEventFiles(db, {
        ...args,
        agentInstanceId: agentInstance.id,
      });
    });
    perfService.log("createPrebuildFiles", "end", args);
    return result;
  };
