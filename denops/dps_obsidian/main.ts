import { Denops } from "./deps.ts";
import { follow_link } from "./links.ts";
import { createToday } from "./files.ts";
import { format } from "./format.ts";

export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    "follow_link": async () => {
      await follow_link(denops);
    },
    "createToday": async () => {
      await createToday(denops);
    },
    "format": async () => {
      await format(denops);
    },
  };
}
