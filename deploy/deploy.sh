#!/usr/bin/env bash
# Forced command for the CI deploy key on the web host (see deploy/README.md).
# The client may only pass a commit sha. The compose file is fetched from the
# GitHub repository at that commit, so a leaked key can only redeploy code that
# is already in the repo.
set -euo pipefail

REPO=j4ck3/bolaget-skraparen
DIR=/home/ubuntu/c/hemsida-bolaget-skraparen

ref=${SSH_ORIGINAL_COMMAND:-master}
if [[ ! $ref =~ ^([0-9a-f]{40}|master)$ ]]; then
  echo "refusing ref: $ref" >&2
  exit 2
fi

cd "$DIR"
tmp=$(mktemp "$DIR/.compose.XXXXXX")
trap 'rm -f "$tmp"' EXIT

curl -fsSL --max-filesize 65536 \
  "https://raw.githubusercontent.com/$REPO/$ref/compose.prod.yml" -o "$tmp"
docker compose -f "$tmp" config -q
mv "$tmp" compose.yml
trap - EXIT

# The images are public. Pull anonymously so stale ghcr.io credentials in the
# user's docker config (used by other private packages) cannot break the deploy.
anon=$(mktemp -d)
DOCKER_CONFIG=$anon docker compose -f compose.yml pull
rm -rf "$anon"
docker compose -f compose.yml up -d --remove-orphans
docker image prune -f >/dev/null
docker compose -f compose.yml ps
