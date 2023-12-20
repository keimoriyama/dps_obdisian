import { assertEquals, Denops, getbufline, setbufline } from "./deps.ts";

export async function format(denops: Denops): Promise<void> {
  const lines = await getbufline(denops, "%", 1, "$");
  const formattedLines = formatLine(lines);
  await setbufline(denops, "%", 1, formattedLines);
}

function formatLine(lines: string[]): string[] {
  const result: string[] = [];
  let in_tags: boolean = false;
  // 機能の分割が必要
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("---")) {
      result.push(line);
      in_tags = !in_tags;
    } else if (line.startsWith("id:")) {
      const [, value] = line.match(/: (.*)/) || [];
      if (value) {
        result.push("id:");
        result.push("- " + value);
      } else {
        result.push(line); // No double quotes found, keep the line unchanged
      }
    } else if (line.indexOf("[") != -1 && line.indexOf("]") != -1) {
      // expand tags
      const [, tags] = line.match(/\[([^\]]+)\]/) || [];
      if (tags) {
        const parsedTags = tags.split(",").map((tag) => `  - ${tag.trim()}`);
        result.push(...parsedTags);
      } else {
        result.push(line); // No square brackets found, keep the line unchanged
      }
    } else {
      result.push(line);
    }
  }
  for (let i = 0; i < result.length; i++) {
    if (result[i].startsWith("---")) {
      in_tags = !in_tags;
    }
    if (result[i].startsWith("- ") && in_tags) {
      result[i] = "  " + result[i];
    }
  }
  return result;
}

Deno.test("format", async () => {
  const target = [
    "---",
    'id: "2021-03-01"',
    "aliases:",
    '  - "2021-03-01"',
    "tags:",
    '["test1", "test2"]',
    "---",
  ];
  const res = formatLine(target);
  assertEquals(res, [
    "---",
    "id:",
    '  - "2021-03-01"',
    "aliases:",
    '  - "2021-03-01"',
    "tags:",
    '  - "test1"',
    '  - "test2"',
    "---",
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
    "---",
  ];
  const res = formatLine(target);
  assertEquals(res, [
    "---",
    "id:",
    '  - "2021-03-01"',
    "aliases:",
    '  - "2021-03-01"',
    "tags:",
    '  - "test1"',
    '  - "test2"',
    "---",
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
    "---",
    "",
    "# This is test",
  ];
  const res = formatLine(target);
  assertEquals(res, [
    "---",
    "id:",
    '  - "2021-03-01"',
    "aliases:",
    '  - "2021-03-01"',
    '  - "This is test"',
    "tags:",
    '  - "test1"',
    '  - "test2"',
    "---",
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
    "---",
    "",
    "# This is test",
  ];
  const res = formatLine(target);
  assertEquals(res, [
    "---",
    "id:",
    '  - "2021-03-01"',
    "aliases:",
    '  - "2021-03-01"',
    '  - "This is test"',
    "tags:",
    '  - "test1"',
    '  - "test2"',
    "---",
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
    "---",
    "",
    "# This is test",
    "## This is test",
  ];
  const res = formatLine(target);
  assertEquals(res, [
    "---",
    "id:",
    '  - "2021-03-01"',
    "aliases:",
    '  - "2021-03-01"',
    '  - "This is test"',
    "tags:",
    "[]",
    "---",
    "",
    "# This is test",
    "## This is test",
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
    "---",
    "",
    "# This is test",
    "- This is test",
  ];
  const res = formatLine(target);
  assertEquals(res, [
    "---",
    "id:",
    '  - "2021-03-01"',
    "aliases:",
    '  - "2021-03-01"',
    '  - "This is test"',
    "tags:",
    "[]",
    "---",
    "",
    "# This is test",
    "- This is test",
  ]);
});

Deno.test("format_with_alias", async () => {
  const target = [
    "---",
    'id: "2021-03-01"',
    "aliases:",
    '- "2021-03-01"',
    '- "This is test"',
    "tags:",
    "[]",
    "---",
    "",
    "# This is test",
    "- This is test",
  ];
  const res = formatLine(target);
  assertEquals(res, [
    "---",
    "id:",
    '  - "2021-03-01"',
    "aliases:",
    '  - "2021-03-01"',
    '  - "This is test"',
    "tags:",
    "[]",
    "---",
    "",
    "# This is test",
    "- This is test",
  ]);
});

Deno.test("format_with_alias", async () => {
  const target = [
    "---",
    "id:",
    '  - "2021-03-01"',
    "aliases:",
    '  - "2021-03-01"',
    '  - "This is test"',
    "tags:",
    "[]",
    "---",
    "",
    "# This is test",
    "- This is test",
  ];
  const res = formatLine(target);
  assertEquals(res, [
    "---",
    "id:",
    '  - "2021-03-01"',
    "aliases:",
    '  - "2021-03-01"',
    '  - "This is test"',
    "tags:",
    "[]",
    "---",
    "",
    "# This is test",
    "- This is test",
  ]);
});
