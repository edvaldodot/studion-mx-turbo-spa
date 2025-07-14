#!/bin/sh

if [ ! -f '.git/hooks/pre-commit' ]; then
  ln -s ../../scripts/pre-commit.githook .git/hooks/pre-commit
fi
