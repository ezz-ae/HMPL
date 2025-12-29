export type Tok =
  | {t:"IDENT"; v:string}
  | {t:"NUMBER"; v:number}
  | {t:"STRING"; v:string}
  | {t:"BOOL"; v:boolean}
  | {t:"NULL"}
  | {t:"OP"; v:string}
  | {t:"LP"} | {t:"RP"}
  | {t:"LB"} | {t:"RB"}
  | {t:"COMMA"};

const re = /\s+|==|!=|<=|>=|<|>|\bAND\b|\bOR\b|\bNOT\b|\bIN\b|\bANY\b|\bALL\b|\bNONE\b|\btrue\b|\bfalse\b|\bnull\b|[().,\\[\\]]|"(?:\\.|[^"])*"|[A-Za-z_][A-Za-z0-9_]*|[0-9]+(?:\.[0-9]+)?/gy;

export function tokenize(input: string): Tok[] {
  const out: Tok[] = [];
  re.lastIndex = 0;
  while (re.lastIndex < input.length) {
    const m = re.exec(input);
    if (!m) throw new Error(`CXL tokenize error at ${re.lastIndex}`);
    const s = m[0];
    if (/^\s+$/.test(s)) continue;
    if (s === "(") out.push({t:"LP"});
    else if (s === ")") out.push({t:"RP"});
    else if (s === "[") out.push({t:"LB"});
    else if (s === "]") out.push({t:"RB"});
    else if (s === ".") out.push({t:"OP", v:"."});
    else if (s === ",") out.push({t:"COMMA"});
    else if (s === "AND" || s === "OR" || s === "NOT" || s === "IN" || s === "==" || s === "!=" || s === "<" || s === "<=" || s === ">" || s === ">=") out.push({t:"OP", v:s});
    else if (s === "true" || s === "false") out.push({t:"BOOL", v: s === "true"});
    else if (s === "null") out.push({t:"NULL"});
    else if (s[0] === '"') out.push({t:"STRING", v: JSON.parse(s)});
    else if (/^[0-9]/.test(s)) out.push({t:"NUMBER", v: Number(s)});
    else out.push({t:"IDENT", v: s});
  }
  return out;
}
