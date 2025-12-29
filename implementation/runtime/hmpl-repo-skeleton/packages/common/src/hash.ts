import crypto from "node:crypto";

export function sha256Hex(input: string): string {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

export function stableStringify(obj: unknown): string {
  // Deterministic stringify (sorted keys)
  const seen = new WeakSet<object>();
  const sorter = (value: any): any => {
    if (value && typeof value === "object") {
      if (seen.has(value)) throw new Error("cycle detected");
      seen.add(value);
      if (Array.isArray(value)) return value.map(sorter);
      const out: Record<string, any> = {};
      for (const k of Object.keys(value).sort()) out[k] = sorter(value[k]);
      return out;
    }
    return value;
  };
  return JSON.stringify(sorter(obj));
}

export function hashObject(obj: unknown): string {
  return sha256Hex(stableStringify(obj));
}
