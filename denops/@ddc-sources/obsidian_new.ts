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
    return items;
  }
  override params(): Params {
    return {};
  }
}
