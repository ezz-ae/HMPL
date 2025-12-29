/**
 * HMPL schema hardening guard (runtime).
 * Rejects narrative smuggling patterns even if schema passes.
 *
 * This is NOT "NLP". It's a strict structural filter:
 * - key pattern: ^[a-z0-9_]{1,32}$
 * - maxProperties: 32
 * - string maxLength: 160
 * - disallow multi-sentence prose indicators (\n, long punctuation density, etc.)
 */
const KEY_RE = /^[a-z0-9_]{1,32}$/;

export type KV = Record<string, string|number|boolean|null>;

export function assertHardenedKV(obj: unknown, ctx: string): asserts obj is KV {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) throw new Error(`${ctx}: not an object`);
  const entries = Object.entries(obj as Record<string, unknown>);
  if (entries.length > 32) throw new Error(`${ctx}: too many properties`);
  for (const [k, v] of entries) {
    if (!KEY_RE.test(k)) throw new Error(`${ctx}: invalid key '${k}'`);
    if (typeof v === "string") {
      if (v.length > 160) throw new Error(`${ctx}: value too long for '${k}'`);
      // Anti-prose heuristics (cheap + deterministic)
      if (v.includes("\n")) throw new Error(`${ctx}: newline forbidden for '${k}'`);
      const punct = (v.match(/[\.,;:!?]/g) ?? []).length;
      if (punct >= 8 && v.length >= 80) throw new Error(`${ctx}: punctuation density suggests prose for '${k}'`);
      if ((v.match(/\s/g) ?? []).length > 40 && v.length >= 120) throw new Error(`${ctx}: whitespace density suggests prose for '${k}'`);
    } else if (typeof v === "number" || typeof v === "boolean" || v === null) {
      // ok
    } else {
      throw new Error(`${ctx}: invalid value type for '${k}'`);
    }
  }
}
