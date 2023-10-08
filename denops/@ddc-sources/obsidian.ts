import {
  BaseSource,
  DdcOptions,
  Item,
  SourceOptions,
} from "https://deno.land/x/ddc_vim@v3.4.0/types.ts";
import { Denops } from "https://deno.land/x/ddc_vim@v3.4.0/deps.ts";
import { expand, globals } from "./deps.ts";

type Params = Record<never, never>;

export class Source extends BaseSource<Params> {
  override async gather(args: {
    denops: Denops;
    options: DdcOptions;
    sourceOptions: SourceOptions;
    sourceParams: Params;
    completeStr: string;
  }): Promise<Item[]> {
    const base_dir = await expand(
      args.denops,
      await globals.get(args.denops, "base_dir"),
    );
    // あるNoteのファイル名とタグを取得する
    // 存在しないファイルやタグを指定している場合は、新しいNoteを作成するような候補を返す
    console.log(base_dir);
    return [
      { word: "foo" },
      { word: "bar" },
      { word: "baz" },
    ];
  }
  override params(): Params {
    return {};
  }
}
