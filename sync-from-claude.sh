#!/bin/bash
echo "Fetching latest from origin..."
git fetch origin
CLAUDE_BRANCH=$(git branch -r | grep 'origin/claude/' | sort | tail -1 | tr -d ' ')
echo "Merging latest Claude Code branch: $CLAUDE_BRANCH"
git merge $CLAUDE_BRANCH
echo "Pushing to origin/main..."
git push origin main
echo "Done! Run: git log --oneline -5 to verify."
