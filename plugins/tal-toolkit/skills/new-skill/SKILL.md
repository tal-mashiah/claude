---
name: new-skill
description: Author a new skill (or command/agent) into Tal's personal Claude Code marketplace repo at tal-mashiah/claude. Use when the user says "make this a skill", "add a skill", "save this workflow", "I want to reuse this in other sessions", "add this to my toolkit/marketplace", or asks how to write or fix a SKILL.md. Handles the repo layout, frontmatter conventions, and the commit/push/reload cycle.
---

# New Skill

Add a new capability to Tal's personal marketplace repo so it loads in every session on every machine.

## Locate the repo

The marketplace repo is `tal-mashiah/claude`. Find the working copy before editing:

1. Check `E:\claude` (the usual clone on this Windows machine).
2. Otherwise check `~/.claude/plugins/marketplaces/tal-mashiah` — that is the *installed cache*, itself a git clone of this repo. **Never edit there.** `marketplace update` pulls into it, so edits are not wiped, which is worse than it sounds: they silently never reach GitHub or any other machine, and they can conflict with an incoming pull and block future updates. Clone the repo fresh instead.
3. If no clone exists: `gh repo clone tal-mashiah/claude`.

## Decide what is being built

| Trigger | Build |
|---|---|
| Claude should apply this automatically when the situation arises | **skill** — `plugins/tal-toolkit/skills/<name>/SKILL.md` |
| Tal wants to type `/name` to invoke it | **command** — `plugins/tal-toolkit/commands/<name>.md` |
| It needs its own context window / parallel fan-out | **agent** — `plugins/tal-toolkit/agents/<name>.md` |
| It must fire on an event (every commit, every file write) | **hook** — `plugins/tal-toolkit/hooks/hooks.json` |

When unsure between skill and command, ask. The difference matters: a skill costs description tokens every session and fires on Claude's judgement; a command costs nothing until invoked.

## Write it

Read `references/authoring.md` for frontmatter rules, description-writing method, and the anti-patterns. The single highest-leverage part is the `description` field — it is the only thing Claude sees when deciding whether to load the skill.

Keep `SKILL.md` under ~150 lines. Push depth into sibling files (`references/*.md`, `scripts/*`) and link to them by relative path; they load only when Claude actually opens them.

## Ship it

```bash
git add -A
git commit -m "Add <name> skill"
git push
```

Then reload so the running session picks it up:

- On this machine: `/plugin marketplace update tal-mashiah`
- On a machine that has never had it: `/plugin marketplace add tal-mashiah/claude` then `/plugin install tal-toolkit@tal-mashiah`

Bump `version` in `plugins/tal-toolkit/.claude-plugin/plugin.json` when adding or meaningfully changing a capability, so updates are visible in `/plugin`.

## Verify

Do not claim it works because the file exists. Confirm the skill is actually listed after reload, and state plainly if it is not — a malformed frontmatter block makes a skill silently invisible.
