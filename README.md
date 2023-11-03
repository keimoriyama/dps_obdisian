# Dps_obsidian

A plugin for writing and following links in an Obsidian vault.

This plugin is written by denops.

## Installation

Using [lazy.nvim](https://github.com/folke/lazy.nvim):

```lua
return {
    'keimoriyama/dps_obdisian',
    dependencies = {
        'vim-denops/denops.vim'
    },
    init = function()
			vim.g.dps_obsidian_base_dir = "~/Documents/Notes"
			vim.g.dps_obsidian_daily_note_dir = "daily"
		end,
}
```

Using [dpp.vim](https://github.com/Shougo/dpp.vim):

```toml
[[plugins]]
repo = 'keimoriyama/dps_obdisian' 
on_source='''
    let g:dps_obsidian_base_dir = "~/Documents/Notes"
    let g:dps_obsidian_daily_note_dir = "daily"
'''
```

## Commands

- `DpsObsidianFollowLink`: follow a link under cursor
- `DpsObsidianToday`: create a note under directory which is specified in `dps_obsidian_base_dir`.

## Variables

- `dps_obsidian_base_dir`: directory of the vault

## Current Issues

- Can't support multi link to other notes in a line
- Formatter is not available
