import { Node } from "./parse.js";

export type Ctx = { E:any; S:any; R:any; P:any; Y:any; it?: any };

function getPath(ctx: Ctx, root: string, parts: (string|number)[]) {
  let cur: any;
  if (root === "E") cur = ctx.E;
  else if (root === "S") cur = ctx.S;
  else if (root === "R") cur = ctx.R;
  else if (root === "P") cur = ctx.P;
  else if (root === "Y") cur = ctx.Y;
  else if (root === "it") cur = ctx.it;
  else throw new Error(`CXL eval: unknown root ${root}`);

  for (const p of parts) {
    if (cur == null) return null;
    cur = cur[p as any];
  }
  return cur;
}

function asArray(v: any): any[] {
  if (Array.isArray(v)) return v;
  return [];
}

export function evalNode(n: Node, ctx: Ctx): any {
  switch (n.k) {
    case "lit": return n.v;
    case "arr": return n.items.map(it => evalNode(it, ctx));
    case "path": return getPath(ctx, n.root, n.parts);
    case "un": return !Boolean(evalNode(n.a, ctx));
    case "bin": {
      const a = evalNode(n.a, ctx);
      const b = evalNode(n.b, ctx);
      switch (n.op) {
        case "AND": return Boolean(a) && Boolean(b);
        case "OR": return Boolean(a) || Boolean(b);
        case "==": return a === b;
        case "!=": return a !== b;
        case "<": return a < b;
        case "<=": return a <= b;
        case ">": return a > b;
        case ">=": return a >= b;
        case "IN": return asArray(b).includes(a);
        default: throw new Error(`CXL eval: unsupported op ${n.op}`);
      }
    }
    case "any": {
      const list = evalNode(n.list, ctx);
      if (!Array.isArray(list)) return false;
      for (const item of list) {
        const ok = Boolean(evalNode(n.pred, {...ctx, it: item}));
        if (ok) return true;
      }
      return false;
    }
  }
}
