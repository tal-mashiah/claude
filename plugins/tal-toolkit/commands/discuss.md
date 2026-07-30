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

It ends when Tal says so — `off` on its own, "build it", "go ahead", "ok let's
do a plan". The hook clears the flag itself and injects a DISCUSS MODE ENDED
notice; nothing needs to be run by hand.

---

Topic: $ARGUMENTS

If no topic was given, ask what is on their mind.
