# claude-journal

> **Give Claude Code a memory it never forgets — without plugins, databases, or vendor lock-in.**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-zero-brightgreen)](#)
[![Storage](https://img.shields.io/badge/storage-markdown%20%2B%20git-blue)](#)
[![Setup](https://img.shields.io/badge/setup-5%20minutes-orange)](#quick-start)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Hooks%20%2B%20Slash%20Command-7C3AED)](#)

A **5-minute drop-in** for any Claude Code project that turns your sessions into a permanent, human-readable decision log. No SQLite. No vector DB. No MCP server. No third-party services.

Just **markdown files in `.claude/journal/`** — written by Claude when _you_ say so, loaded automatically on every new session, and yours forever.

---

## 🚀 Why this exists

Claude Code is **stateless across sessions**. Every new conversation starts from zero — no memory of decisions, no awareness of recent work, no context.

The community has answered with [46K-star auto-capture plugins](https://github.com/thedotmack/claude-mem), [hosted memory APIs](https://mem0.ai), and [Obsidian-bridged knowledge bases](https://github.com/AgriciDaniel/claude-obsidian). They are powerful — and they all share one trade-off: **your project's history lives in a format only their tooling can read.**

`claude-journal` makes the opposite bet:

| If your project will be alive in 5 years…                                 | Then your decision log should live in… |
| ------------------------------------------------------------------------- | -------------------------------------- |
| ❌ A SQLite + Chroma database that depends on a plugin being maintained   |                                        |
| ❌ A hosted SaaS that requires an account and an API key                  |                                        |
| ✅ **Markdown files in git that any human, any agent, any tool can read** | ← this is `claude-journal`             |

---

## 💎 What you get

Three small files in `.claude/`, plus a config snippet. That's it.

| Piece                    | What it does                                                                                                                                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/journal` slash command | You type `/journal` — Claude summarizes the session into a dated `.md` file under `.claude/journal/`, updates the index. **You're always in control.**                                                                         |
| `SessionStart` hook      | Every new session, Claude automatically sees the last 10 entries. Your project's recent history is **already in context** before your first message.                                                                           |
| `PreCompact` hook        | Right before Claude's context compacts (and decisions vanish into a summary), a reminder fires to journal first. Direct mitigation for [anthropics/claude-code#25999](https://github.com/anthropics/claude-code/issues/25999). |
| `Stop` hook (smart)      | After every response, checks: _did real work happen and is it not yet journaled?_ If yes, gentle reminder. Otherwise silent. **No spam, no nag.**                                                                              |

All three hooks `exit 0` on any error path. They are **non-blocking** — if they fail, Claude continues normally. Zero risk of breaking your workflow.

---

## ⚡ 30-second demo

```
You: "Refactor the auth middleware to use JWT instead of sessions."
Claude: [does the work, edits 7 files]
You: "/journal"

Claude:
✓ Created .claude/journal/2026-04-29-auth-jwt-migration.md
  ├── Context: Why JWT (stateless, mobile-ready)
  ├── What was done: 7 files, decision rationale
  ├── Files touched: full list
  ├── Outcome: token TTL chosen, refresh strategy
  └── Open items: revoke-list TODO, mobile SDK update
✓ Updated .claude/journal/README.md (entry now top of index)
```

**Next session — completely fresh chat:**

```
You: "what auth scheme are we using?"
Claude: "Based on the journal, you migrated to JWT on 2026-04-29. The
        rationale was stateless + mobile-ready. You still have an open
        TODO for the revoke-list. Want me to address that now?"
```

That's it. No setup beyond copying three files.

---

## 📦 Quick start

### 1. Drop the files into your project

```bash
# From your project root:
git clone https://github.com/ayhan-kurt/claude-journal /tmp/claude-journal
mkdir -p .claude/commands .claude/hooks .claude/journal
cp /tmp/claude-journal/.claude/commands/journal.md   .claude/commands/
cp /tmp/claude-journal/.claude/hooks/journal-*.js    .claude/hooks/
cp /tmp/claude-journal/templates/journal-readme.md   .claude/journal/README.md
```

### 2. Wire up the hooks

Open `.claude/settings.json` (or `.claude/settings.local.json`) and merge in the contents of [`templates/settings.snippet.json`](templates/settings.snippet.json). If the file doesn't exist yet, just paste the whole snippet.

### 3. (Optional but recommended) Add a pointer to `CLAUDE.md`

```markdown
## Project Journal

Important decisions and work live at `.claude/journal/`. Before starting new
work, scan recent entries: `.claude/journal/README.md`. The SessionStart hook
loads them automatically. To archive the current session, run `/journal`.
```

### 4. Try it

Start a new Claude Code session. Watch for **"Loading journal context..."** in the status — that's the SessionStart hook. (First time it's empty — nothing happens yet.)

Do real work. Edit files. Then type:

```
/journal
```

Done. You now have a permanent, searchable, human-readable decision log.

---

## 🆚 How it compares

|                              | claude-journal              | claude-mem            | Mem0 / Supermemory | claude-obsidian |
| ---------------------------- | --------------------------- | --------------------- | ------------------ | --------------- |
| **Setup time**               | ~5 min                      | ~5 min                | ~10 min (account)  | ~1–2 hr         |
| **Storage**                  | Markdown files              | SQLite + ChromaDB     | Hosted DB          | Obsidian vault  |
| **External deps**            | **None**                    | npm package           | API key + account  | Obsidian app    |
| **Auto-capture?**            | No (manual `/journal`)      | Yes                   | Yes                | Configurable    |
| **Survives plugin removal?** | ✅ Yes (just markdown)      | ⚠️ Needs export       | ❌ No              | ✅ Yes          |
| **Vector / semantic search** | No                          | Yes                   | Yes                | Yes             |
| **Best for**                 | Decision logs, lock-in-free | Hands-off auto-memory | Cross-tool memory  | Personal KB     |

Don't pick `claude-journal` if you want full automation or vector search. **Do** pick it if you want a decision log that you can read in 5 years with `cat`.

---

## 🛠 How it works

### The three hooks

| Hook           | When                           | What it injects                                                            |
| -------------- | ------------------------------ | -------------------------------------------------------------------------- |
| `SessionStart` | Every new session              | Last 10 journal entries (titles + one-line summaries)                      |
| `PreCompact`   | Just before context compaction | Reminder to `/journal` before summary kicks in                             |
| `Stop`         | After every Claude response    | Soft nudge if 2+ files changed and no entry exists for today (else silent) |

### The slash command

`/journal` is a manual trigger. It tells Claude to:

1. Read the conversation
2. Identify the main piece of work (or several)
3. Write a `YYYY-MM-DD-slug.md` file with structured frontmatter + sections
4. Prepend a one-line summary to `.claude/journal/README.md`'s index

The full prompt template is in [`.claude/commands/journal.md`](.claude/commands/journal.md). **Edit it freely** — change structure, language, tone. It's just markdown.

### Entry format

```markdown
---
date: 2026-04-29
tags: [auth, security, refactor]
status: completed
---

# Migrate auth middleware from sessions to JWT

## Context (Trigger)

Mobile SDK launching Q3 needs stateless auth. Sessions don't scale to 50K+ MAU.

## What was done

- Replaced session middleware with JWT verification
- Token TTL: 1h access + 30d refresh (industry standard)
- ...

## Files touched

- src/auth/middleware.ts
- src/auth/jwt.ts (new)
- ...

## Outcome / Lessons

- Refresh rotation chosen for security; cost: extra DB write per refresh
- Open: revoke-list (pending design decision)

## Related memory / skills

- See: 2026-04-15 auth threat model entry
- Memory: cookie-policy.md
```

---

## 🎨 Customization

Everything is plain markdown / Node.js / JSON. Common tweaks:

- **Change entry structure**: edit [`.claude/commands/journal.md`](.claude/commands/journal.md) — that's the prompt Claude follows
- **Change reminder threshold**: in [`.claude/hooks/journal-reminder.js`](.claude/hooks/journal-reminder.js), tune `if (changedCount <= 1)`
- **Disable a hook**: just remove its block from `settings.json`
- **Localize**: 5 minutes — translate the slash command and a few hook strings

---

## 🙏 Inspirations & credits

`claude-journal` is **not** an original idea. It's a deliberate stripping-down of three excellent projects:

- **[Andrej Karpathy's LLM Wiki pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)** — the underlying philosophy: a folder of markdown files, agent-curated.
- **[claude-mem](https://github.com/thedotmack/claude-mem)** (46K+ ⭐) — proved the demand for persistent Claude Code memory and informed what _not_ to do when zero lock-in is the goal.
- **[claude-memory-compiler](https://github.com/coleam00/claude-memory-compiler)** — for the hook-driven capture model. We use a much smaller subset.

**What this project changes:**

- **Manual-first, automation-second.** We never auto-write entries. Hooks only _remind_.
- **Zero dependencies.** Pure Node.js + markdown. No npm install, no SQLite, no vector DB, no MCP server.
- **Three hooks, not a framework.** Each is ~50 lines, does one thing, fails open.
- **Markdown is the source of truth** — not a derived view.

See [`INSPIRATIONS.md`](INSPIRATIONS.md) for the long-form comparison.

---

## 🗺 Roadmap

Possible additions, in priority order:

- [ ] Demo GIF in this README
- [ ] Claude Code Plugin Marketplace manifest (`.claude-plugin/plugin.json`) → `/plugin install` one-liner setup
- [ ] `--auto` flag on `/journal` for git-history backfill
- [ ] Cross-reference linker (auto "related entries" suggestions)
- [ ] Tag-based search slash command (`/journal-find tag:auth`)

We will deliberately resist adding: vector search, hosted services, anything that adds a runtime dependency. **The bet is that markdown outlives every plugin format.**

---

## 🤝 Contributing

Issues and PRs welcome. Bar for new features:

- Must not add runtime dependencies
- Must not break the manual-first principle
- Must work on Windows, macOS, Linux without modification

Bug fixes and docs improvements are easy yeses.

---

## 📄 License

MIT — see [LICENSE](LICENSE). Use it freely, fork it, rip out the parts you like.

---

<p align="center">
  <strong>If markdown is your project's source of truth, your memory should be too.</strong>
</p>
