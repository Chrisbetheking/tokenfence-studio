const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
var errors = [];

function fail(msg) {
  errors.push(msg);
  console.error("  FAIL: " + msg);
}

function ok(msg) {
  console.log("  OK: " + msg);
}

// ===== 1. Core file line counts =====
console.log("\n--- Core file line counts ---");
var coreFiles = [
  { file: "apps/desktop/ui/src/components/AgentPatchPanel.tsx", min: 180 },
  { file: "apps/desktop/ui/src/screens/ToolboxScreen.tsx", min: 180 },
  { file: "apps/desktop/ui/src/desktop-bridge.ts", min: 100 },
  { file: "apps/desktop/src-tauri/src/main.rs", min: 100 },
  { file: "packages/shared/src/installed-models.ts", min: 50 },
  { file: "scripts/source_guard.js", min: 120 },
  { file: "scripts/release_sanity.js", min: 80 },
  { file: ".github/workflows/ci.yml", min: 40 },
  { file: "docs/RELEASE_CHECKLIST.md", min: 60 },
];

for (var i = 0; i < coreFiles.length; i++) {
  var item = coreFiles[i];
  var fp = path.join(ROOT, item.file);
  if (!fs.existsSync(fp)) {
    fail(item.file + ": FILE NOT FOUND");
    continue;
  }
  var content = fs.readFileSync(fp, "utf-8");
  var lines = content.split("\n").length;
  if (lines < item.min) {
    fail(item.file + ": " + lines + " lines (min " + item.min + ") - TOO SHORT");
  } else {
    ok(item.file + ": " + lines + " lines");
  }
}

// ===== 2. Bad pattern check =====
console.log("\n--- Bad pattern check ---");
var badKeys = [
  "providersPage.title",
  "computerUse.enabledLabel",
  "chat.agentStep",
];

var checkFiles = [
  "apps/desktop/ui/src/components/AgentPatchPanel.tsx",
  "apps/desktop/ui/src/screens/ToolboxScreen.tsx",
  "apps/desktop/ui/src/desktop-bridge.ts",
  "apps/desktop/src-tauri/src/main.rs",
  "apps/desktop/ui/src/App.tsx",
];

for (var j = 0; j < checkFiles.length; j++) {
  var cf = checkFiles[j];
  var fp = path.join(ROOT, cf);
  if (!fs.existsSync(fp)) continue;
  var buf = fs.readFileSync(fp);
  var content = buf.toString("utf-8");

  for (var k = 0; k < badKeys.length; k++) {
    if (content.includes(badKeys[k])) {
      fail(cf + ': leaked i18n key "' + badKeys[k] + '"');
    }
  }

  // Mojibake check: 0xC3 byte followed by common corrupt chars
  for (var bi = 0; bi < buf.length - 1; bi++) {
    if (buf[bi] === 0xC3 && (buf[bi+1] === 0xA6 || buf[bi+1] === 0xA5 || buf[bi+1] === 0xA9)) {
      fail(cf + ": possible mojibake at byte " + bi);
      break;
    }
  }
}
ok("bad patterns checked");

// ===== 3. Bare ### in TSX =====
console.log("\n--- Bare ### in TSX ---");
var tsxFiles = [
  "apps/desktop/ui/src/components/AgentPatchPanel.tsx",
  "apps/desktop/ui/src/screens/ToolboxScreen.tsx",
];

for (var t = 0; t < tsxFiles.length; t++) {
  var tf = tsxFiles[t];
  var fp = path.join(ROOT, tf);
  if (!fs.existsSync(fp)) continue;
  var lines = fs.readFileSync(fp, "utf-8").split("\n");
  var found = false;
  for (var li = 0; li < lines.length; li++) {
    var line = lines[li];
    var trimmed = line.trimStart();
    if (trimmed.startsWith("###")) {
      fail(tf + ":" + (li+1) + ': bare ### heading: "' + line.trim() + '"');
      found = true;
    }
  }
  if (!found) ok(tf + ": no bare ###");
}

// ===== 4. Tracked ZIPs =====
console.log("\n--- Tracked ZIP check ---");
try {
  var tracked = execSync("git ls-files *.zip", { cwd: ROOT, encoding: "utf-8" }).trim();
  if (tracked) {
    fail("ZIP files tracked in git: " + tracked);
  } else {
    ok("no ZIP files tracked");
  }
} catch (e) {
  fail("git ls-files failed: " + e.message);
}

// ===== 5. README encoding check =====
console.log("\n--- README check ---");
var readmes = ["README.md", "README.zh-CN.md"];

for (var r = 0; r < readmes.length; r++) {
  var rf = readmes[r];
  var fp = path.join(ROOT, rf);
  if (!fs.existsSync(fp)) {
    fail(rf + ": FILE NOT FOUND");
    continue;
  }
  var buf = fs.readFileSync(fp);

  if (buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) {
    fail(rf + ": has UTF-8 BOM");
  }

  var crCount = 0;
  for (var bi = 0; bi < buf.length; bi++) {
    if (buf[bi] === 0x0D) crCount++;
  }
  if (crCount > 0) {
    fail(rf + ": " + crCount + " CR bytes, should be LF-only");
  }

  try {
    var text = buf.toString("utf-8");
    var lines = text.split("\n").length;
    if (lines < 80) {
      fail(rf + ": " + lines + " lines (min 80)");
    } else {
      ok(rf + ": UTF-8, LF-only, " + lines + " lines");
    }
  } catch (e) {
    fail(rf + ": invalid UTF-8");
  }
}

// ===== Final =====
console.log("\n=== RESULT: " + errors.length + " error(s) ===");
if (errors.length > 0) {
  console.log("Failures:");
  errors.forEach(function(e) { console.log("  - " + e); });
  process.exit(1);
} else {
  console.log("All checks passed.");
  process.exit(0);
}
