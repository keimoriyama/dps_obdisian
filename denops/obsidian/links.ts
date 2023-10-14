import {
  Denops,
  execute,
  expand,
  getcurpos,
  getline,
  globals,
  open,
  Position,
  walk,
  WalkEntry,
} from "./deps.ts";
import { get_base_dir } from "./utils.ts";
export async function main(denops: Denops): Promise<void> {
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
  };
  await execute(
    denops,
    `command! DpsObsidianFollowLink call denops#request('${denops.name}', 'follow_link', [])`,
  );
}

async function search_file(denops, filename): Promise<WalkEntry[]> {
  const baseDir: string = await get_base_dir(denops);
  let file_paths: string[] = [];
  for await (
    const files of walk(baseDir, { includeDirs: false, match: [filename] })
  ) {
    file_paths.push(files);
  }
  return file_paths;
}

async function eval_link(denops: Denops): Promise<{ [key: string]: any }> {
  // [[]]で囲まれたカーソル下の文字列を取得
  const cursor_pos: Position = await getcurpos(denops);
  const lnum: number = cursor_pos[1];
  const col: number = cursor_pos[2];
  const str_under_cursor: string = await getline(denops, lnum);
  const begin_parenthesis_pos: number = str_under_cursor.indexOf("[[");
  const end_parrenthesis_pos: number = str_under_cursor.lastIndexOf("]]");
  let result: { [key: string]: boolean | string } = {};
  result["result"] = begin_parenthesis_pos < col || col < end_parrenthesis_pos;
  result["text"] = str_under_cursor.slice(
    begin_parenthesis_pos + 2,
    end_parrenthesis_pos,
  );
  if (begin_parenthesis_pos == -1 || end_parrenthesis_pos == -1) {
    console.log("cursor is not under the link for the note");
  }
  return result;
}
