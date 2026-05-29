import { z } from "zod";

const searchSchema = z.preprocess(
  (val) => (val === '' || val === null || val === undefined ? undefined : val),
  z.string().trim().optional()
);

try {
  console.log("Success:", searchSchema.parse(""));
} catch(e) {
  console.log("Error:", e);
}

try {
  console.log("Success2:", searchSchema.parse("abc"));
} catch(e) {
  console.log("Error:", e);
}

try {
  console.log("Success3:", searchSchema.parse(undefined));
} catch(e) {
  console.log("Error:", e);
}
