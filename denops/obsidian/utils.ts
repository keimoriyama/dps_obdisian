import { Denops, expand, globals } from "./deps.ts";
export async function get_base_dir(denops: Denops): Promise<string> {
  const baseDir: string = await expand(
    denops,
    await globals.get(denops, "dps_obsidian_base_dir"),
  );
  return baseDir;
}
