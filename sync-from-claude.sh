#!/bin/bash
echo "Fetching latest from origin..."
git fetch origin
echo "Merging Claude Code branch..."
git merge origin/claude/review-codebase-setup-F6QPb
echo "Pushing to origin/main..."
git push origin main
echo "Done! Run: git log --oneline -5 to verify."
