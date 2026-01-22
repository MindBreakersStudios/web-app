#!/usr/bin/env bash
# =============================================================================
# MindBreakers Skill Sync Script
# Syncs skill metadata to AGENTS.md auto-invoke tables
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"
ROOT_DIR="$(dirname "$SKILLS_DIR")"
AGENTS_FILE="$ROOT_DIR/AGENTS.md"

echo "🔄 MindBreakers Skill Sync"
echo "=========================="
echo ""

# Check if AGENTS.md exists
if [[ ! -f "$AGENTS_FILE" ]]; then
    echo "❌ Error: AGENTS.md not found at $AGENTS_FILE"
    exit 1
fi

# Collect auto-invoke entries
declare -a ENTRIES=()

for skill_dir in "$SKILLS_DIR"/*/; do
    skill_name=$(basename "$skill_dir")
    skill_file="$skill_dir/SKILL.md"
    
    # Skip if not a skill directory
    if [[ ! -f "$skill_file" ]]; then
        continue
    fi
    
    # Extract auto_invoke from frontmatter
    # Look for: auto_invoke: "something" or auto_invoke: 'something'
    auto_invoke=$(grep -E '^\s*auto_invoke:' "$skill_file" 2>/dev/null | head -1 | sed -E 's/.*auto_invoke:\s*["\x27]([^"\x27]+)["\x27].*/\1/' || echo "")
    
    if [[ -n "$auto_invoke" ]]; then
        ENTRIES+=("| $auto_invoke | \`$skill_name\` |")
        echo "✅ Found: $skill_name → \"$auto_invoke\""
    fi
done

if [[ ${#ENTRIES[@]} -eq 0 ]]; then
    echo ""
    echo "⚠️  No skills with auto_invoke found"
    exit 0
fi

# Generate table content
TABLE_CONTENT="| Acción | Skill |
|--------|-------|"

for entry in "${ENTRIES[@]}"; do
    TABLE_CONTENT="$TABLE_CONTENT
$entry"
done

echo ""
echo "📝 Generated table:"
echo "$TABLE_CONTENT"
echo ""

# Check for markers in AGENTS.md
if ! grep -q "<!-- AUTO-INVOKE-START -->" "$AGENTS_FILE"; then
    echo "⚠️  Markers not found in AGENTS.md"
    echo "   Add these markers where you want the auto-invoke table:"
    echo ""
    echo "   <!-- AUTO-INVOKE-START -->"
    echo "   <!-- AUTO-INVOKE-END -->"
    echo ""
    echo "   Then run this script again."
    exit 0
fi

# Update AGENTS.md between markers
# Using awk for cross-platform compatibility
awk -v table="$TABLE_CONTENT" '
    /<!-- AUTO-INVOKE-START -->/ {
        print
        print table
        skip = 1
        next
    }
    /<!-- AUTO-INVOKE-END -->/ {
        skip = 0
    }
    !skip {
        print
    }
' "$AGENTS_FILE" > "$AGENTS_FILE.tmp"

mv "$AGENTS_FILE.tmp" "$AGENTS_FILE"

echo "✅ Updated AGENTS.md"
echo ""
echo "Done!"
