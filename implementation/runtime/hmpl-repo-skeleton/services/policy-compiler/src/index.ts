import express from "express";
import { assertValid, validateHPrec, hashObject } from "@hmpl/common";

const app = express();
app.use(express.json({ limit: "256kb" }));

app.get("/health", (_req, res) => res.json({ ok: true, service: "policy-compiler" }));

/**
 * Minimal deterministic compiler:
 * - validates H-PREC
 * - produces a P-BNDL *candidate* (unsigned) with a placeholder lane matrix rule keyed by decision_code
 *
 * In real deployments:
 * - compile policy_delta into rules
 * - run contradiction checks
 * - require A2/A3/A4 signatures before publish
 */
app.post("/v1/compile", (req, res) => {
  try {
    assertValid(validateHPrec, req.body, "H-PREC");
    const hp = req.body as any;

    const issued_at = new Date().toISOString();
    const candidate = {
      policy_id: `POL_${hp.domain}_BASE`,
      version: "0.0.1",
      domain: hp.domain,
      issued_at,
      codes: [
        { code: hp.decision_code, kind: "DECISION" },
        ...(hp.exception_code ? [{ code: hp.exception_code, kind: "EXCEPTION_CODE" }] : [])
      ],
      matrices: {
        lane_matrix: {
          default_lane: "ESCALATE",
          rules: [
            { when: `Y.action == "EXECUTE" AND R.requires_human == false AND R.irreversible == false`, then: { lane: "EXECUTE" } }
          ]
        },
        op_matrix: { op_limits: [] }
      },
      checks: [
        { id: "CXL_IRREV_GATE", severity: "CRITICAL", lang: "CXL", expr: `(R.irreversible == true) AND (Y.action == "EXECUTE")` }
      ],
      signatures: []
    };

    const digest = hashObject(candidate);
    res.json({ candidate, digest });
  } catch (e: any) {
    res.status(400).json({ error: e?.message ?? String(e) });
  }
});

app.listen(8082, () => console.log("policy-compiler on :8082"));
