# Deployment

Pushing to `master` runs `.github/workflows/build-deploy.yml`:

1. Each app whose files changed is built natively on a GitHub-hosted arm64 runner and pushed to GHCR as `:latest` and `:sha-<short>`.
2. The `deploy` job connects over SSH to the `web` host and sends only the commit sha. The deploy key is restricted to a forced command, `deploy.sh`, which downloads `compose.prod.yml` at that commit from GitHub, validates it, saves it as `compose.yml`, then runs `pull` and `up -d`. A leaked key can therefore only redeploy what is already in the repository.

## Host setup (one-time, already done)

- `deploy.sh` lives at `/home/ubuntu/c/hemsida-bolaget-skraparen/deploy.sh`.
- The `authorized_keys` entry for the CI key:

  ```
  command="/home/ubuntu/c/hemsida-bolaget-skraparen/deploy.sh",no-pty,no-port-forwarding,no-agent-forwarding,no-X11-forwarding ssh-ed25519 AAAA... github-actions-bolaget
  ```

- GitHub repository secrets: `DEPLOY_SSH_KEY` (private key), `DEPLOY_HOST`, `DEPLOY_KNOWN_HOSTS`.

## Rollback

On the host, pin a previous image and bring the stack up:

```
cd /home/ubuntu/c/hemsida-bolaget-skraparen
WEB_TAG=sha-abc1234 SCRAPER_TAG=sha-def5678 docker compose up -d
```

The pre-GitHub compose file is kept as `compose.gitlab.yml.bak` in the same directory.
