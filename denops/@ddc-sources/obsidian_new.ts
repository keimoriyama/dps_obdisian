import {
  BaseSource,
  Context,
  DdcGatherItems,
  DdcOptions,
  DdcUserData,
  Item,
  OnCallback,
  SourceOptions,
  UserData,
} from "https://deno.land/x/ddc_vim@v3.4.0/types.ts";
import { Denops } from "https://deno.land/x/ddc_vim@v3.4.0/deps.ts";
import { walk } from "https://deno.land/std@0.92.0/fs/mod.ts";
import {
  getbufline,
  getline,
  winbufnr,
  writefile,
} from "https://deno.land/x/denops_std@v5.0.1/function/mod.ts";
import { getBaseDir, getDailyNoteDir } from "../dps_obsidian/utils.ts";

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
  }): Promise<DdcGatherItems<ObsidianNotes>> {
    const items: Item<ObsidianNotes>[] = [];
    const input: string = args.context.input;
    const next_input: string = args.context.nextInput;
    if (next_input != "]]") {
      return { items: items, isIncomplete: false };
    }
    const base_dir: string = await getBaseDir(args.denops);
    const file_in_vault = getFileInVault(base_dir);
    let filename = genFilename();
    while (!check(file_in_vault, filename)) {
      filename = genFilename();
    }
    items.push({
      word: input,
      user_data: { id: input, filename: filename, noteDir: base_dir },
    });
    return { items: items, isIncomplete: true };
  }
  override params(): Params {
    return {};
  }
  override async onCompleteDone(
    {
      denops,
      userData,
      context,
      sourceParams,
    }: OnCompleteDoneArguments<Params, UserData>,
  ): Promise<void> {
    const content = NoteTemplate(userData.id, userData.filename);
    const noteDir = await getDailyNoteDir(denops);
    await writefile(
      denops,
      content,
      userData.noteDir + "/" + noteDir + "/" + userData.filename + ".md",
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
    await denops.call("setline", line, replacedString);
    return;
  }
}

function NoteTemplate(
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

function check(
  files_in_vault: string[],
  filename: string,
): boolean {
  for (const file in files_in_vault) {
    if (file.includes(filename)) {
      return false;
    }
  }
  return true;
}

function genFilename(): string {
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

async function getFileInVault(
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
