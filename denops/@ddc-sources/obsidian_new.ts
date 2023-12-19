import {
  assertEquals,
  BaseSource,
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
    const base_dir: string = await getBaseDir(args.denops);
    const file_in_vault = await getFileInVault(base_dir);
    let filename = genFilename();
    while (!check(file_in_vault, filename)) {
      filename = genFilename();
    }
    items.push({
      word: input,
      user_data: {
        id: input.replace("]]", ""),
        filename: filename,
        noteDir: base_dir,
      },
    });
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
  return str.replace(regex, `[[${filename}|${id}]]`);
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
    "[]",
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
    "[[sample]]aaa[[aaa|test]]",
  );
  assertEquals(formatString("[[test]]", "sample", "test"), "[[sample|test]]");
  assertEquals(formatString("[[test]]test", "aaa", "test"), "[[aaa|test]]test");
  assertEquals(formatString("test[[test]]", "aaa", "test"), "test[[aaa|test]]");
});
