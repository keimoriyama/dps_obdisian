function dps_obsidian#create_today() abort
	call denops#request('dps_obsidian', 'createToday', [])
endfunction

function dps_obsidian#follow_link() abort
	call denops#request('${denops.name}', 'follow_link', [])
endfunction
