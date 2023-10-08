import { Denops } from "./deps.ts";
import { main as file_main } from "./files.ts"
import { main as link_main } from "./links.ts"
export async function main(denops: Denops): void {
	file_main(denops);
	link_main(denops);
}
