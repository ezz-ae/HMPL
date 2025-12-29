import express from "express";
import { assertValid, validateDPkt, validateRDesc, validateCPack, assertHardenedKV } from "@hmpl/common";
import { tokenize } from "@hmpl/cxl";
import { parseExpr } from "@hmpl/cxl";
import { evalNode } from "@hmpl/cxl";

type EvalRequest = { E?: any; S?: any; R: any; P?: any; Y: any; C?: any };

const app = express();
app.use(express.json({ limit: "256kb" }));

app.get("/health", (_req, res) => res.json({ ok: true, service: "lane-sentinel" }));

/**
 * Enforces:
 * - Escalation Dominance
 * - Irreversibility Gate (example)
 * - Forbidden ops under high impact (example)
 *
 * Input: { R: R-DESC, Y: D-PKT, C: C-PACK (optional), E/S/P optional }
 */
app.post("/v1/evaluate", (req, res) => {
  try {
    const body = req.body as EvalRequest;
    assertValid(validateRDesc, body.R, "R-DESC");
    assertValid(validateDPkt, body.Y, "D-PKT");
    if (body.C) assertValid(validateCPack, body.C, "C-PACK");

    // Harden key-value fields (handoff.summary)
    if (body.Y.action === "ESCALATE") {
      if (!body.Y.handoff) throw new Error("ESCALATE requires handoff");
      assertHardenedKV(body.Y.handoff.summary, "handoff.summary");
    }

    // Non-negotiable escalation dominance gates:
    const mustEscalate =
      body.R.requires_human ||
      body.R.irreversible ||
      body.Y.risk.class === "CRITICAL" ||
      body.Y.confidence < 0.65;

    // If mustEscalate and model tries EXECUTE => VIOLATION
    if (mustEscalate && body.Y.action === "EXECUTE") {
      return res.status(409).json({
        compliant: false,
        violation: "HMPL-Axiom3",
        message: "Escalation dominance breached: execution attempted under escalation condition",
        enforced_action: "ESCALATE"
      });
    }

    // Evaluate optional CXL checks (if provided)
    const ctx = { E: body.E ?? {}, S: body.S ?? {}, R: body.R, P: body.P ?? {}, Y: body.Y };
    const checkResults = (body.C?.checks ?? []).map(ch => {
      const toks = tokenize(ch.expr);
      const ast = parseExpr(toks);
      const hit = Boolean(evalNode(ast as any, ctx as any));
      return { id: ch.id, severity: ch.severity, hit };
    });

    const anyCriticalHit = checkResults.some(r => r.hit && r.severity === "CRITICAL");
    if (anyCriticalHit) {
      return res.status(409).json({
        compliant: false,
        violation: "HMPL-CTS-CRITICAL",
        message: "Critical constraint violated (CXL)",
        enforced_action: "ESCALATE",
        checks: checkResults
      });
    }

    res.json({
      compliant: true,
      enforced_action: mustEscalate ? "ESCALATE" : body.Y.action,
      checks: checkResults
    });
  } catch (e: any) {
    res.status(400).json({ error: e?.message ?? String(e) });
  }
});

app.listen(8081, () => console.log("lane-sentinel on :8081"));
