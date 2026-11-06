import type { Rng } from '../game/rng';
import { QUOTES, type Quote } from './quotes.ts';

/** A random quote, never the same as the one just shown. */
export function pickQuote(previousId: string | null, rng: Rng = Math.random): Quote {
  const pool = QUOTES.filter((q) => q.id !== previousId);
  return pool[Math.floor(rng() * pool.length)];
}

/** Stable, even left-page number for a quote; the right-hand page is one more. */
export function pageNumber(quote: Quote): number {
  return 10 + QUOTES.findIndex((q) => q.id === quote.id) * 8;
}
