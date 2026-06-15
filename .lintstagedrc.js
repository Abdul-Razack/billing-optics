module.exports = {
  "backend/**/*.ts": () => "npx tsc --noEmit -p backend/tsconfig.json",
  "frontend/**/*.{ts,tsx}": () => "npx tsc --noEmit -p frontend/tsconfig.json"
};
