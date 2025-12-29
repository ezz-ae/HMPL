import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function loadSchema(relativeToRepoRoot: string): any {
  // In compiled dist, repo root is 3 levels up from packages/common/dist/
  const repoRoot = path.resolve(__dirname, "../../../");
  const p = path.join(repoRoot, relativeToRepoRoot);
  return JSON.parse(fs.readFileSync(p, "utf8"));
}
