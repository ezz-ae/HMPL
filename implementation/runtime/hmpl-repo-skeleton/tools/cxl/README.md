# CXL (Subset) Engine
This is a tiny deterministic evaluator for a safe subset of CXL:
- AND / OR / NOT
- == != < <= > >=
- IN (array literal)
- ANY(list, predicate) with `it.<field>` comparisons
- Paths rooted at: E, S, R, P, Y

It is intentionally small. If you replace it, keep these rules:
- Side-effect free
- No string concatenation
- No functions that allow narrative generation
