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
import { eval_link, search_file } from "./links.ts";
import { getBaseDir, getDailyNoteDir } from "./utils.ts";
import { genDateStr, getTemplate } from "./files.ts";

export async function main(denops: Denops): Promise<void> {
  // await link_main(denops);
  // await file_main(denops);
  denops.dispatcher = {
    async follow_link() {
      const result = await eval_link(denops);
      if (result["result"]) {
        // ファイル名の確定
        const file_ailias: string = result["text"];
        let filename: string = "";
        if (file_ailias.indexOf("|") != -1) {
          filename = file_ailias.slice(0, file_ailias.indexOf("|")) + ".md";
        } else {
          filename = file_ailias + ".md";
        }
        console.log(filename);
        // 絶対パスで指定する
        let file_paths: WalkEntry[] = await search_file(denops, filename);
        if (file_paths.length == 1) {
          open(denops, file_paths[0].path);
        }
      }
    },
    async createToday(): Promise<void> {
      const baseDir: string = await getBaseDir(denops);
      const dailyNoteDir: string = await getDailyNoteDir(denops);
      const filename: string = genDateStr();
      const path2file: string = join(baseDir, dailyNoteDir, filename);
      const fileExists: boolean = await exists(path2file);
      if (fileExists) {
        open(denops, path2file);
        return;
      } else {
        const res: OpenResult = await open(denops, path2file);
        const bufnr: number = res["bufnr"];
        const template: string[] = getTemplate(filename, "daily_note");
        await setbufline(denops, bufnr, 1, template);
      }
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
