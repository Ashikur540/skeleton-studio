# Docker Deployment

Replaces the systemd unit. Nginx stays exactly as it is.

```
before:  nginx :8081 → proxy_pass 127.0.0.1:5000 → systemd → node
after:   nginx :8081 → proxy_pass 127.0.0.1:5000 → docker  → node
```

Only the thing behind port 5000 changes.

| File | Role |
|---|---|
| `Dockerfile` | How the image is built |
| `.dockerignore` | What is left out of the build |
| `docker-compose.yml` | How the container runs on the server |
| `.github/workflows/docker-publish.yml` | Build on push, push to GHCR, deploy |

---

## The gotcha

`NEXT_PUBLIC_*` vars are inlined into the JavaScript **during `next build`**.
They are not read at runtime.

- ✅ `--build-arg NEXT_PUBLIC_SITE_URL=...`
- ❌ `docker run -e NEXT_PUBLIC_SITE_URL=...`

Changing one means rebuilding the image, not restarting the container.

---

## Test locally first

```bash
docker build -t skeleton-studio:test .
docker run -d --name ss --rm -p 3000:3000 skeleton-studio:test
curl -I http://127.0.0.1:3000
docker logs -f ss
docker stop ss
```

---

## Server setup (once)

```bash
# install docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER      # log out and back in

# app folder — only the compose file, no source code needed
sudo mkdir -p /opt/skeleton-studio
sudo chown $USER:$USER /opt/skeleton-studio
cd /opt/skeleton-studio
# scp docker-compose.yml here

docker compose pull
```

If the GHCR package is private, log in first. Making it public is simpler for
an OSS repo: GitHub → Packages → skeleton-studio → Package settings →
Change visibility.

---

## Cut over from systemd

Both want port 5000, so the unit stops before the container starts. Short
outage in between.

```bash
sudo ss -ltnp | grep :5000          # confirm what holds the port now

sudo systemctl stop skeleton-studio  # your actual unit name
sudo systemctl disable skeleton-studio

docker compose up -d
docker compose ps                    # wait for "healthy"

curl -I http://127.0.0.1:5000        # container direct
curl -I http://127.0.0.1:8081        # through nginx
```

Rollback: `docker compose down && sudo systemctl start skeleton-studio`.
Keep the old unit file around for a few days.

---

## GitHub setup

Repo → Settings → Secrets and variables → Actions.

**Variables:** `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CLARITY_PROJECT_ID`
(optional), `DEPLOY_ENABLED=true`

**Secrets:** `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`, `DEPLOY_PATH`

Leave `DEPLOY_ENABLED` unset until the image builds cleanly — the deploy job
is skipped when it is not `true`.

---

## Daily commands

```bash
docker compose logs -f web                     # logs (was: journalctl -u ...)
docker compose ps                              # status
docker compose pull && docker compose up -d    # deploy
docker compose restart web                     # restart
docker compose down                            # stop
```

Roll back to an older build — every commit is tagged `sha-<short>`. Edit the
`image:` line in `docker-compose.yml` to that tag and `docker compose up -d`.

---

## Why it is built this way

- **`output: "standalone"`** — Next copies only the modules the app actually
  imports, so the runtime image never runs `npm install`. 313 MB instead of
  ~1.2 GB.
- **Separate `deps` stage** — `npm ci` is cached on the lockfile, so editing
  source does not reinstall dependencies.
- **Non-root user** — the process cannot write to its own image.
- **`127.0.0.1:5000:3000`** — binding to `0.0.0.0` would expose the app
  directly and bypass nginx. Docker writes its own iptables rules and can
  punch through UFW, so loopback binding matters.
- **`restart: unless-stopped`** — replaces `Restart=always`.
- **Log rotation** — without `max-size` the JSON logs grow until the disk
  fills. Most common self-hosted Docker outage.
