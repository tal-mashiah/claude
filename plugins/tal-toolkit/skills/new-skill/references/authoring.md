# Authoring reference

## Skill frontmatter

```yaml
---
name: kebab-case-name          # required; must match the directory name
description: ...                # required; see below - this is the whole ballgame
tools: Read, Glob, Grep, Bash   # optional; restricts what the skill may use
---
```

`name` must match the containing directory exactly. A mismatch is a common cause of a skill not loading.

## Writing the description

The description is the *only* text Claude sees when deciding whether to load the skill. Everything else in the file is invisible until that decision is made. So the description is not a summary — it is a **trigger condition**.

Structure it as: what it does, then when to use it, then the literal phrases that should fire it.

Good:
```
Audit and improve CLAUDE.md files in repositories. Use when user asks to check,
audit, update, improve, or fix CLAUDE.md files. Also use when the user mentions
"CLAUDE.md maintenance" or "project memory optimization".
```

Bad:
```
A helpful skill for working with documentation.
```

Rules:
- Include the words Tal actually says, in quotes, not paraphrases of them.
- Include negative boundaries when a skill would otherwise over-fire: "Do not use for X."
- Third person, describing when *Claude* should act. Not "I will help you..."
- Long is fine here. Vague is not.

## Body

Write instructions for an agent that has full tool access and no memory of why the skill exists. Concretely:

- **Imperative, not descriptive.** "Run `npm test` before committing" beats "it is a good idea to test."
- **Name real paths, commands, and file names.** Guesswork is where agents go wrong.
- **State the failure modes.** "Never edit the installed cache under `~/.claude/plugins`" saves more time than three paragraphs of happy path.
- **Say how to verify.** A skill that cannot be checked will silently rot.
- **Do not restate general good practice.** Claude already knows to write tests. Capture only what is specific to Tal, this repo, or this workflow.

## Progressive disclosure

`SKILL.md` is loaded whole once triggered, so keep it lean. Move to sibling files:

```
skills/my-skill/
├── SKILL.md              # the decision + the workflow
├── references/
│   ├── authoring.md      # deep detail, loaded on demand
│   └── examples.md
└── scripts/
    └── check.sh          # executable helpers
```

Link them by relative path from SKILL.md so Claude knows they exist and when to open them.

## Commands vs skills

A command file (`commands/<name>.md`) is a prompt template invoked by the user typing `/name`. Frontmatter:

```yaml
---
description: One line shown in the slash-command menu
argument-hint: <pr-number>     # optional
---
```

Use `$ARGUMENTS` (or `$1`, `$2`) in the body to interpolate what the user typed.

Commands cost zero context until invoked. Skills cost their description every session. When in doubt and the workflow is one Tal will deliberately reach for, make it a command.

## Anti-patterns

- **A skill for something Claude already does well.** Adds noise, fires at the wrong times.
- **Secrets in the repo.** It is public. API keys go in env vars; reference the variable name, never the value.
- **Client- or employer-specific detail** in a public repo. Keep those in a project-level `.claude/skills/` inside that repo instead.
- **One giant skill covering five unrelated things.** Its description cannot trigger accurately. Split it.
- **Editing the installed cache** at `~/.claude/plugins/marketplaces/tal-mashiah` instead of your own clone. The cache is a real clone of this repo with `origin` pointing at it. `marketplace update` pulls into it: a non-conflicting edit survives, but when the pull cannot apply, Claude Code reports a stale directory, deletes it and re-clones — destroying the edit. Neither outcome pushes anything. Verified by experiment, both branches.
