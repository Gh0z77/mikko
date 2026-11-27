import { kvGet, kvSet } from './db';

interface Tries {
  count: number;
  until: number;
}

const MAX = 5;
const LOCK_MS = 15 * 60_000;

// Failed-guess counter kept in the database, so it holds across all serverless instances.
export async function lockedOut(key: string): Promise<boolean> {
  const tries = await kvGet<Tries>(`tries:${key}`);
  return Boolean(tries && tries.until > Date.now());
}

export async function recordFailure(key: string): Promise<void> {
  const tries = (await kvGet<Tries>(`tries:${key}`)) ?? { count: 0, until: 0 };
  const count = tries.until && tries.until <= Date.now() ? 1 : tries.count + 1; // a served lockout starts over
  await kvSet(`tries:${key}`, { count, until: count >= MAX ? Date.now() + LOCK_MS : 0 }, 24 * 60 * 60);
}

export const clearFailures = (key: string) => kvSet(`tries:${key}`, { count: 0, until: 0 }, 60);
