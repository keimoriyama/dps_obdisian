import {
  BaseSource,
  Context,
  DdcOptions,
  DdcUserData,
  Item,
  OnCallback,
  SourceOptions,
  UserSource,
} from "https://deno.land/x/ddc_vim@v3.4.0/types.ts";
import { Denops } from "https://deno.land/x/ddc_vim@v3.4.0/deps.ts";
import { expand, globals } from "./deps.ts";
import { walk } from "https://deno.land/std@0.92.0/fs/mod.ts";
import { readfile } from "https://deno.land/x/denops_std@v5.0.1/function/mod.ts";
type Params = Record<never, never>;

export class Source extends BaseSource<Params> {
  override async gather(args: {
    denops: Denops;
    options: DdcOptions;
    sourceOptions: SourceOptions;
    sourceParams: Params;
    completeStr: string;
  }): Promise<Item[]> {
    let items: Item[] = [];
    const base_dir: string = await expand(
      args.denops,
      await globals.get(args.denops, "base_dir"),
    );
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
      const file_content = await readfile(args.denops, entry.path);
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
        const word = filename + "|" + res_str;
        items.push({ word: word });
      }
    }
    return items;
  }
  override params(): Params {
    return {};
  }
}
