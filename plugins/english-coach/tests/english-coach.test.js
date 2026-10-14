// Run with: node --test plugins/english-coach/tests/*.test.js
const test = require('node:test');
const assert = require('node:assert');
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const { shouldCheck, NOTE } = require('../hooks/english-coach.js');

const SCRIPT = path.join(__dirname, '..', 'hooks', 'english-coach.js');

const run = (input) =>
  execFileSync('node', [SCRIPT], { input: JSON.stringify(input) }).toString();

test('a normal message is checked', () => {
  assert.ok(shouldCheck('Could we add this hook to the repo and explain how it works?'));
});

test('short replies are not checked', () => {
  for (const p of ['yes', 'build it', 'ok go ahead', '  off  ', '']) {
    assert.strictEqual(shouldCheck(p), false, p);
  }
});

test('four words is enough', () => {
  assert.ok(shouldCheck('always on, separate plugin'));
});

test('slash commands are not checked', () => {
  assert.strictEqual(shouldCheck('/discuss talk about the new plugin layout please'), false);
  assert.strictEqual(shouldCheck('/tal-toolkit:discuss something long enough here'), false);
});

test('a message starting with a path is still checked', () => {
  assert.ok(shouldCheck('/c/Users/talma has a file that I want you to read'));
});

test('pasted blocks and code do not count as words', () => {
  const pasted = '<pasted_content id="x">a long log line with many many words in it</pasted_content>';
  assert.strictEqual(shouldCheck(`${pasted} why?`), false);
  assert.ok(shouldCheck(`${pasted} why does this error happen here?`));
  assert.strictEqual(shouldCheck('```\nconst a = b + c and more words\n```\nfix it'), false);
});

test('an automated event is not checked', () => {
  const event = '<side-sessions-event>The session finished its work on the branch.</side-sessions-event>';
  assert.strictEqual(shouldCheck(event), false);
});

test('numbers and symbols are not words', () => {
  assert.strictEqual(shouldCheck('42 -> 43 + 7'), false);
});

test('the hook prints the note for a message worth checking', () => {
  const out = JSON.parse(run({ prompt: 'I want to understand what is the best approach' }));
  assert.strictEqual(out.hookSpecificOutput.hookEventName, 'UserPromptSubmit');
  assert.match(out.hookSpecificOutput.additionalContext, /English check/);
});

test('the note asks for the check as a quote block', () => {
  assert.match(NOTE, /^> \*\*English check\*\*$/m);
  assert.match(NOTE, /^> \*\*Corrected version:\*\*/m);
});

test('the note asks for the mistake crossed out, the fix in a box and the reason below, quoted exactly', () => {
  assert.match(NOTE, /"we need a ~~\*\*whight\*\*~~" → "we need a `weight`"\n>   \*spelling: /);
  assert.match(NOTE, /exactly as written/);
  assert.match(NOTE, /if they\s+are the same, drop the line/);
});

test('the note forbids filler lines like "good as is"', () => {
  assert.match(NOTE, /no sentence before the list/);
  assert.match(NOTE, /no "good as is"/);
});

test('the hook prints nothing for a short reply or bad input', () => {
  assert.strictEqual(run({ prompt: 'go ahead' }), '');
  assert.strictEqual(
    execFileSync('node', [SCRIPT], { input: 'not json' }).toString(),
    ''
  );
});
