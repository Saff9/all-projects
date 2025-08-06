// crypto stdlib: sha256, md5, uuid, random_bytes. Zero external dependencies.

import * as crypto from "crypto";
import { ObjectValue, RuntimeValue, BuiltinFunction } from "../types";

function makeBuiltin(
  name: string,
  fn: (args: RuntimeValue[], line: number) => RuntimeValue
): [string, BuiltinFunction] {
  return [name, { kind: "builtin", name, fn }];
}

export function createCryptoObject(): ObjectValue {
  const props = new Map<string, RuntimeValue>([
    makeBuiltin("sha256", (args) => {
      if (args.length !== 1 || typeof args[0] !== "string") {
        throw new Error("crypto.sha256() needs 1 text argument");
      }
      return crypto.createHash("sha256").update(args[0]).digest("hex");
    }),
    makeBuiltin("md5", (args) => {
      if (args.length !== 1 || typeof args[0] !== "string") {
        throw new Error("crypto.md5() needs 1 text argument");
      }
      return crypto.createHash("md5").update(args[0]).digest("hex");
    }),
    makeBuiltin("uuid", (args) => {
      if (args.length !== 0) {
        throw new Error("crypto.uuid() takes no arguments");
      }
      return crypto.randomUUID();
    }),
    makeBuiltin("random_bytes", (args) => {
      if (args.length !== 1 || typeof args[0] !== "number") {
        throw new Error("crypto.random_bytes() needs 1 number argument (byte count)");
      }
      const count = Math.floor(args[0]);
      if (count <= 0) return "";
      return crypto.randomBytes(count).toString("hex");
    }),
  ]);

  return { kind: "object", props };
}
