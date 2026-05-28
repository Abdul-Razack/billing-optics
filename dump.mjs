
import fs from "fs";
import path from "path";

const dir = "backend/src/db/schema";
const files = fs.readdirSync(dir).filter(f => f.endsWith(".ts"));
let output = "";
for (const file of files) {
  output += `\n--- ${file} ---\n`;
  output += fs.readFileSync(path.join(dir, file), "utf-8");
}
fs.writeFileSync("schema_dump.txt", output);

