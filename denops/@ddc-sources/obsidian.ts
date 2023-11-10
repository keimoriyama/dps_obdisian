import {
  BaseSource,
  DdcOptions,
  Item,
  SourceOptions,
} from "https://deno.land/x/ddc_vim@v4.0.5/types.ts";
import { Denops } from "https://deno.land/x/ddc_vim@v4.0.5/deps.ts";
import { walk } from "https://deno.land/std@0.92.0/fs/mod.ts";
import { readfile } from "https://deno.land/x/denops_std@v5.0.1/function/mod.ts";
import { getBaseDir } from "../dps_obsidian/utils.ts";

import {
  getbufline,
  winbufnr,
} from "https://deno.land/x/denops_std@v5.0.1/function/mod.ts";

import { type OnCompleteDoneArguments } from "https://deno.land/x/ddc_vim@v4.0.5/base/source.ts";

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
      const file_content = await readfile(denops, entry.path);
      const alias_idx = file_content.indexOf("aliases:");
      const tags_idx = file_content.indexOf("tags:");
      const regex = /"(.*)"/g;
      for (let i = alias_idx + 1; i < tags_idx; i++) {
        // ""の間の文字を取り出す
        const res = file_content[i].match(regex);
        if (res == null) {
          continue;
        }
        const res_str = "[[" + res[0].replace(/"/g, "");
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
    {
      denops,
      userData,
      context,
      sourceParams,
    }: OnCompleteDoneArguments<Params, UserData>,
  ): Promise<void> {
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
