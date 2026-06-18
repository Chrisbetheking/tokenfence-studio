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
  { file: "apps/desktop/ui/src/App.tsx", min: 250 },
  { file: "apps/desktop/ui/src/components/AppTitleBar.tsx", min: 80 },
  { file: "apps/desktop/ui/src/components/AgentPatchPanel.tsx", min: 220 },
  { file: "apps/desktop/ui/src/agentModelBridge.ts", min: 120 },
  { file: "apps/desktop/ui/src/screens/ToolboxScreen.tsx", min: 180 },
  { file: "apps/desktop/ui/src/desktop-bridge.ts", min: 100 },
  { file: "apps/desktop/src-tauri/src/main.rs", min: 100 },
  { file: "scripts/source_guard.js", min: 150 },
  { file: "scripts/release_sanity.js", min: 80 },
  { file: ".github/workflows/ci.yml", min: 50 },
  { file: "docs/RELEASE_CHECKLIST.md", min: 60 },
  { file: "README.zh-CN.md", min: 80 },
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

// ===== 2. BOM and encoding check =====
console.log("\n--- BOM and encoding check ---");
for (var i = 0; i < coreFiles.length; i++) {
  var item = coreFiles[i];
  var fp = path.join(ROOT, item.file);
  if (!fs.existsSync(fp)) continue;
  var buf = fs.readFileSync(fp);

  if (buf.length >= 3 && buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) {
    fail(item.file + ": has UTF-8 BOM");
  }

  var crCount = 0;
  for (var bi = 0; bi < buf.length; bi++) {
    if (buf[bi] === 0x0D) crCount++;
  }
  if (crCount > 0) {
    fail(item.file + ": " + crCount + " CR bytes, should be LF-only");
  }

  try {
    var text = buf.toString("utf-8");
    var lines = text.split("\n").length;
    if (lines < 5 && text.length > 200) {
      fail(item.file + ": appears minified (" + lines + " lines, " + text.length + " bytes)");
    }
    var avgLen = text.length / Math.max(lines, 1);
    if (avgLen > 800) {
      fail(item.file + ": average line length " + Math.round(avgLen) + " (possible single-line)");
    }
  } catch (e) {
    fail(item.file + ": invalid UTF-8");
  }
}
ok("BOM/encoding checks done");

// ===== 3. Bad pattern check =====
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
  "apps/desktop/ui/src/components/AppTitleBar.tsx",
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

  for (var bi = 0; bi < buf.length - 1; bi++) {
    if (buf[bi] === 0xC3) {
      var nxt = buf[bi+1];
      if (nxt >= 0x80 && nxt <= 0xBF) {
        fail(cf + ": possible mojibake (0xC3 byte) at offset " + bi);
        break;
      }
    }
    if (buf[bi] === 0xEF && buf[bi+1] === 0xBF && buf.length > bi+2 && buf[bi+2] === 0xBD) {
      fail(cf + ": replacement character (U+FFFD) at offset " + bi);
      break;
    }
  }
}
ok("bad patterns checked");

// ===== 4. Bare # and ### in source files (not ##) =====
console.log("\n--- Bare # / ### in source files ---");
var sourceFiles = [
  "apps/desktop/ui/src/App.tsx",
  "apps/desktop/ui/src/components/AgentPatchPanel.tsx",
  "apps/desktop/ui/src/components/AppTitleBar.tsx",
  "apps/desktop/ui/src/screens/ToolboxScreen.tsx",
  "apps/desktop/ui/src/agentModelBridge.ts",
  "apps/desktop/ui/src/desktop-bridge.ts",
  "apps/desktop/src-tauri/src/main.rs",
  "scripts/source_guard.js",
  "scripts/release_sanity.js",
];

// In a template literal, ## headings are normal string content - skip those lines.
// Only flag bare # (single hash with space) and ### (triple hash) outside template literals.
function isInTemplateLiteral(lines, idx) {
  var backtickCount = 0;
  for (var i = 0; i < idx; i++) {
    var l = lines[i];
    // Count unescaped backticks
    var matches = l.match(/(?<!\\)/g);
    if (matches) backtickCount += matches.length;
  }
  return (backtickCount % 2) === 1;
}

for (var t = 0; t < sourceFiles.length; t++) {
  var tf = sourceFiles[t];
  var fp = path.join(ROOT, tf);
  if (!fs.existsSync(fp)) continue;
  var lines = fs.readFileSync(fp, "utf-8").split("\n");
  var found = false;
  for (var li = 0; li < lines.length; li++) {
    var line = lines[li];
    var trimmed = line.trimStart();

    // Skip template literal content
    if (isInTemplateLiteral(lines, li)) continue;

    // Rust: allow #[derive(...)], #![cfg_attr(...)], etc.
    if (tf.endsWith(".rs")) {
      if (trimmed.startsWith("#[") || trimmed.startsWith("#![")) continue;
    }

    // Check for bare # (single hash + space, not shebang, not comment)
    if (/^#[^#!\[\/]/.test(trimmed) && !/^\s*\/\//.test(line)) {
      fail(tf + ":" + (li+1) + ': bare #: "' + line.trim() + '"');
      found = true;
    }

    // Check for bare ### (triple hash)
    if (/^###[^#]/.test(trimmed) && !/^\s*\/\//.test(line)) {
      fail(tf + ":" + (li+1) + ': bare ###: "' + line.trim() + '"');
      found = true;
    }
  }
  if (!found) ok(tf + ": no bare #/###");
}

// ===== 5. Tracked binary check =====
console.log("\n--- Tracked binary check ---");
var binaryPatterns = ["*.zip", "*.exe", "*.msi", "*.msix", "*.appx", "*.7z", "*.rar"];
var hasTrackedBinary = false;
for (var p = 0; p < binaryPatterns.length; p++) {
  try {
    var tracked = execSync("git ls-files " + binaryPatterns[p], { cwd: ROOT, encoding: "utf-8" }).trim();
    if (tracked) {
      fail(binaryPatterns[p] + " tracked in git: " + tracked);
      hasTrackedBinary = true;
    }
  } catch (e) { /* no matches is OK */ }
}
if (!hasTrackedBinary) ok("no binary files tracked");

// ===== 6. README check =====
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

  if (buf.length >= 3 && buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) {
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
