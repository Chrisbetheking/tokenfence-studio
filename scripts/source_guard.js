const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
var errors = [];

function fail(msg) { errors.push(msg); console.error("  FAIL: " + msg); }
function ok(msg) { console.log("  OK: " + msg); }

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
  { file: "apps/desktop/ui/src/data/active-model.ts", min: 450 },
  { file: "apps/desktop/ui/src/components/CustomModelModal.tsx", min: 100 },
  { file: "apps/desktop/ui/src/components/ProviderConfigModal.tsx", min: 200 },
  { file: "apps/desktop/ui/src/components/ProviderSetupWizard.tsx", min: 180 },
  { file: "apps/desktop/ui/src/screens/ModelsScreen.tsx", min: 500 },
  { file: "apps/desktop/ui/src/screens/ChatWorkspace.tsx", min: 1755 },
  { file: "apps/desktop/ui/src/components/ModelRuntimeSelfTest.tsx", min: 150 },
  { file: "scripts/source_guard.js", min: 150 },
  { file: "scripts/release_sanity.js", min: 80 },
  { file: ".github/workflows/ci.yml", min: 40 },
  { file: "docs/RELEASE_CHECKLIST.md", min: 60 },
  { file: "README.zh-CN.md", min: 80 },
];

for (var i = 0; i < coreFiles.length; i++) {
  var item = coreFiles[i];
  var fp = path.join(ROOT, item.file);
  if (!fs.existsSync(fp)) { fail(item.file + ": FILE NOT FOUND"); continue; }
  var content = fs.readFileSync(fp, "utf-8");
  var lines = content.split("\n").length;
  if (lines < item.min) { fail(item.file + ": " + lines + " lines (min " + item.min + ")"); }
  else { ok(item.file + ": " + lines + " lines"); }
}

// ===== 2. BOM and encoding check (UTF-8, CR, minified) =====
console.log("\n--- BOM and encoding check ---");
for (var i = 0; i < coreFiles.length; i++) {
  var item = coreFiles[i];
  var fp = path.join(ROOT, item.file);
  if (!fs.existsSync(fp)) continue;
  var buf = fs.readFileSync(fp);
  if (buf.length >= 3 && buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) { fail(item.file + ": has BOM"); }
  var crCount = 0;
  for (var bi = 0; bi < buf.length; bi++) { if (buf[bi] === 0x0D) crCount++; }
  if (crCount > 0) { fail(item.file + ": " + crCount + " CR bytes"); }
  try {
    var text = buf.toString("utf-8");
    var lines = text.split("\n").length;
    if (lines < 5 && text.length > 200) { fail(item.file + ": minified"); }
    if (text.length / Math.max(lines, 1) > 800) { fail(item.file + ": possible single-line"); }
  } catch (e) { fail(item.file + ": invalid UTF-8"); }
}
ok("BOM/encoding checks done");


// ===== 2.5. Capabilities check =====
console.log("\n--- Capabilities check ---");
var capPath = path.join(ROOT, "apps/desktop/src-tauri/capabilities/default.json");
if (!fs.existsSync(capPath)) {
  fail("capabilities/default.json: NOT FOUND");
} else {
  var capContent = fs.readFileSync(capPath, "utf-8");
  var requiredPerms = [
    "core:window:allow-start-dragging",
    "core:window:allow-minimize",
    "core:window:allow-maximize",
    "core:window:allow-unmaximize",
    "core:window:allow-close"
  ];
  for (var rp = 0; rp < requiredPerms.length; rp++) {
    if (capContent.indexOf(requiredPerms[rp]) >= 0) {
      ok("capabilities contains " + requiredPerms[rp]);
    } else {
      fail("capabilities MISSING " + requiredPerms[rp]);
    }
  }
}
// Check AppTitleBar has proper API calls
var atbPath = path.join(ROOT, "apps/desktop/ui/src/components/AppTitleBar.tsx");
if (fs.existsSync(atbPath)) {
  var atbContent = fs.readFileSync(atbPath, "utf-8");
  var requiredCalls = ["startDragging", "minimize", "maximize", "unmaximize", "close"];
  for (var rc = 0; rc < requiredCalls.length; rc++) {
    if (atbContent.indexOf(requiredCalls[rc]) >= 0) {
      ok("AppTitleBar contains " + requiredCalls[rc]);
    } else {
      fail("AppTitleBar MISSING " + requiredCalls[rc]);
    }
  }
}


