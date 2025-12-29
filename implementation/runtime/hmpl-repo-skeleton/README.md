# HMPL Implementation Repo Skeleton
A minimal, runnable reference implementation of **HMPL v1.0+** primitives:
- **Schemas** (Dash artifacts)
- **Validators** (schema + hardening)
- **Lane Sentinel** (escalation / freeze enforcement)
- **Policy Compiler** (H-PREC → P-BNDL candidate)
- **Ledger Anchor** (hash-chained governance event log)

This repo is intentionally **behavior-agnostic**: it does not “align” models, it **enforces constitutional incapacity** at the system boundary.

## What you get
- `schemas/` canonical JSON Schemas (hardened)
- `packages/common/` shared types + AJV validators + hardening guard
- `services/dash-gateway/` validates inbound/outbound Dash packets
- `services/lane-sentinel/` enforces Lane Change Law + IFP (freeze)
- `services/policy-compiler/` compiles H-PREC into P-BNDL candidate
- `services/ledger-anchor/` append-only hash-chained event log (H-Ledger stub)
- `tools/cxl/` tiny deterministic CXL evaluator (subset)

## Quickstart
Requirements: Node.js 20+

```bash
npm install
npm run build
npm run dev
```

Then:
- Dash Gateway: http://localhost:8080/health
- Lane Sentinel: http://localhost:8081/health
- Policy Compiler: http://localhost:8082/health
- Ledger Anchor: http://localhost:8083/health

## Demo flow (local)
1) Send an Event Packet to Dash Gateway:
```bash
curl -s http://localhost:8080/v1/event -H "content-type: application/json" -d @examples/e-pkt.query.json | jq .
```

2) Ask Lane Sentinel to evaluate a Decision Packet with Risk + Constraints:
```bash
curl -s http://localhost:8081/v1/evaluate -H "content-type: application/json" -d @examples/eval.request.json | jq .
```

3) Compile a human precedent into a policy bundle candidate:
```bash
curl -s http://localhost:8082/v1/compile -H "content-type: application/json" -d @examples/h-prec.sample.json | jq .
```

4) Anchor a governance event hash into the H-Ledger stub:
```bash
curl -s http://localhost:8083/v1/anchor -H "content-type: application/json" -d @examples/anchor.sample.json | jq .
```

## Notes
- The Ledger here is a **local file-based** hash chain to demonstrate the proof surface.
- Replace `services/ledger-anchor` with your real ledger (public or regulator-accessible) while keeping the event shape identical.
- The CXL engine is intentionally small; swap it for a formally verified engine if needed—**never** expand it to allow narrative.

## License
MIT (template). Replace as needed.
