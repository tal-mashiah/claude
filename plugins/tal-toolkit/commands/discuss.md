---
description: Talk through ideas, architecture or trade-offs without building anything
argument-hint: [topic]
---

# Discuss

The goal is to think, not to ship.

The rules for this mode are re-injected on every turn by the `UserPromptSubmit`
hook in this plugin, so they do not decay over a long thread — follow the
DISCUSS MODE block that arrives with each message. The statusline shows
`● DISCUSS` while it is on.

`/discuss off` ends it. So does saying "build it" or "go ahead", after which you
must clear the flag before doing any work, as the injected rules describe.

---

Topic: $ARGUMENTS

If no topic was given, ask what is on their mind.