// Check ChatWorkspace for hardcoded fallbacks
var cwPath = path.join(ROOT, "apps/desktop/ui/src/screens/ChatWorkspace.tsx");
if (fs.existsSync(cwPath)) {
  var cwContent = fs.readFileSync(cwPath, "utf-8");
  if (cwContent.indexOf("\"OpenAI\"") >= 0 || cwContent.indexOf("'OpenAI'") >= 0) fail("ChatWorkspace.tsx has hardcoded OpenAI");
  else ok("ChatWorkspace has no hardcoded OpenAI");
  if (cwContent.indexOf("\"gpt-4o\"") >= 0 || cwContent.indexOf("'gpt-4o'") >= 0) fail("ChatWorkspace.tsx has hardcoded gpt-4o");
  else ok("ChatWorkspace has no hardcoded gpt-4o");
  if (cwContent.indexOf("tokenfence:active-model-changed") < 0) fail("ChatWorkspace.tsx MISSING event listener");
  else ok("ChatWorkspace has active-model-changed listener");
  if (cwContent.indexOf("getActiveModelViewState") < 0) fail("ChatWorkspace.tsx MISSING getActiveModelViewState");
  else ok("ChatWorkspace uses getActiveModelViewState");
}
// Check ModelRuntimeSelfTest exists
var selfTestPath = path.join(ROOT, "apps/desktop/ui/src/components/ModelRuntimeSelfTest.tsx");
if (!fs.existsSync(selfTestPath)) fail("ModelRuntimeSelfTest.tsx NOT FOUND");
else ok("ModelRuntimeSelfTest.tsx exists");

// Check active-model has normalizeDisplayText and migrateActiveModelStorage
var amCheck = fs.readFileSync(path.join(ROOT, "apps/desktop/ui/src/data/active-model.ts"), "utf-8");
if (amCheck.indexOf("normalizeDisplayText") < 0) fail("active-model.ts MISSING normalizeDisplayText");
else ok("active-model contains normalizeDisplayText");
if (amCheck.indexOf("migrateActiveModelStorageV2") < 0) fail("active-model.ts MISSING migrateActiveModelStorageV2");
else ok("active-model contains migrateActiveModelStorageV2");
if (amCheck.indexOf("ActiveModelV2") < 0) fail("active-model.ts MISSING ActiveModelV2 interface");
else ok("active-model contains ActiveModelV2");
if (amCheck.indexOf("canonicalizeProviderId") < 0) fail("active-model.ts MISSING canonicalizeProviderId");
else ok("active-model contains canonicalizeProviderId");
if (amCheck.indexOf("getActiveModelViewState") < 0) fail("active-model.ts MISSING getActiveModelViewState");
else ok("active-model contains getActiveModelViewState");

// ===== 3. Bad pattern check (mojibake, leaked i18n keys) =====
console.log("\n--- Bad pattern check ---");
var badKeys = ["providersPage.title", "computerUse.enabledLabel", "chat.agentStep"];
var checkFiles = [
  "apps/desktop/ui/src/components/AgentPatchPanel.tsx",
  "apps/desktop/ui/src/screens/ToolboxScreen.tsx",
  "apps/desktop/ui/src/desktop-bridge.ts",
  "apps/desktop/src-tauri/src/main.rs",
  "apps/desktop/ui/src/App.tsx",
  "apps/desktop/ui/src/components/AppTitleBar.tsx",
  "apps/desktop/ui/src/data/active-model.ts",
  "apps/desktop/ui/src/components/CustomModelModal.tsx",
  "apps/desktop/ui/src/components/ProviderConfigModal.tsx",
  "apps/desktop/ui/src/components/ProviderSetupWizard.tsx",
];
for (var j = 0; j < checkFiles.length; j++) {
  var cf = checkFiles[j];
  var fp = path.join(ROOT, cf);
  if (!fs.existsSync(fp)) continue;
  var buf = fs.readFileSync(fp);
  var content = buf.toString("utf-8");
  for (var k = 0; k < badKeys.length; k++) { if (content.includes(badKeys[k])) fail(cf + ': leaked key "' + badKeys[k] + '"'); }
  for (var bi = 0; bi < buf.length - 1; bi++) {
    if (buf[bi] === 0xC3) { if (buf[bi+1] >= 0x80 && buf[bi+1] <= 0xBF) { fail(cf + ": mojibake at " + bi); break; } }
    if (buf[bi] === 0xEF && buf[bi+1] === 0xBF && buf.length > bi+2 && buf[bi+2] === 0xBD) { fail(cf + ": U+FFFD at " + bi); break; }
  }
}
ok("bad patterns checked");

