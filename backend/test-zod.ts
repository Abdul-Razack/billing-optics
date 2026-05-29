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

const paginationQuerySchema = z.object({
  page: createNumericQueryParam(1, undefined, 1),
  limit: createNumericQueryParam(1, 100, 10),
  search: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : val),
    z.string().trim()
  ).optional(),
});

const getCustomersSchema = z.object({
  query: paginationQuerySchema
});

try {
  const parsed = getCustomersSchema.parse({
    body: undefined,
    query: { page: "1", limit: "10", sortBy: "name", sortOrder: "asc" },
    params: {}
  });
  console.log("Success:", parsed);
} catch (e: any) {
  console.log("Error:", JSON.stringify(e.errors, null, 2));
}
