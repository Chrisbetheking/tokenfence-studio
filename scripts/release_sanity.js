const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const VERSION = process.argv[2];

if (!VERSION) {
  console.error("Usage: node scripts/release_sanity.js <version>");
  console.error("Example: node scripts/release_sanity.js v1.1.6");
  process.exit(1);
}

let errors = [];

function fail(msg) {
  errors.push(msg);
  console.error("  FAIL: " + msg);
}

function ok(msg) {
  console.log("  OK: " + msg);
}

const v = VERSION.replace(/^v/, "");
const vTag = "v" + v;

console.log("\n=== Release sanity check for " + vTag + " ===");

// 1. Version consistency
console.log("\n--- Version consistency ---");
const checks = [
  { file: "apps/desktop/ui/src/App.tsx", pattern: 'const VERSION = "' + vTag + '"' },
  { file: "apps/desktop/src-tauri/tauri.conf.json", pattern: '"version": "' + v + '"' },
  { file: "apps/desktop/src-tauri/Cargo.toml", pattern: 'version = "' + v + '"' },
];

for (const item of checks) {
  const fp = path.join(ROOT, item.file);
  if (!fs.existsSync(fp)) {
    fail(item.file + ": NOT FOUND");
    continue;
  }
  const content = fs.readFileSync(fp, "utf-8");
  if (content.includes(item.pattern)) {
    ok(item.file + ': contains "' + item.pattern + '"');
  } else {
    fail(item.file + ': MISSING "' + item.pattern + '"');
  }
}

// 2. README download links
console.log("\n--- README download links ---");
const zipName = "TokenFence-Studio-Windows-" + vTag + "-portable.zip";
for (const f of ["README.md", "README.zh-CN.md"]) {
  const fp = path.join(ROOT, f);
  if (!fs.existsSync(fp)) continue;
  const content = fs.readFileSync(fp, "utf-8");
  if (content.includes(zipName)) {
    ok(f + ": contains " + zipName);
  } else {
    fail(f + ": MISSING " + zipName);
  }
}

// 3. .gitignore includes *.zip
console.log("\n--- .gitignore check ---");
const giPath = path.join(ROOT, ".gitignore");
if (fs.existsSync(giPath)) {
  const gi = fs.readFileSync(giPath, "utf-8");
  if (gi.includes("*.zip")) {
    ok(".gitignore: contains *.zip");
  } else {
    fail(".gitignore: MISSING *.zip");
  }
} else {
  fail(".gitignore: FILE NOT FOUND");
}

// 4. git ls-files *.zip empty
console.log("\n--- Tracked ZIP check ---");
const { execSync } = require("child_process");
try {
  const tracked = execSync("git ls-files *.zip", { cwd: ROOT, encoding: "utf-8" }).trim();
  if (tracked) {
    fail("ZIP files tracked: " + tracked);
  } else {
    ok("no ZIP files tracked");
  }
} catch (e) {
  fail("git ls-files failed: " + e.message);
}

// 5. ZIP asset name match
console.log("\n--- ZIP asset name ---");
const zipPath = path.join(ROOT, zipName);
if (fs.existsSync(zipPath)) {
  ok("ZIP exists: " + zipName);
} else {
  console.log("  INFO: ZIP not yet built (expected before release)");
}

// 6. Secret leak check
console.log("\n--- Secret leak check ---");
const secretPatterns = [
  /ghp_[A-Za-z0-9]{36}/,
  /gho_[A-Za-z0-9]{36}/,
  /sk-[A-Za-z0-9]{32,}/,
];
const checkFiles = [
  "README.md", "README.zh-CN.md",
  "docs/RELEASE_CHECKLIST.md",
  "scripts/source_guard.js", "scripts/release_sanity.js",
  ".github/workflows/ci.yml"
];
for (const f of checkFiles) {
  const fp = path.join(ROOT, f);
  if (!fs.existsSync(fp)) continue;
  const content = fs.readFileSync(fp, "utf-8");
  for (const pat of secretPatterns) {
    if (pat.test(content)) {
      fail(f + ": contains secret/key pattern");
    }
  }
}
ok("no secrets leaked");

// 7. Core source size
console.log("\n--- Core source size ---");
const coreFiles = [
  { file: "apps/desktop/ui/src/components/AgentPatchPanel.tsx", min: 180 },
  { file: "apps/desktop/ui/src/screens/ToolboxScreen.tsx", min: 180 },
  { file: "apps/desktop/ui/src/desktop-bridge.ts", min: 100 },
  { file: "apps/desktop/src-tauri/src/main.rs", min: 100 },
  { file: "scripts/source_guard.js", min: 120 },
  { file: "scripts/release_sanity.js", min: 80 },
  { file: ".github/workflows/ci.yml", min: 40 },
  { file: "docs/RELEASE_CHECKLIST.md", min: 60 },
];
for (const item of coreFiles) {
  const fp = path.join(ROOT, item.file);
  if (!fs.existsSync(fp)) {
    fail(item.file + ": NOT FOUND");
    continue;
  }
  const lines = fs.readFileSync(fp, "utf-8").split("\n").length;
  if (lines < item.min) {
    fail(item.file + ": " + lines + " lines (min " + item.min + ")");
  } else {
    ok(item.file + ": " + lines + " lines");
  }
}

// Final
console.log("\n=== RESULT: " + errors.length + " error(s) ===");
if (errors.length > 0) {
  console.log("Failures:");
  errors.forEach(function(e) { console.log("  - " + e); });
  process.exit(1);
} else {
  console.log("Release sanity check passed.");
  process.exit(0);
}
