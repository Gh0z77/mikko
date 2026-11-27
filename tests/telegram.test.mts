import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { esc, verifyInitData } from '../lib/telegram.ts';

const token = '123456:TEST-token';
const now = Date.UTC(2026, 10, 26);

function sign(fields: Record<string, string>, botToken = token) {
  const check = Object.entries(fields).map(([k, v]) => `${k}=${v}`).sort().join('\n');
  const secret = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const hash = createHmac('sha256', secret).update(check).digest('hex');
  return new URLSearchParams({ ...fields, hash }).toString();
}

const fields = {
  auth_date: String(Math.floor(now / 1000) - 60),
  query_id: 'AAE1',
  user: JSON.stringify({ id: 42, first_name: 'Aziza', username: 'aziza' }),
};

test('accepts correctly signed initData', () => {
  assert.equal(verifyInitData(sign(fields), token, 86400, now)?.id, 42);
});

test('rejects tampered, foreign-token and stale initData', () => {
  const tampered = sign(fields).replace('Aziza', 'Hacker');
  assert.equal(verifyInitData(tampered, token, 86400, now), null);
  assert.equal(verifyInitData(sign(fields, '999:other'), token, 86400, now), null);
  const stale = { ...fields, auth_date: String(Math.floor(now / 1000) - 2 * 86400) };
  assert.equal(verifyInitData(sign(stale), token, 86400, now), null);
  assert.equal(verifyInitData('', token), null);
  assert.equal(verifyInitData('hash=zz', token), null);
});

test('escapes Telegram HTML', () => {
  assert.equal(esc('Ali <3 & co'), 'Ali &lt;3 &amp; co');
});
