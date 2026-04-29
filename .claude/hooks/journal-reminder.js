/**
 * Stop Hook: Journal write reminder when meaningful work was done
 *
 * Logic: if the working tree has uncommitted changes AND there is no journal
 * entry for today, print a reminder for Claude. Non-blocking.
 *
 * Stays quiet on: clean working tree, today already journaled, error.
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

try {
  const cwd = process.env.CLAUDE_PROJECT_DIR || ".";
  const journalDir = path.join(cwd, ".claude", "journal");

  if (!fs.existsSync(journalDir)) {
    process.exit(0);
  }

  // Today already journaled? quiet.
  const today = new Date().toISOString().slice(0, 10);
  const files = fs.readdirSync(journalDir);
  const hasTodayEntry = files.some(
    (f) => f.startsWith(today) && f.endsWith(".md") && f !== "README.md",
  );
  if (hasTodayEntry) {
    process.exit(0);
  }

  // Anything changed in the working tree? if not, quiet.
  let changedCount = 0;
  try {
    const out = execSync("git status --short", {
      encoding: "utf-8",
      cwd,
      timeout: 3000,
    }).trim();
    if (!out) process.exit(0);
    changedCount = out.split("\n").filter(Boolean).length;
  } catch {
    process.exit(0); // no git, no warning
  }

  // Heuristic: only trivial changes (1 file, e.g. a typo fix)? skip the nag.
  if (changedCount <= 1) {
    process.exit(0);
  }

  const message =
    `Bugun ${changedCount} dosya degisti, henuz journal girisi yok.\n` +
    `Onemli bir is/karar yaptiysan /journal calistirip arsivle.\n` +
    `Kucuk degisiklikse atla.`;

  const output = {
    hookSpecificOutput: {
      hookEventName: "Stop",
      additionalContext: message,
    },
  };

  console.log(JSON.stringify(output));
} catch (e) {
  process.exit(0);
}
