#!/usr/bin/env bash

export LC_ALL=C

if [[ "$EVENT_NAME" == "pull_request" ]]; then
  range="$BASE_SHA..$HEAD_SHA"
  mapfile -t messages < <(git log --format=%s --no-merges "$range")
elif [[ "$BEFORE_SHA" =~ ^0+$ ]]; then
  mapfile -t messages < <(git log -1 --format=%s "$AFTER_SHA")
else
  mapfile -t messages < <(git log --format=%s --no-merges "$BEFORE_SHA..$AFTER_SHA")
fi

for message in "${messages[@]}"; do
  if (( ${#message} > 100 )); then
    echo "Invalid commit message: exceeds 100 characters"
    echo "$message"
    exit 1
  fi

  if [[ ! "$message" =~ ^(feat|fix|docs|refactor|test|chore):\ (.+)$ ]]; then
    echo "Invalid commit message: $message"
    echo "Expected: <type>: <description>"
    echo "Allowed types: feat, fix, docs, refactor, test, chore."
    exit 1
  fi

  description="${BASH_REMATCH[2]}"

  if [[ -z "${description//[[:space:]]/}" || "$description" =~ ^[[:space:]] ]]; then
    echo "Invalid commit message: description is empty"
    exit 1
  fi

  if [[ "$message" == *. ]]; then
    echo "Invalid commit message: do not end the description with a period"
    echo "$message"
    exit 1
  fi

  if [[ "$message" =~ [^[:print:]] ]]; then
    echo "Invalid commit message: use printable ASCII characters for English text"
    echo "$message"
    exit 1
  fi

  case "${description,,}" in
    "update code"|"changes"|"update"|"fix stuff"|"work"|"changes made")
      echo "Invalid commit message: description is too generic"
      echo "$message"
      exit 1
      ;;
  esac
done

echo "Commit messages follow the required convention."