import { Denops, expand, globals, isNull, isString } from "./deps.ts";
export async function getBaseDir(denops: Denops): Promise<string> {
  const baseDir: string = await expand(
    denops,
    await globals.get(denops, "dps_obsidian_base_dir"),
  );
  if (isNull(baseDir)) {
    console.log("dps_obsidian_base_dir is empty");
  }
  return baseDir;
}

export async function getDailyNoteDir(
  denops: Denops,
): Promise<string> {
  const baseDir: string = await globals.get(
    denops,
    "dps_obsidian_daily_note_dir",
  );
  if (isNull(baseDir)) {
    console.log("dps_obsidian_daly_note_dir is empty");
  }
  return baseDir;
}
