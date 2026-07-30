# tal-mashiah/claude

My personal [Claude Code](https://claude.com/claude-code) marketplace. Skills, commands and agents live here so they follow me into every session, on every machine.

## Install

On any machine with Claude Code and `gh` auth:

```
/plugin marketplace add tal-mashiah/claude
/plugin install tal-toolkit@tal-mashiah
```

Skills are then available in every session on that machine. Verify with `/plugin`.

## Update

After pushing a change here:

```
/plugin marketplace update tal-mashiah
```

## Layout

```
.claude-plugin/marketplace.json   # this repo IS the marketplace; lists the plugins below
plugins/
└── tal-toolkit/
    ├── .claude-plugin/plugin.json
    ├── skills/<name>/SKILL.md    # model-invoked: Claude decides when to apply
    ├── commands/<name>.md        # user-invoked: /name
    ├── agents/<name>.md          # subagents with their own context
    └── hooks/hooks.json          # event-triggered automation
```

Split `tal-toolkit` into several domain plugins (e.g. `tal-web`, `tal-workflow`) once it grows — that is just moving folders and adding entries to `marketplace.json`.

## Adding something

Ask Claude to "add a skill for this" in any session — the `new-skill` skill in this plugin handles the layout, conventions and reload cycle. Or by hand:

1. Create `plugins/tal-toolkit/skills/<name>/SKILL.md` with `name` and `description` frontmatter. `name` must match the directory.
2. Write the `description` as trigger conditions, including the literal phrases that should fire it — it is the only text Claude sees when deciding to load the skill.
3. Bump `version` in `plugins/tal-toolkit/.claude-plugin/plugin.json`.
4. Commit, push, `/plugin marketplace update tal-mashiah`.

See `plugins/tal-toolkit/skills/new-skill/references/authoring.md` for the full conventions.

## Contents

| Skill | What it does |
| --- | --- |
| `new-skill` | Authors new skills, commands and agents into this repo |

| Command | What it does |
| --- | --- |
| `/discuss` | Talk through ideas without Claude building or planning anything |

## Discuss mode

`/discuss` is a real mode, not a one-shot prompt. `hooks/discuss-mode.js` keeps a
flag file at `~/.claude/discuss-mode/<session-id>`, and two things read it:

- the `UserPromptSubmit` hook in `hooks/hooks.json` re-injects the rules on
  **every** turn, so the frame does not decay over a long thread
- the statusline shows `● DISCUSS` while it is on

The flag is keyed by session id, so the mode never leaks between sessions or
projects.

It exits on `off` alone, on "build it" / "go ahead" / "ok let's do a plan", or
on `/discuss off`. Exit matching is not a substring search — a message
containing a question mark, or running longer than eight words, never counts.
"should we go ahead with option 2?" has to stay in the mode, and failing open
there would be worse than typing six characters.

**On a new machine**, the hook works as soon as the plugin installs, but the
statusline does not: `statusLine` lives in `~/.claude/settings.json` and needs a
stable path, while the plugin cache path changes on every version bump. So copy
the script out and point at the copy:

```
cp plugins/tal-toolkit/hooks/discuss-mode.js ~/.claude/discuss-mode.js
```

```json
"statusLine": {
  "type": "command",
  "command": "node \"$HOME/.claude/discuss-mode.js\" status"
}
```

## Two clones, one hub

`marketplace add` makes its own git clone at `~/.claude/plugins/marketplaces/tal-mashiah`, with `origin` pointing here. So this repo exists twice on a given machine: your working clone, and that cache.

Edit your working clone only. `marketplace update` pulls into the cache; a local edit there survives if it doesn't conflict, but if the pull can't apply, Claude Code discards the whole directory and re-clones, destroying it. Either way the edit never reaches GitHub or another machine — so cache edits are lost work at best and silently local-only at worst.

Session start reads the cache off local disk, never the network. A push therefore changes nothing until `marketplace update`, and skills keep working offline.

## Note

This repo is public. No secrets, no credentials, no client-specific context — reference env var *names*, never values. Anything employer-specific belongs in that project's own `.claude/skills/`, not here.
