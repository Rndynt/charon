import test from 'node:test';
import assert from 'node:assert/strict';
import { parseNumericInput } from '../src/utils.js';
import { signalKey } from '../src/signals/serverClient.js';

test('parseNumericInput parses basic and suffixed values', () => {
  assert.equal(parseNumericInput('5'), 5);
  assert.equal(parseNumericInput('1.5m'), 1_500_000);
  assert.equal(parseNumericInput('100k'), 100_000);
  assert.equal(parseNumericInput('off'), 0);
});

test('parseNumericInput rejects invalid values', () => {
  assert.equal(parseNumericInput('abc'), null);
  assert.equal(parseNumericInput(''), null);
});

test('signalKey includes sources so mint-only duplicates are avoided', () => {
  const mint = 'So11111111111111111111111111111111111111112';
  const a = signalKey({ mint, sources: ['fee_claim', 'trending'] });
  const b = signalKey({ mint, sources: ['fee_claim', 'graduated'] });
  assert.notEqual(a, b);
});
