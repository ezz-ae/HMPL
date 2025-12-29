import express from "express";
import fs from "node:fs";
import path from "node:path";
import { sha256Hex } from "@hmpl/common";

const app = express();
app.use(express.json({ limit: "64kb" }));

const ledgerDir = path.resolve(process.cwd(), ".ledger");
const ledgerFile = path.join(ledgerDir, "h-ledger.log.jsonl");

function ensureLedger() {
  if (!fs.existsSync(ledgerDir)) fs.mkdirSync(ledgerDir, { recursive: true });
  if (!fs.existsSync(ledgerFile)) fs.writeFileSync(ledgerFile, "", "utf8");
}

function lastHash(): string {
  ensureLedger();
  const txt = fs.readFileSync(ledgerFile, "utf8").trim();
  if (!txt) return "0".repeat(64);
  const last = txt.split(/\n/).slice(-1)[0];
  const obj = JSON.parse(last);
  return obj.hash as string;
}

app.get("/health", (_req, res) => res.json({ ok: true, service: "ledger-anchor" }));

/**
 * Anchors governance events without content:
 * { kind, ref_hash, meta? }
 */
app.post("/v1/anchor", (req, res) => {
  try {
    ensureLedger();
    const prev = lastHash();
    const ev = {
      ts: new Date().toISOString(),
      kind: String(req.body?.kind ?? "UNKNOWN"),
      ref_hash: String(req.body?.ref_hash ?? ""),
      meta: req.body?.meta ?? {},
      prev
    };
    const hash = sha256Hex(JSON.stringify(ev));
    const rec = { ...ev, hash };
    fs.appendFileSync(ledgerFile, JSON.stringify(rec) + "\n", "utf8");
    res.json({ anchored: true, hash, prev });
  } catch (e: any) {
    res.status(400).json({ error: e?.message ?? String(e) });
  }
});

app.get("/v1/tail", (_req, res) => {
  ensureLedger();
  const lines = fs.readFileSync(ledgerFile, "utf8").trim().split(/\n/).filter(Boolean);
  res.json({ count: lines.length, tail: lines.slice(-25).map(l => JSON.parse(l)) });
});

app.listen(8083, () => console.log("ledger-anchor on :8083"));
