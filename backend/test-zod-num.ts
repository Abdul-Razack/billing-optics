import { z } from "zod";

const createNumericQueryParam = (min: number, max: number | undefined, def: number) => {
  let schema = z.coerce.number().min(min);
  if (max !== undefined) {
    schema = schema.max(max);
  }
  return z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : val),
    schema.optional().catch(def).default(def)
  );
};

const param = createNumericQueryParam(1, undefined, 1);

console.log("Empty:", param.parse(""));
console.log("String:", param.parse("abc"));
console.log("Null:", param.parse(null));
console.log("Undefined:", param.parse(undefined));
console.log("Valid:", param.parse("10"));
console.log("Too small:", param.parse("0"));
