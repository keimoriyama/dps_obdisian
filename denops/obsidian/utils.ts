import { Denops, expand, globals, isNull, isString } from "./deps.ts";
export async function get_base_dir(denops: Denops): Promise<string> {
  const baseDir: string = await expand(
    denops,
    await globals.get(denops, "dps_obsidian_base_dir"),
  );
  if (isNull(baseDir)) {
    console.log("dps_obsidian_base_dir is empty");
  }
  return baseDir;
}
