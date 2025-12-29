import { Tok } from "./tokenize.js";

export type Node =
  | {k:"lit"; v:any}
  | {k:"path"; root:string; parts:(string|number)[]}
  | {k:"arr"; items: Node[]}
  | {k:"un"; op:"NOT"; a: Node}
  | {k:"bin"; op:string; a: Node; b: Node}
  | {k:"any"; list: Node; pred: Node};

function peek(toks: Tok[], i: number) { return toks[i]; }

export function parseExpr(toks: Tok[]): Node {
  let i = 0;

  const parsePrimary = (): Node => {
    const t = peek(toks, i);
    if (!t) throw new Error("CXL parse: unexpected end");
    if (t.t === "LP") { i++; const e = parseOr(); if (peek(toks, i)?.t !== "RP") throw new Error("CXL parse: missing )"); i++; return e; }
    if (t.t === "LB") {
      i++;
      const items: Node[] = [];
      while (peek(toks, i) && peek(toks, i)!.t !== "RB") {
        items.push(parseOr());
        if (peek(toks, i)?.t === "COMMA") i++;
      }
      if (peek(toks, i)?.t !== "RB") throw new Error("CXL parse: missing ]");
      i++;
      return {k:"arr", items};
    }
    if (t.t === "NUMBER") { i++; return {k:"lit", v: t.v}; }
    if (t.t === "STRING") { i++; return {k:"lit", v: t.v}; }
    if (t.t === "BOOL") { i++; return {k:"lit", v: t.v}; }
    if (t.t === "NULL") { i++; return {k:"lit", v: null}; }

    if (t.t === "IDENT") {
      i++;
      const root = t.v;
      const parts: (string|number)[] = [];
      while (true) {
        const dot = peek(toks, i);
        if (dot && dot.t === "OP" && dot.v === ".") {
          i++;
          const seg = peek(toks, i);
          if (!seg || seg.t !== "IDENT") throw new Error("CXL parse: expected IDENT after '.'");
          parts.push(seg.v);
          i++;
          continue;
        }
        const lb = peek(toks, i);
        if (lb && lb.t === "LB") {
          // index: [NUMBER]
          i++;
          const num = peek(toks, i);
          if (!num || num.t !== "NUMBER") throw new Error("CXL parse: expected NUMBER in [ ]");
          parts.push(num.v);
          i++;
          if (peek(toks, i)?.t !== "RB") throw new Error("CXL parse: expected ]");
          i++;
          continue;
        }
        break;
      }
      return {k:"path", root, parts};
    }

    throw new Error(`CXL parse: unexpected token ${t.t}`);
  };

  const parseUnary = (): Node => {
    const t = peek(toks, i);
    if (t && t.t === "OP" && t.v === "NOT") { i++; return {k:"un", op:"NOT", a: parseUnary()}; }
    return parsePrimary();
  };

  const parseQuantOrComp = (): Node => {
    const t = peek(toks, i);
    if (t && t.t === "OP" && (t.v === "ANY" || t.v === "ALL" || t.v === "NONE")) {
      const q = t.v;
      i++;
      if (peek(toks, i)?.t !== "LP") throw new Error("CXL parse: expected ( after quantifier");
      i++;
      const list = parseOr();
      if (peek(toks, i)?.t !== "COMMA") throw new Error("CXL parse: expected comma in quantifier");
      i++;
      const pred = parseOr();
      if (peek(toks, i)?.t !== "RP") throw new Error("CXL parse: expected ) after quantifier");
      i++;
      if (q !== "ANY") throw new Error("CXL subset supports ANY only");
      return {k:"any", list, pred};
    }

    let left = parseUnary();
    const op = peek(toks, i);
    if (op && op.t === "OP" && ["==","!=","<","<=",">",">=","IN"].includes(op.v)) {
      i++;
      const right = parseUnary();
      return {k:"bin", op: op.v, a: left, b: right};
    }
    return left;
  };

  const parseAnd = (): Node => {
    let n = parseQuantOrComp();
    while (true) {
      const t = peek(toks, i);
      if (t && t.t === "OP" && t.v === "AND") { i++; n = {k:"bin", op:"AND", a:n, b: parseQuantOrComp()}; }
      else break;
    }
    return n;
  };

  const parseOr = (): Node => {
    let n = parseAnd();
    while (true) {
      const t = peek(toks, i);
      if (t && t.t === "OP" && t.v === "OR") { i++; n = {k:"bin", op:"OR", a:n, b: parseAnd()}; }
      else break;
    }
    return n;
  };

  const expr = parseOr();
  if (i !== toks.length) throw new Error("CXL parse: trailing tokens");
  return expr;
}
