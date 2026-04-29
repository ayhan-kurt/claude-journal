# Project Journal — Decision & Work Log

This folder is the cumulative archive of **important work and decisions** made
on this project. Each entry is written by Claude when you run the `/journal`
slash command at the end of a session.

## Why it exists

Claude Code is stateless across sessions — each new session starts from zero.

This project uses a layered approach to context:

| Layer                  | What it stores                                | When loaded               |
| ---------------------- | --------------------------------------------- | ------------------------- |
| `CLAUDE.md`            | Conventions, constraints, "always do X" rules | Every session             |
| `.claude/skills/`      | "How to do X" patterns                        | When the keyword triggers |
| Memory (`MEMORY.md`)   | "What we currently know" facts                | Every session             |
| **`.claude/journal/`** | **"What we did, why, and what came of it"**   | **On demand**             |

The `SessionStart` hook automatically injects the index of recent entries into
each new session, so Claude has implicit recent context. For deep history,
search this folder by date or filename.

## Format

Files are named `YYYY-MM-DD-kebab-case-title.md`. Each entry has:

- YAML frontmatter (`date`, `tags`, `status`)
- A "Context" section explaining the trigger
- A "What was done" bullet list
- A list of files touched
- "Outcome / Lessons" — the durable value of the entry
- "Related memory / skills" — cross-references

See `.claude/commands/journal.md` for the full template.

## Index (newest first)

<!-- ENTRIES_START -->
<!-- The /journal slash command prepends new entries here, one line each. -->
<!-- ENTRIES_END -->

## How to add an entry

End of session, type:

```
/journal
```

Claude will read the conversation, decide what the main work was, write a new
file in this folder, and update the index above.

You can also write entries by hand — the format is just markdown.

## How to search

- **By date**: filenames are sorted chronologically.
- **By topic**: filenames include kebab-case keywords (`*payment*`, `*auth*`).
- **By content**: `grep -r "your-keyword" .claude/journal/`

For a specific question, ask Claude — the SessionStart hook gave it the index,
so it can fetch the right file with `Read`.
