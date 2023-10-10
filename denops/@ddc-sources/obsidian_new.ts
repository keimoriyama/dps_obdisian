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
  override async onCompleteDone(
    denops: Denops,
    context: Context,
    onCallback: OnCallback,
    options: DdcOptions,
    userSource: UserSource,
    userData: DdcUserData,
  ): Promise<void> {
    // 存在しないファイル名を補完した場合、そのファイルを作成する
  }
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
    const file_in_vault = await get_file_in_vault(base_dir);
    let filename = await gen_filename();
    while (!check(file_in_vault, filename)) {
      filename = await gen_filename();
    }
    // カーソルの下で[[]]に囲まれているの文字列を取得
    console.log(args);
    items.push({ word: filename });
    return items;
  }
  override params(): Params {
    return {};
  }
}

async function check(
  files_in_vault: string[],
  filename: string,
): Promise<boolean> {
  for (const file in files_in_vault) {
    if (file.includes(filename)) {
      return false;
    }
  }
  return true;
}

async function gen_filename(): Promise<string> {
  const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  let filename = "";
  while (filename.length < 4) {
    const n = Math.floor(Math.random() * 100);
    if (n < 26) {
      filename += alpha[n];
    }
  }
  filename += "_" + String(Math.floor(Math.random() * 10000));
  console.log(filename);
  return filename;
}

async function get_file_in_vault(
  base_dir: string,
): Promise<string[]> {
  let files = [];
  for await (
    const entry of walk(base_dir, {
      includeDirs: false,
      includeFiles: true,
      exts: [".md"],
    })
  ) {
    files.push(entry.path);
  }
  return files;
}
