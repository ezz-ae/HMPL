export type Severity = "LOW"|"MED"|"HIGH"|"CRITICAL";
export type Domain = "GENERIC"|"GOV"|"FINANCE"|"HEALTH"|"REAL_ESTATE"|"SECURITY"|"LEGAL"|"EDU";

export type Lane = "EXECUTE"|"REFUSE"|"ESCALATE"|"REQUEST_SCHEMA"|"REQUEST_INFO";

export type EPkt = {
  id: string; ts: string; nonce: string;
  type: string; channel: string;
  trace?: { session_id?: string; request_id?: string; }
};

export type RDesc = { domain: Domain; impact_class: "LOW"|"MED"|"HIGH"|"CRITICAL"; irreversible: boolean; requires_human: boolean };

export type Op = { op: "READ"|"WRITE"|"CALC"|"LOOKUP"|"OPEN_CASE"|"CLOSE_CASE"|"NOOP"; args: Record<string, string|number|boolean|null> };

export type Handoff = { case_id: string; summary: Record<string, string|number|boolean|null>; required_decision: string; evidence: {kind:"FACT"|"CONSTRAINT"|"STATE"|"RISK"|"LOGREF"; ref:string}[] };

export type DPkt = { action: Lane; confidence: number; risk: {level:number; class:"LOW"|"MED"|"HIGH"|"CRITICAL"}; plan: Op[]; handoff?: Handoff };

export type CPack = {
  version: string;
  domain: Domain;
  invariants: {id:string; label:string; severity: Severity}[];
  forbidden: {id:string; label:string; severity: Severity}[];
  checks: {id:string; severity: Severity; lang:"CXL"; when?: string; expr: string}[];
};

export type HPrec = {
  precedent_id: string; domain: Domain; issued_at: string;
  case_id: string; decision_code: string;
  exception_code?: string;
  facts: Record<string, string|number|boolean|null>;
  constraints_triggered?: string[];
  required_lane?: "EXECUTE"|"REFUSE"|"ESCALATE";
  policy_delta?: Record<string, unknown>;
  signatures: {signer:string; alg:"ed25519"|"p256"|"secp256k1"; sig:string}[];
};

export type PBndl = {
  policy_id: string; version: string; domain: Domain;
  issued_at: string; expires_at?: string;
  codes: {code:string; kind:"DECISION"|"ACTION"|"REASON_CODE"|"EXCEPTION_CODE"}[];
  matrices: {
    lane_matrix: { default_lane: Lane; rules: {when:string; then:{lane:Lane; required_decision_code?: string}}[] };
    op_matrix: { op_limits: {when:string; allow_ops:string[]; deny_ops:string[]}[] };
  };
  checks: {id:string; severity: Severity; lang:"CXL"; when?: string; expr: string}[];
  precedent_index?: {precedent_id:string; hash:string; issued_at:string}[];
  signatures: {signer:string; alg:"ed25519"|"p256"|"secp256k1"; sig:string}[];
};
