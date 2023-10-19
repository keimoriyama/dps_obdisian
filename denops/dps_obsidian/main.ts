import {
  Denops,
  execute,
  exists,
  join,
  open,
  OpenResult,
  setbufline,
} from "./deps.ts";
// import { main as file_main } from "./files.ts";
// import { main as link_main } from "./links.ts";
import { follow_link } from "./links.ts";
import { getBaseDir, getDailyNoteDir } from "./utils.ts";
import { createToday } from "./files.ts";

export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    "follow_link": async () => {
      await follow_link(denops);
    },
    "createToday": async () => {
      await createToday(denops);
    },
  };
  await execute(
    denops,
    `command! DpsObsidianToday call denops#request('${denops.name}', 'createToday', [])`,
  );
  await execute(
    denops,
    `command! DpsObsidianFollowLink call denops#request('${denops.name}', 'follow_link', [])`,
  );
}
