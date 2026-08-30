const fs = require("fs");
const raw = fs.readFileSync("C:\\Users\\DUNIYA TRADER\\.local\\share\\opencode\\tool-output\\tool_04e5834af001zhFso5zMmB8nV2", "utf8");
const data = JSON.parse(raw);
const tools = data.result.tools;
for (const t of tools) {
  console.log("=== " + t.name);
  console.log("  desc: " + (t.description || "").split("\n")[0]);
  const props = (t.inputSchema && t.inputSchema.properties) || {};
  for (const [k, v] of Object.entries(props)) {
    const req = (t.inputSchema.required || []).includes(k);
    console.log(`  param ${k}${req ? " (REQUIRED)" : ""} (${v.type || "?"}): ${(v.description || "").split("\n")[0]}`);
  }
}