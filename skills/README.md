# AI Agent Skills

This directory contains **Agent Skills** following the [Agent Skills open standard](https://agentskills.io). Skills provide domain-specific patterns, conventions, and guardrails that help AI coding assistants understand project-specific requirements.

## What Are Skills?

Skills teach AI assistants how to perform specific tasks. When an AI loads a skill, it gains context about:

- Critical rules (what to always/never do)
- Code patterns and conventions
- Project-specific workflows
- References to detailed documentation

## Setup

Run the setup script to configure skills for all supported AI coding assistants:

```bash
./skills/setup.sh
```

This creates symlinks so each tool finds skills in its expected location:

| Tool | Symlink Created |
|------|-----------------|
| Claude Code / OpenCode | `.claude/skills/` |
| Codex (OpenAI) | `.codex/skills/` |
| GitHub Copilot | `.github/skills/` |
| Gemini CLI | `.gemini/skills/` |
| Cursor | `.cursor/skills/` |

## Available Skills

### Core Skills

| Skill | Description |
|-------|-------------|
| `mindbreakers` | Project overview, structure, conventions |
| `react-components` | React + TypeScript component patterns |
| `tailwind-styling` | Tailwind CSS patterns, dark theme |
| `routing-pages` | React Router, page structure |

### Community Skills

| Skill | Description |
|-------|-------------|
| `contributing` | How to contribute, PR workflow |
| `i18n` | Internationalization (Spanish/English) |
| `skill-creator` | Create new AI agent skills |
| `skill-sync` | Sync skill metadata to AGENTS.md |

## Creating New Skills

Use the `skill-creator` skill for guidance:

```
Read skills/skill-creator/SKILL.md
```

### Quick Checklist

1. Create directory: `skills/{skill-name}/`
2. Add `SKILL.md` with required frontmatter
3. Add `metadata.scope` and `metadata.auto_invoke` fields
4. Keep content concise (under 500 lines)
5. Run `./skills/skill-sync/assets/sync.sh` to update AGENTS.md

## Directory Structure

```
skills/
├── {skill-name}/
│   ├── SKILL.md              # Required - main instructions
│   ├── assets/               # Optional - templates, scripts
│   └── references/           # Optional - links to local docs
├── setup.sh                  # Multi-AI tool setup
└── README.md                 # This file
```
