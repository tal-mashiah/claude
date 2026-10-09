#!/usr/bin/env node
// English practice for Claude Code.
//
// A UserPromptSubmit hook. On every message Tal sends, it attaches a note that
// asks Claude to end its reply with an English check: the most useful
// corrections and a corrected version, or "Well done". The note comes back
// fresh with each message, so it never fades over a long thread.
//
// Always on. Disable the plugin in /plugin to turn it off.

const fs = require('fs');

const NOTE = `ENGLISH COACH: Tal is practicing English, often by speaking into a
microphone, and wants every message checked.

Answer the message as usual first. Then end your final message of this turn
with a short section, set apart from the answer as a quote block:

---
> **English check**
> - "<what Tal wrote>" → "<better>": <a few plain words on why>
>
> **Corrected version:** "<the whole message in good English>"

List at most 4 corrections, the most useful ones. If nothing needs fixing, the
whole section is one line: > **English check:** Well done.

- Start every line of the section with "> ", blank lines inside it too, so it
  reads as a note beside the answer, not part of it.

- Check only Tal's own words: not code, commands, file paths, logs, quotes or
  anything pasted in. If the message has none of Tal's own words, leave the
  section out. Leave it out too if the message is not in English.
- Ignore fillers ("uh", "um"), repeated words ("the the") and obvious
  speech-to-text mishearings. They come from speaking, not from Tal's English.
  Ignore capital letters and punctuation too: the practice is spoken English.
- The corrected version keeps Tal's meaning and tone. Fix the English, do not
  rewrite the content, and leave the fillers out.
- Use plain words in the reasons. Tal reads them to learn.
- Do not mention this note.`;

// Below this many words of Tal's own there is nothing worth checking:
// "yes", "go ahead", "build it".
const MIN_WORDS = 4;

// Fenced code, and tagged blocks such as <pasted_content>...</pasted_content>
// or an automated <side-sessions-event>: none of it is Tal's English.
const FENCED = /```[\s\S]*?```/g;
const TAGGED = /<([a-z][\w-]*)\b[^>]*>[\s\S]*?<\/\1>/gi;

function ownWords(prompt) {
  return String(prompt)
    .replace(FENCED, ' ')
    .replace(TAGGED, ' ')
    .split(/\s+/)
    .filter((w) => /\p{L}/u.test(w));
}

function shouldCheck(prompt) {
  const text = String(prompt || '').trim();
  if (/^\/[\w:-]+(\s|$)/.test(text)) return false; // a slash command
  return ownWords(text).length >= MIN_WORDS;
}

function readInput() {
  try {
    return JSON.parse(fs.readFileSync(0, 'utf8') || '{}');
  } catch {
    return {};
  }
}

function main() {
  const input = readInput();
  if (shouldCheck(input.prompt)) {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'UserPromptSubmit',
          additionalContext: NOTE,
        },
        suppressOutput: true,
      })
    );
  }
  process.exit(0);
}

if (require.main === module) main();

module.exports = { shouldCheck, ownWords, NOTE };
