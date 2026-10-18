#!/usr/bin/env bash

if [[ "$EVENT_NAME" == "pull_request" ]]; then
  case "$BASE_BRANCH:$HEAD_BRANCH" in
    develop:feature/?*|develop:defect/?*|develop:chore/?*|main:develop)
      echo "Allowed pull request: $HEAD_BRANCH -> $BASE_BRANCH"
      ;;
    *)
      echo "Rejected pull request flow: $HEAD_BRANCH -> $BASE_BRANCH"
      echo "feature/*, defect/*, and chore/* must target develop; only develop may target main."
      exit 1
      ;;
  esac
else
  case "$BRANCH_NAME" in
    main|develop|feature/?*|defect/?*|chore/?*)
      echo "Allowed branch: $BRANCH_NAME"
      ;;
    *)
      echo "Unsupported branch name: $BRANCH_NAME"
      echo "Use main, develop, feature/<name>, defect/<name>, or chore/<name>."
      exit 1
      ;;
  esac
fi