command! DpsObsidianToday call dps_obsidian#create_today()
command! DpsObsidianFollowLink call dps_obsidian#follow_link()
command! DpsObsidianFormat call dps_obsidian#format()

if empty(get(g:, "obsidian_format_enable"))
	augroup ObsidianFormat
		autocmd!
		autocmd BufWritePre *.md call dps_obsidian#format()
endif
