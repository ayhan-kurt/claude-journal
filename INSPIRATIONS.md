# Inspirations & Differences

claude-journal is not an original idea. It's a deliberate stripping-down of three excellent projects, each addressing the same core problem from a different angle. This document explains what we borrowed, what we changed, and why.

## The original idea: Karpathy's LLM Wiki

[Andrej Karpathy's LLM Wiki gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) describes a personal knowledge base built collaboratively with an LLM:

> _"A folder of markdown files that I curate over time, with the help of an LLM agent..."_

The pattern is just markdown files in a folder, with the LLM helping you summarize, link, and retrieve. No databases, no embeddings, no servers — just text and structure.

**What we kept:** the entire principle. Markdown files in a folder, agent-curated, human-readable forever.

**What we changed:**

- Karpathy's pattern is general-purpose (research notes, reference material, decisions, meeting summaries). We narrowed the scope to **project decision logs only** — a chronological work archive.
- We added structured frontmatter (`date`, `tags`, `status`) to make filtering and tooling easier.
- We added Claude Code hooks for automatic context loading and gentle reminders, rather than relying on the user to remember to invoke the LLM.

## claude-mem (Alex Newman)

[claude-mem](https://github.com/thedotmack/claude-mem) is the most popular persistent-memory plugin for Claude Code (46K+ stars at the time of writing).

Its approach:

- Hooks capture every session automatically
- Sessions are AI-summarized and stored in SQLite (full-text search via FTS5)
- Embeddings are stored in ChromaDB for semantic similarity
- On next session, relevant past summaries are injected into context

**What we learned from it:** the demand for persistent memory in Claude Code is real and large. The "hooks capture sessions" model works.

**What we deliberately didn't take:**

- **Auto-capture every session.** This produces a lot of noise — typo fixes and minor edits get summarized alongside major decisions, and over time the relevance of the archive degrades.
- **SQLite + ChromaDB.** The moment your storage format isn't human-readable, you've created a migration problem. If claude-mem stops being maintained, your knowledge is in a format you have to reverse-engineer to read.
- **AI compression as the primary record.** Compression loses fidelity. We keep the human-readable journal as _the_ record, not a derived view.

In other words: claude-mem optimizes for _zero manual effort_, claude-journal optimizes for _zero lock-in_. Both are valid trade-offs; pick the one that matches your project's lifetime expectations.

## claude-memory-compiler (Cole Medin)

[claude-memory-compiler](https://github.com/coleam00/claude-memory-compiler) takes a hybrid approach:

- Hooks capture sessions
- The Claude Agent SDK extracts key decisions and lessons
- An LLM "compiler" organizes them into structured, cross-referenced articles
- The output is markdown files (yay) but with heavy LLM-driven structure

**What we kept:**

- The hook-based capture _idea_. We use it differently — only for _reminders_, not for auto-capture.
- Markdown as the output format.

**What we changed:**

- We don't run an Agent SDK pipeline. The structure of each entry is enforced by a single slash command prompt; Claude is the only "compiler."
- We don't auto-cross-reference. If you want links between entries, write them by hand. This keeps entries stable — they don't get rewritten when new entries arrive.
- Our hooks are ~50 lines of Node, not a multi-stage pipeline.

## Other projects in the space (worth knowing about)

- **[Mem0](https://mem0.ai)** & **[Supermemory](https://supermemory.ai)** — hosted memory APIs accessible via MCP. Great if you want memory that persists across multiple AI agents, not just Claude Code. Trade-off: your project history goes to a third-party server.
- **[claude-obsidian](https://github.com/AgriciDaniel/claude-obsidian)** — full Obsidian vault integration with cross-references and an MCP bridge. Great for personal knowledge management. Heavier setup.
- **[llm-wiki](https://github.com/Pratiyush/llm-wiki)** & **[llm-wiki-compiler](https://github.com/ussumant/llm-wiki-compiler)** — Karpathy-pattern implementations with web UIs and topic clustering. Good middle ground if you want a richer reading experience.

## What this project is _not_

- Not a vector search engine. If you need semantic similarity over thousands of entries, use claude-mem or Mem0.
- Not a knowledge graph. Entries are chronological, not ontological.
- Not a wiki. There's no cross-page editing, no transclusion, no linkbacks. Just dated entries and an index.
- Not automated. You always type `/journal` yourself.

If those limitations are dealbreakers, one of the projects above is a better fit. If they sound like _features_ — that's exactly the audience we're aiming for.

## Why this minimalism matters

The longer a project runs, the more its tooling churns. Claude Code itself was new in 2025; in five years it might be replaced by something else. SQLite plugins, ChromaDB indices, MCP servers — these are real systems that real engineers will need to keep alive.

Markdown files in a git repo will outlive every one of them.

That's the bet.
