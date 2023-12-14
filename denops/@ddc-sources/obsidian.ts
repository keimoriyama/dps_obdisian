import { readfile } from "https://deno.land/x/denops_std@v5.0.1/function/mod.ts";
import {
  ensure,
  is,
  isArrayOf,
} from "https://deno.land/x/unknownutil@v3.11.0/mod.ts";
import {
  BaseSource,
  Context,
  DdcOptions,
  Denops,
  getBaseDir,
  getbufline,
  Item,
  ObsidianNotes,
  SourceOptions,
  walk,
  winbufnr,
} from "./deps.ts";

type Params = Record<never, never>;

export class Source extends BaseSource<Params> {
  override async gather(args: {
    denops: Denops;
    options: DdcOptions;
    sourceOptions: SourceOptions;
    sourceParams: Params;
    completeStr: string;
  }): Promise<Item[]> {
    let items: Item[] = await this.getCompletionFiles(args.denops);
    return items;
  }
  override params(): Params {
    return {};
  }
  // onInitの方が良さそう
  async getCompletionFiles(denops: Denops): Promise<Item[]> {
    let items: Item[] = [];
    const base_dir: string = await getBaseDir(denops);
    // あるNoteのファイル名とタグを取得する
    for await (
      const entry of walk(base_dir, {
        includeDirs: false,
        includeFiles: true,
        exts: [".md"],
      })
    ) {
      const path = entry.path.split("/");
      const filename = path[path.length - 1].replace(".md", "");
      const file_content: string[] = ensure(
        await readfile(denops, entry.path),
        isArrayOf(is.String),
      );
      const alias_idx = file_content.indexOf("aliases:");
      const tags_idx = file_content.indexOf("tags:");
      const regex = /"(.*)"/g;
      for (let i = alias_idx + 1; i < tags_idx; i++) {
        // ""の間の文字を取り出す
        const res = file_content[i].match(regex);
        if (res == null) {
          continue;
        }
        const res_str = res[0].replace(/"/g, "");
        items.push({
          word: res_str,
          user_data: { id: res_str, filename: filename, noteDir: "" },
        });
        items.push({
          word: filename,
          user_data: { id: res_str, filename: filename, noteDir: "" },
        });
      }
    }
    return items;
  }
  override async onCompleteDone(
    args: {
      denops: Denops;
      userData: unknown;
      context: Context;
    },
  ): Promise<void> {
    const userData = args.userData as ObsidianNotes;
    const denops = args.denops;
    const context = args.context;
    const replace_str = userData.filename + "|" + userData.id;
    // [[]]で囲まれている文字列を変換する
    const line = context.lineNr;
    const bufnr = await winbufnr(denops, 0);
    const line_under_cursor = await getbufline(denops, bufnr, line);
    const target = line_under_cursor[0];
    let replacedString = "[[" + target.replace(
      /\[\[(.*?)\]\]/g,
      replace_str,
    ).replace("[[", "");
    if (replacedString.indexOf("]]") == -1) {
      replacedString += "]]";
    }
    await denops.call("setline", line, replacedString);
    return;
  }
}
