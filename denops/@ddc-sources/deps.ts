export { globals } from "https://deno.land/x/denops_std@v5.0.1/variable/mod.ts";
export { expand } from "https://deno.land/x/denops_std@v5.0.1/function/mod.ts";
export type {
  Context,
  DdcGatherItems,
  DdcOptions,
  DdcUserData,
  Item,
  SourceOptions,
} from "https://deno.land/x/ddc_vim@v4.0.5/types.ts";
export type { Denops } from "https://deno.land/x/ddc_vim@v4.0.5/deps.ts";
export { walk } from "https://deno.land/std@0.92.0/fs/mod.ts";
export {
  getbufline,
  winbufnr,
  writefile,
} from "https://deno.land/x/denops_std@v5.0.1/function/mod.ts";
export { getBaseDir, getDailyNoteDir } from "../dps_obsidian/utils.ts";
export { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";

export type ObsidianNotes = {
  id: string;
  filename: string;
  noteDir: string;
};
