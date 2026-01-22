#!/usr/bin/env bash
# =============================================================================
# MindBreakers Skills Setup Script
# Creates symlinks for all supported AI coding assistants
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🚀 MindBreakers Skills Setup"
echo "================================"
echo "Root directory: $ROOT_DIR"
echo ""

# Define symlink targets
declare -A TARGETS=(
    [".claude/skills"]="Claude Code / OpenCode"
    [".codex/skills"]="Codex (OpenAI)"
    [".github/skills"]="GitHub Copilot"
    [".gemini/skills"]="Gemini CLI"
    [".cursor/skills"]="Cursor"
)

# Create symlinks
for target in "${!TARGETS[@]}"; do
    target_dir="$ROOT_DIR/$target"
    parent_dir="$(dirname "$target_dir")"
    tool_name="${TARGETS[$target]}"
    
    # Create parent directory if it doesn't exist
    if [[ ! -d "$parent_dir" ]]; then
        mkdir -p "$parent_dir"
        echo "📁 Created directory: $parent_dir"
    fi
    
    # Remove existing symlink or directory
    if [[ -L "$target_dir" ]]; then
        rm "$target_dir"
    elif [[ -d "$target_dir" ]]; then
        echo "⚠️  Warning: $target_dir exists as directory, skipping..."
        continue
    fi
    
    # Create relative symlink
    # Calculate relative path from target to skills directory
    rel_path="../skills"
    if [[ "$target" == ".github/skills" ]]; then
        rel_path="../../skills"
    fi
    
    ln -s "$rel_path" "$target_dir"
    echo "✅ Linked $target_dir → $tool_name"
done

echo ""
echo "================================"
echo "✅ Setup complete!"
echo ""
echo "Restart your AI coding assistant to load the skills."
echo ""
echo "To verify, ask your AI assistant:"
echo '  "Read the mindbreakers skill and summarize the project"'
