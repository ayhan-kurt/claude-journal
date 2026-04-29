/**
 * SessionStart Hook: Journal context injection
 *
 * Loads the last 10 entries from .claude/journal/README.md so Claude knows
 * what was recently done in the project. Read-only, never blocks.
 */
const fs = require("fs");
const path = require("path");

try {
  const cwd = process.env.CLAUDE_PROJECT_DIR || ".";
  const indexPath = path.join(cwd, ".claude", "journal", "README.md");

  if (!fs.existsSync(indexPath)) {
    process.exit(0);
  }

  const content = fs.readFileSync(indexPath, "utf-8");
  const startMarker = "<!-- ENTRIES_START -->";
  const endMarker = "<!-- ENTRIES_END -->";
  const startIdx = content.indexOf(startMarker);
  const endIdx = content.indexOf(endMarker);

  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    process.exit(0);
  }

  const block = content.substring(startIdx + startMarker.length, endIdx).trim();
  const lines = block
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("- ["));

  if (lines.length === 0) {
    process.exit(0); // No entries yet, nothing to inject
  }

  const recent = lines.slice(0, 10);
  const message = [
    "Son journal girisleri (.claude/journal/):",
    ...recent,
    "",
    "Yeni ise baslarken ilgili giriseleri okumak isteyebilirsin.",
  ].join("\n");

  const output = {
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: message,
    },
  };

  console.log(JSON.stringify(output));
} catch (e) {
  process.exit(0);
}
