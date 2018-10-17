#!/usr/bin/env bash

. ./.circleci/export-env-vars.sh

VERSION=$(date +"%d-%b-%Y %T")
DATA="{\"version\": \"${COMMIT_HASH}\"}"

SERVER_URL="https://sentry.io/api/hooks/release/builtin/1302296/63f3a0597c61f681ac92f0d4108a1aa58d7032e5d4298dfc69b806e9652482d5/"

curl $SERVER_URL \
  -X POST \
  -H 'Content-Type: application/json' \
  -d "${DATA}"