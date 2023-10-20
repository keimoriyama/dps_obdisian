import {
  Denops,
  execute,
  exists,
  format,
  join,
  open,
  OpenResult,
  setbufline,
} from "./deps.ts";

import { getBaseDir, getDailyNoteDir } from "./utils.ts";

export async function createToday(denops: Denops): Promise<void> {
  const baseDir: string = await getBaseDir(denops);
  const dailyNoteDir: string = await getDailyNoteDir(denops);
  const filename: string = genDateStr();
  const path2file: string = join(baseDir, dailyNoteDir, filename);
  const res: OpenResult = await open(denops, path2file);
  if (await exists(path2file)) {
    return;
  }
  const bufnr: number = res["bufnr"];
  const template: string[] = getTemplate(filename, "daily_notes");
  await setbufline(denops, bufnr, 1, template);
}

function getTemplate(id: string, tag: string): string[] {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const d = getDate();
  const month = monthNames[d.getMonth() - 1];
  const date_alias = `- ${month} ${d.getDate()}, ${d.getFullYear()}`;
  return [
    "---",
    `id: \"${id}\"`,
    "aliases:",
    date_alias,
    "tags:",
    `- \"${tag}\"`,
    "--- ",
  ];
}

function getDate(): Date {
  const d = new Date();
  return d;
}

function genDateStr(): string {
  const d = getDate();
  const filename = format(d, "yyyy-MM-dd") + ".md";
  return filename;
}
