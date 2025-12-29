import Ajv from "ajv";
import addFormats from "ajv-formats";
import { loadSchema } from "./schemas.js";

const ajv = new Ajv({ allErrors: true, strict: true });
addFormats(ajv);

function compile(schemaPath: string) {
  const schema = loadSchema(schemaPath);
  return ajv.compile(schema);
}

export const validateEPkt = compile("schemas/e-pkt.1.0.json");
export const validateRDesc = compile("schemas/r-desc.1.0.json");
export const validateSSnap = compile("schemas/s-snap.1.0.json");
export const validateCPack = compile("schemas/c-pack.1.0.json");
export const validateDPkt = compile("schemas/d-pkt.1.0.json");
export const validateHPrec = compile("schemas/h-prec.1.0.json");
export const validatePBndl = compile("schemas/p-bndl.1.0.json");

export function assertValid<T>(validator: any, data: unknown, name: string): asserts data is T {
  const ok = validator(data);
  if (!ok) {
    const msg = ajv.errorsText(validator.errors, { separator: "\n" });
    throw new Error(`${name} schema invalid:\n${msg}`);
  }
}
