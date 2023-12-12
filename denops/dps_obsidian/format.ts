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
      result.push("id:");
      if (value) {
        result.push("- " + value);
      } else {
        result.push(line); // No double quotes found, keep the line unchanged
      }
    } else if (line.indexOf("[") != -1 && line.indexOf("]") != -1) {
      const [, tags] = line.match(/\[([^\]]+)\]/) || [];
      if (tags) {
        const parsedTags = tags.split(",").map((tag) => `- ${tag.trim()}`);
        result.push(...parsedTags);
      } else {
        result.push(line); // No square brackets found, keep the line unchanged
      }
    } else if (line.startsWith("#")) {
      result.splice(
        alias_idx,
        0,
        '- "' + line.replace("#", "").trim() + '"',
      );
      result.push(line);
    } else {
      if (line.startsWith("aliases:")) {
        is_alias = true;
        alias_idx = result.length;
      } else if (line.startsWith("tags:")) {
        is_alias = false;
      }
      if (is_alias) {
        alias_idx += 1;
      }
      result.push(line);
    }
  }

  return result;
}

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
    "- 2021-03-01",
    "aliases:",
    '- "2021-03-01"',
    "tags:",
    '- "test1"',
    '- "test2"',
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
    "- 2021-03-01",
    "aliases:",
    '- "2021-03-01"',
    '- "This is test"',
    "tags:",
    '- "test1"',
    '- "test2"',
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
  ];
  const res = formatLine(target);
  assertEquals(res, [
    "---",
    "id:",
    "- 2021-03-01",
    "aliases:",
    '- "2021-03-01"',
    '- "This is test"',
    "tags:",
    "[]",
    "",
    "# This is test",
  ]);
});
