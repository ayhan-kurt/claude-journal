---
description: Archive the current session's main work as a 15-30 line summary under `.claude/journal/`
---

Scan the current conversation and identify the **most important piece of work**
done in this session, then archive it under `.claude/journal/`. If multiple
distinct pieces of work happened, write a separate file for each.

## Steps

1. **Get today's date** in `YYYY-MM-DD` format.
2. **Pick a title slug**: 3–6 kebab-case words describing what was done.
   Examples: `add-utm-tracking`, `migrate-postgres-15`, `fix-auth-callback-bug`.
3. **File path**: `.claude/journal/YYYY-MM-DD-slug.md`
4. **Content format**:

   ```markdown
   ---
   date: YYYY-MM-DD
   tags: [tag1, tag2, tag3]
   status: completed | in-progress | blocked
   ---

   # Title (human-readable, 5–10 words)

   ## Context (Trigger)

   2–4 sentences. What started this work? What problem or decision triggered it?

   ## What was done

   - 3–7 bullets, short and action-oriented
   - "Added X", "Refactored Y", "Investigated Z"
   - Call out architectural decisions explicitly (e.g. "30-day cookie", "first-touch")

   ## Files touched

   - Full path list (3–15 files)
   - Mark new files with `(new)`

   ## Outcome / Lessons

   - Why decisions were made the way they were
   - Unexpected findings
   - **What is still NOT done** (next steps)
   - Things to watch for in future work

   ## Related memory / skills

   - Pointers (memory files, skills, related entries)
   - Previous journal entries this connects to
   ```

5. **Update the index** in `.claude/journal/README.md`. Find the
   `<!-- ENTRIES_START -->` and `<!-- ENTRIES_END -->` markers and prepend
   a new line at the top of the entries block:

   ```
   - [YYYY-MM-DD: Title](YYYY-MM-DD-slug.md) — one-sentence hook (~80 chars)
   ```

   Newest entries go on top.

## Rules

- **Concise.** 15–30 total lines. Don't write an essay.
- **Don't duplicate.** If something is already documented in a skill or memory,
  point at it instead of copying. Use the "Related memory / skills" section.
- **Practical.** Answer the question: "What does someone reading this six months
  from now need to know?"
- **Decisions need rationale.** Don't just say "set cookie to 30 days" —
  explain why. The "why" is the durable value of the journal.
- **If the file already exists** for the same date + slug, append `-2`, `-3`, etc.
  to the slug.
