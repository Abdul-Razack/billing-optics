import { z } from 'zod';
const numericQueryParam = z.preprocess(
  (val) => (val === '' || val === null || val === undefined ? undefined : val),
  z.coerce.number()
);

const schema = z.object({
  page: numericQueryParam.min(1).optional().default(1),
  limit: numericQueryParam.min(1).max(100).optional().default(10)
});
console.log("Empty object:", schema.safeParse({}).data);
console.log("page='':", schema.safeParse({ page: "" }).data);
console.log("page='abc':", schema.safeParse({ page: "abc" }).success);
