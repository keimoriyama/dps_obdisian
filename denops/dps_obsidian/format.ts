import { assertEquals, Denops, getbufline, setbufline } from "./deps.ts";

export async function format(denops: Denops): Promise<void> {
  const lines = await getbufline(denops, "%", 1, "$");
  const formattedLines = formatLine(lines);
  await setbufline(denops, "%", 1, formattedLines);
}

function formatLine(lines: string[]): string[] {
  const result: string[] = [];
  let alias_idx: number = -1;
  let is_alias: boolean = false;
  for (const line of lines) {
    if (line.startsWith("id:")) {
      const [, value] = line.match(/"([^"]+)"/) || [];
      if (value) {
        result.push("id:");
        result.push("\t- " + value);
      } else {
        if (!line.startsWith("\t")) {
          result.push("\t" + line);
        } else {
          result.push(line); // No double quotes found, keep the line unchanged
        }
      }
    } else if (line.indexOf("[") != -1 && line.indexOf("]") != -1) {
      // expand tags
      const [, tags] = line.match(/\[([^\]]+)\]/) || [];
      if (tags) {
        const parsedTags = tags.split(",").map((tag) => `\t- ${tag.trim()}`);
        result.push(...parsedTags);
      } else {
        result.push(line); // No square brackets found, keep the line unchanged
      }
    } else if (line.startsWith("# ")) {
      // Take first line start with #
      result.splice(
        alias_idx + 1,
        0,
        '\t- "' + line.replace("#", "").trim() + '"',
      );
      result.push(line);
    } else if (line.startsWith("aliases:")) {
      is_alias = true;
      alias_idx = result.length;
      result.push(line);
    } else if (line.startsWith("tags:")) {
      is_alias = false;
      result.push(line);
    } else {
      if (is_alias) {
        alias_idx += 1;
      }
      if (line.startsWith("- ")) {
        result.push("\t" + line);
      } else {
        result.push(line);
      }
    }
  }
  return result;
}

Deno.test("format", async () => {
  const target = [
    "---",
    'id: "2021-03-01"',
    "aliases:",
    '\t- "2021-03-01"',
    "tags:",
    '["test1", "test2"]',
  ];
  const res = formatLine(target);
  assertEquals(res, [
    "---",
    "id:",
    "\t- 2021-03-01",
    "aliases:",
    '\t- "2021-03-01"',
    "tags:",
    '\t- "test1"',
    '\t- "test2"',
  ]);
});
Deno.test("format", async () => {
  const target = [
    "---",
    'id: "2021-03-01"',
    "aliases:",
    '- "2021-03-01"',
    "tags:",
    '["test1", "test2"]',
  ];
  const res = formatLine(target);
  assertEquals(res, [
    "---",
    "id:",
    "\t- 2021-03-01",
    "aliases:",
    '\t- "2021-03-01"',
    "tags:",
    '\t- "test1"',
    '\t- "test2"',
  ]);
});

Deno.test("format_with_alias", async () => {
  const target = [
    "---",
    'id: "2021-03-01"',
    "aliases:",
    '- "2021-03-01"',
    "tags:",
    '["test1", "test2"]',
    "",
    "# This is test",
  ];
  const res = formatLine(target);
  assertEquals(res, [
    "---",
    "id:",
    "\t- 2021-03-01",
    "aliases:",
    '\t- "2021-03-01"',
    '\t- "This is test"',
    "tags:",
    '\t- "test1"',
    '\t- "test2"',
    "",
    "# This is test",
  ]);
});

Deno.test("format_with_alias", async () => {
  const target = [
    "---",
    'id: "2021-03-01"',
    "aliases:",
    '- "2021-03-01"',
    "tags:",
    '["test1", "test2"]',
    "",
    "# This is test",
  ];
  const res = formatLine(target);
  assertEquals(res, [
    "---",
    "id:",
    "\t- 2021-03-01",
    "aliases:",
    '\t- "2021-03-01"',
    '\t- "This is test"',
    "tags:",
    '\t- "test1"',
    '\t- "test2"',
    "",
    "# This is test",
  ]);
});

Deno.test("format_with_alias", async () => {
  const target = [
    "---",
    'id: "2021-03-01"',
    "aliases:",
    '- "2021-03-01"',
    "tags:",
    "[]",
    "",
    "# This is test",
    "## This is test",
  ];
  const res = formatLine(target);
  assertEquals(res, [
    "---",
    "id:",
    "\t- 2021-03-01",
    "aliases:",
    '\t- "2021-03-01"',
    '\t- "This is test"',
    "tags:",
    "[]",
    "",
    "# This is test",
    "## This is test",
  ]);
});
