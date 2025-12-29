
# CXL Specification (Deterministic Boolean Constraints)

CXL is a deterministic, side-effect-free boolean expression language evaluated over frozen inputs (E,S,R,P,Y). It is designed to be structurally incapable of narrative and external calls.

Mandatory limits:
- Max expression length: 2048
- Max AST nodes: 256
- Max quantifier iterations: 64
- Max regex length: 128 (RE2-safe subset)
- Max string length in MATCH: 256

Error contract:
Any runtime error MUST evaluate to false and set an eval_error flag.
