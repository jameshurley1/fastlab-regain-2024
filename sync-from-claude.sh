#!/bin/bash
echo "Fetching latest from origin..."
git fetch origin
BRANCH=$(git branch -r --sort=-committerdate | grep 'origin/claude/' | head -1 | xargs)
echo "Merging Claude Code branch: $BRANCH"
git merge "$BRANCH"
echo "Pushing to origin/main..."
git push origin main
echo "Done! Run: git log --oneline -5 to verify."
