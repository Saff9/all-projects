// base64 stdlib: encode, decode. Zero external dependencies.

import { ObjectValue, RuntimeValue, BuiltinFunction } from "../types";

function makeBuiltin(
  name: string,
  fn: (args: RuntimeValue[], line: number) => RuntimeValue
): [string, BuiltinFunction] {
  return [name, { kind: "builtin", name, fn }];
}

export function createBase64Object(): ObjectValue {
  const props = new Map<string, RuntimeValue>([
    makeBuiltin("encode", (args) => {
      if (args.length !== 1 || typeof args[0] !== "string") {
        throw new Error("base64.encode() needs 1 text argument");
      }
      return Buffer.from(args[0], "utf8").toString("base64");
    }),
    makeBuiltin("decode", (args) => {
      if (args.length !== 1 || typeof args[0] !== "string") {
        throw new Error("base64.decode() needs 1 text argument");
      }
      return Buffer.from(args[0], "base64").toString("utf8");
    }),
  ]);

  return { kind: "object", props };
}
