#!/bin/sh
#
# Git pre-commit hook, runs a full build and cowardly refuses to commit on fail

git stash -q --keep-index
./pre-commit-test.sh
RESULT=$?
git stash pop -q

if [ $RESULT -ne 0 ]
  then
    echo >&2 "Build failing, refusing to commit!"
    exit 1
fi
exit 0
