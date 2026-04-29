/**
 * PreCompact Hook: Journal write reminder before context compaction
 *
 * Anthropic bug #25999: context compaction loses project state. This hook
 * fires right BEFORE compaction so Claude can write the journal entry while
 * the full conversation is still in memory. Non-blocking — just a reminder.
 */
const fs = require("fs");
const path = require("path");

try {
  const cwd = process.env.CLAUDE_PROJECT_DIR || ".";
  const journalDir = path.join(cwd, ".claude", "journal");

  if (!fs.existsSync(journalDir)) {
    process.exit(0);
  }

  // Check if there is already a journal entry for today
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  let hasTodayEntry = false;
  try {
    const files = fs.readdirSync(journalDir);
    hasTodayEntry = files.some(
      (f) => f.startsWith(today) && f.endsWith(".md") && f !== "README.md",
    );
  } catch {
    // continue
  }

  const message = hasTodayEntry
    ? "Context compaction yapilacak. Bugun icin journal entry mevcut, ek bir giris gerekiyorsa /journal calistirabilirsin."
    : "Context compaction yapilacak — uzun konusma kayboluyor.\n" +
      "Bu oturumda onemli bir is/karar/bulgu varsa SIMDI /journal calistir,\n" +
      "yoksa konusma ozeti kaybolur (bug #25999).";

  const output = {
    hookSpecificOutput: {
      hookEventName: "PreCompact",
      additionalContext: message,
    },
  };

  console.log(JSON.stringify(output));
} catch (e) {
  process.exit(0);
}
