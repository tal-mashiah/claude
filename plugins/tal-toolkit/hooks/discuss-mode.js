#!/usr/bin/env node
// Persistent discussion mode for Claude Code.
//
// The mode lives in a flag file keyed by session id, so it cannot leak between
// sessions or projects. Two entry points read it:
//
//   prompt  - UserPromptSubmit hook. Re-injects the rules on every turn, which
//             is the whole point: a one-shot prompt decays, this does not.
//   status  - statusLine command. Makes the mode visible.
//
// Run with `off <session-id>` to clear the flag by hand.

const fs = require('fs');
const os = require('os');
const path = require('path');

const FLAG_DIR = path.join(os.homedir(), '.claude', 'discuss-mode');

const flagFor = (id) =>
  path.join(FLAG_DIR, String(id).replace(/[^A-Za-z0-9_-]/g, '_'));

const RULES = `You are in DISCUSS MODE.

Answer the question, then stop. Do not close the turn with an offer to build,
implement, or take a first pass. Do not append next steps. Do not treat a
question as a work request with the work implied — a trailing proposal every
turn is pressure to decide, and deferring that decision is the point.

Do not write or edit files, run state-changing commands, or produce a
file-by-file plan unless asked. Reading the repo is expected — ground answers in
the actual code, not generic advice.

Push back and name the alternative you would pick. Ask when something is
genuinely ambiguous. Keep a conversational length and register.

Tal ends this by saying so ("build it", "go ahead"). Confirm once, then run
\`node <this-script> off <session_id>\` to clear the mode before doing any work.
Typing \`/discuss off\` also clears it.`;

const ENDED = `DISCUSS MODE ENDED — Tal just closed it. The flag is already
cleared; you do not need to run anything. Acknowledge in one line and get to
work on what was asked.`;

// Leading filler Tal puts in front of a real instruction: "ok let's do a plan".
const FILLER = /^(ok(ay)?|alright|right|cool|nice|great|so|now|yes|yeah|yep|sure|perfect)[,!.\s]+/;

// Exit phrases. Deliberately NOT a substring match: "should we go ahead with
// option 2?" is a normal thing to say mid-discussion and must not kill the
// mode. Real exits are short and imperative, so a question mark or a long
// message disqualifies the match before any pattern is tried.
function isExit(raw) {
  let t = String(raw).trim().toLowerCase().replace(/[.!]+$/, '');
  if (t.includes('?')) return false;
  while (FILLER.test(t)) t = t.replace(FILLER, '');
  if (t.split(/\s+/).filter(Boolean).length > 8) return false;
  return (
    /^(off|exit|done|stop|end|quit|build it|go ahead|do it|ship it)$/.test(t) ||
    /^let'?s\s+(build|do|make|implement|start|write|plan|go)\b/.test(t) ||
    /^(build|implement|make|write|do)\s+(it|this|that|a plan|the plan)\b/.test(t)
  );
}

function readInput() {
  try {
    return JSON.parse(fs.readFileSync(0, 'utf8') || '{}');
  } catch {
    return {};
  }
}

const isOn = (id) => Boolean(id) && fs.existsSync(flagFor(id));

function turnOn(id) {
  fs.mkdirSync(FLAG_DIR, { recursive: true });
  fs.writeFileSync(flagFor(id), new Date().toISOString());
}

function turnOff(id) {
  try {
    fs.unlinkSync(flagFor(id));
  } catch {
    /* already off */
  }
}

function inject(text) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'UserPromptSubmit',
        additionalContext: text,
      },
      suppressOutput: true,
    })
  );
}

const mode = process.argv[2];

if (mode === 'prompt') {
  const input = readInput();
  const id = input.session_id;
  const text = String(input.prompt || '').trim();
  const invoked = /^\/(tal-toolkit:)?discuss\b/i.test(text);

  if (invoked && /\b(off|done|end|exit|stop)\b/i.test(text)) {
    turnOff(id);
  } else if (invoked) {
    turnOn(id);
    inject(RULES);
  } else if (isOn(id) && isExit(text)) {
    turnOff(id);
    inject(ENDED);
  } else if (isOn(id)) {
    inject(RULES);
  }
  process.exit(0);
}

if (mode === 'status') {
  const input = readInput();
  const id = input.session_id;
  const model = input.model?.display_name || input.model?.id || '';
  const dir = path.basename(
    input.workspace?.current_dir || input.cwd || process.cwd()
  );
  const parts = [];
  if (isOn(id)) parts.push('[1;35m● DISCUSS[0m');
  if (model) parts.push(`[2m${model}[0m`);
  if (dir) parts.push(`[2m${dir}[0m`);
  process.stdout.write(parts.join('  '));
  process.exit(0);
}

if (mode === 'off') {
  turnOff(process.argv[3]);
  process.exit(0);
}

if (mode === 'on') {
  turnOn(process.argv[3]);
  process.exit(0);
}

process.stderr.write('usage: discuss-mode.js prompt|status|on <id>|off <id>\n');
process.exit(1);