// ===== 4. Bare # / ### in source files (not markdown) =====
console.log("\n--- Bare # / ### ---");
var sourceFiles = [
  "apps/desktop/ui/src/App.tsx", "apps/desktop/ui/src/components/AgentPatchPanel.tsx",
  "apps/desktop/ui/src/components/AppTitleBar.tsx", "apps/desktop/ui/src/screens/ToolboxScreen.tsx",
  "apps/desktop/ui/src/agentModelBridge.ts", "apps/desktop/ui/src/desktop-bridge.ts",
  "apps/desktop/src-tauri/src/main.rs", "apps/desktop/ui/src/data/active-model.ts",
  "apps/desktop/ui/src/components/CustomModelModal.tsx",
  "apps/desktop/ui/src/components/ProviderConfigModal.tsx",
  "apps/desktop/ui/src/components/ProviderSetupWizard.tsx",
  "scripts/source_guard.js", "scripts/release_sanity.js",
];
function inTemplate(lines, idx) { var bc=0; for(var i=0;i<idx;i++){var m=lines[i].match(/(?<!\\)`/g);if(m)bc+=m.length;} return bc%2===1; }
for (var t = 0; t < sourceFiles.length; t++) {
  var tf = sourceFiles[t];
  var fp = path.join(ROOT, tf);
  if (!fs.existsSync(fp)) continue;
  var lines = fs.readFileSync(fp, "utf-8").split("\n");
  var found = false;
  for (var li = 0; li < lines.length; li++) {
    var line = lines[li];
    var trimmed = line.trimStart();
    if (inTemplate(lines, li)) continue;
    if (tf.endsWith(".rs")) { if (trimmed.startsWith("#[") || trimmed.startsWith("#![")) continue; }
    if (/^#[^#!\[\/]/.test(trimmed) && !/^\s*\/\//.test(line)) { fail(tf + ":" + (li+1) + ": bare #"); found = true; }
    if (/^###[^#]/.test(trimmed) && !/^\s*\/\//.test(line)) { fail(tf + ":" + (li+1) + ": bare ###"); found = true; }
  }
  if (!found) ok(tf + ": ok");
}

// ===== 5. Tracked binary check (ZIP, EXE, MSI, etc.) =====
console.log("\n--- Tracked binary check ---");
var bp = ["*.zip","*.exe","*.msi","*.msix","*.appx","*.7z","*.rar"];
var htb = false;
for (var p=0;p<bp.length;p++) { try { var t=execSync("git ls-files "+bp[p],{cwd:ROOT,encoding:"utf-8"}).trim(); if(t){fail(bp[p]+": tracked");htb=true;} } catch(e){} }
if (!htb) ok("no binaries tracked");

// ===== 6. README check (BOM, CR, min line count) =====
console.log("\n--- README check ---");
for (var r=0;r<2;r++) {
  var rf = ["README.md","README.zh-CN.md"][r];
  var fp = path.join(ROOT, rf);
  if (!fs.existsSync(fp)) { fail(rf+": NOT FOUND"); continue; }
  var buf = fs.readFileSync(fp);
  if (buf.length>=3 && buf[0]===0xEF && buf[1]===0xBB && buf[2]===0xBF) fail(rf+": BOM");
  var cr=0; for(var bi=0;bi<buf.length;bi++){if(buf[bi]===0x0D)cr++;}
  if (cr>0) fail(rf+": "+cr+" CR");
  try { var t=buf.toString("utf-8"); var l=t.split("\n").length;
    if(l<80) fail(rf+": "+l+" lines"); else ok(rf+": UTF-8 LF "+l+" lines");
  } catch(e) { fail(rf+": invalid UTF-8"); }
}

// ===== Final =====
console.log("\n=== RESULT: " + errors.length + " error(s) ===");
if (errors.length > 0) { console.log("Failures:"); errors.forEach(function(e) { console.log("  - " + e); }); process.exit(1); }
else { console.log("All checks passed."); process.exit(0);
}
// source_guard.js v1.3.6 - protects against flattened/minified source files
