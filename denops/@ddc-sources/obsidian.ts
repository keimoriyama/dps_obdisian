import {
  BaseSource,
  DdcOptions,
  Item,
  SourceOptions,
} from "https://deno.land/x/ddc_vim@v3.4.0/types.ts";
import { Denops } from "https://deno.land/x/ddc_vim@v3.4.0/deps.ts";
import { walk } from "https://deno.land/std@0.92.0/fs/mod.ts";
import { readfile } from "https://deno.land/x/denops_std@v5.0.1/function/mod.ts";
import { get_base_dir } from "../obsidian/utils.ts";

import {
  getbufline,
  winbufnr,
  writefile,
} from "https://deno.land/x/denops_std@v5.0.1/function/mod.ts";

import { type OnCompleteDoneArguments } from "https://deno.land/x/ddc_vim@v4.0.5/base/source.ts";

type Params = Record<never, never>;
type ObsidianNotes = {
  id: string;
  filename: string;
  noteDir: string;
};

export class Source extends BaseSource<Params> {
  override async gather(args: {
    denops: Denops;
    options: DdcOptions;
    sourceOptions: SourceOptions;
    sourceParams: Params;
    completeStr: string;
  }): Promise<Item[]> {
    let items: Item[] = this.getCompletionFiles(args.denops);
    if (items.length == 0) {
      items = this.createNewNote(args);
    }
    return items;
  }
  override params(): Params {
    return {};
  }
  async createNewNote(args: any): Promise<ObsidianNotes> {
    const items: Item<ObsidianNotes>[] = [];
    const target: string = args.context.input;
    const base_dir: string = await get_base_dir(args.denops);
    const file_in_vault = await get_file_in_vault(base_dir);
    let filename = await gen_filename();
    while (!check(file_in_vault, filename)) {
      filename = await gen_filename();
    }
    items.push({
      word: target,
      user_data: { id: target, filename: filename, noteDir: base_dir },
    });
    return { items: items, isIncomplete: true };
  }
  async getCompletionFiles(denops: Denops): Promise<Item[]> {
    let items: Item[] = [];
    const base_dir: string = await get_base_dir(denops);
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
        const res_str = res[0].replace(/"/g, "");
        const word = filename + "|" + res_str;
        items.push({ word: word });
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
    const content = await note_template(userData.id, userData.filename);
    await writefile(
      denops,
      content,
      userData.noteDir + "/" + userData.filename + ".md",
    );
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
    console.log(replacedString);
    await denops.call("setline", line, replacedString);
    return;
  }
}
function note_template(
  alias: string,
  filename: string,
): string[] {
  const id = filename.replace(".md", "");
  alias = alias.replace("\[\[", "").replace("\]\]", "");
  return [
    "---",
    `id: \"${id}\"`,
    "aliases:",
    `- \"${alias}\"`,
    "tags:",
    '- ""',
    "--- ",
  ];
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
