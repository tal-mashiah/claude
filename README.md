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

## Note

This repo is public. No secrets, no credentials, no client-specific context — reference env var *names*, never values. Anything employer-specific belongs in that project's own `.claude/skills/`, not here.
