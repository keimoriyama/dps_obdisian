import { BaseSource } from "https://deno.land/x/ddc_vim@v4.0.5/types.ts";
// import { Denops } from "https://deno.land/x/ddc_vim@v4.0.5/deps.ts";
// import { walk } from "https://deno.land/std@0.92.0/fs/mod.ts";
// import {
//   getbufline,
//   winbufnr,
//   writefile,
// } from "https://deno.land/x/denops_std@v5.0.1/function/mod.ts";
// import { getBaseDir, getDailyNoteDir } from "../dps_obsidian/utils.ts";
// import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";

import {
  assertEquals,
  Context,
  DdcGatherItems,
  DdcOptions,
  Denops,
  getBaseDir,
  getbufline,
  getDailyNoteDir,
  Item,
  SourceOptions,
  walk,
  winbufnr,
  writefile,
} from "./deps.ts";

type Params = Record<never, never>;

type ObsidianNotes = {
  id: string;
  filename: string;
  noteDir: string;
};

export class Source extends BaseSource<Params> {
  override async gather(args: {
    denops: Denops;
    context: Context;
    options: DdcOptions;
    sourceOptions: SourceOptions;
    sourceParams: Params;
    completeStr: string;
  }): Promise<DdcGatherItems<ObsidianNotes>> {
    const items: Item<ObsidianNotes>[] = [];
    const input: string = args.completeStr;
    const next_input: string = args.context.nextInput;

    if (next_input != "]]") {
      return { items: items, isIncomplete: false };
    }
    const base_dir: string = await getBaseDir(args.denops);
    const file_in_vault = await getFileInVault(base_dir);
    let filename = genFilename();
    while (!check(file_in_vault, filename)) {
      filename = genFilename();
    }
    items.push({
      word: input,
      user_data: {
        id: input.replace("[[", "").replace("]]", ""),
        filename: filename,
        noteDir: base_dir,
      },
    });
    console.log(items);
    return { items: items, isIncomplete: true };
  }
  override params(): Params {
    return {};
  }
  override async onCompleteDone(
    args: {
      denops: Denops;
      userData: unknown;
      context: Context;
    },
  ): Promise<void> {
    const userData = args.userData as ObsidianNotes;
    const content = NoteTemplate(userData.id, userData.filename);
    const noteDir = await getDailyNoteDir(args.denops);
    await writefile(
      args.denops,
      content,
      userData.noteDir + "/" + noteDir + "/" + userData.filename +
        ".md",
    );
    // [[]]で囲まれている文字列を変換する
    const line = args.context.lineNr;
    const bufnr = await winbufnr(args.denops, 0);
    const line_under_cursor = await getbufline(args.denops, bufnr, line);
    const target = line_under_cursor[0];
    const replacedString = formatString(target, userData.filename, userData.id);
    await args.denops.call("setline", line, replacedString);
    return;
  }
}

function formatString(str: string, filename: string, id: string): string {
  const regex = new RegExp(`\\[\\[${id}\\]\\]`, "g");
  return str.replace(regex, `[[${id}|${filename}]]`);
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

Deno.test("formatString", () => {
  assertEquals(
    formatString("[[sample]]aaa[[test]]", "aaa", "test"),
    "[[sample]]aaa[[test|aaa]]",
  );
  assertEquals(formatString("[[test]]", "sample", "test"), "[[test|sample]]");
  assertEquals(formatString("[[test]]test", "aaa", "test"), "[[test|aaa]]test");
  assertEquals(formatString("test[[test]]", "aaa", "test"), "test[[test|aaa]]");
});
