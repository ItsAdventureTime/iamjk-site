#!/usr/bin/env bash
set -Eeuo pipefail

project_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
container_image="${CONTAINER_IMAGE:-docker.io/library/node:24-alpine}"
vps_user="${VPS_USER:-jk}"
vps_host="${VPS_HOST:-}"
vps_path="${VPS_PATH:-/home/jk/iamjk-site}"
pnpm_version="${PNPM_VERSION:-11.15.1}"
release_image="${RELEASE_IMAGE:-localhost/iamjk-site:release}"
release_bundle="$(mktemp -t iamjk-site-release.XXXXXX.tar)"
remote_bundle="$vps_path/.iamjk-site-release.tar"
trap 'rm -f "$release_bundle"' EXIT

if [[ -z "$vps_host" ]]; then
  printf 'Set VPS_HOST before deploying.\n' >&2
  exit 2
fi

for command_name in podman rsync ssh; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    printf 'Required command not found: %s\n' "$command_name" >&2
    exit 127
  fi
done

machine_state="$(podman machine inspect --format '{{.State}}' 2>/dev/null || true)"
case "$machine_state" in
  running|Running)
    ;;
  *)
    podman machine start
    ;;
esac

podman run --rm \
  --volume "$project_dir:/workspace" \
  --workdir /workspace \
  --tmpfs /workspace/node_modules:notmpcopyup \
  "$container_image" \
  sh -lc "npm install --global pnpm@$pnpm_version && CI=true pnpm install --frozen-lockfile && CI=true pnpm test"

podman build --tag "$release_image" --file "$project_dir/Containerfile" "$project_dir"
podman save --format oci-archive --output "$release_bundle" "$release_image"
ssh -- "$vps_user@$vps_host" "mkdir -p '$vps_path'"
rsync --archive --compress --human-readable --itemize-changes \
  "$release_bundle" "$vps_user@$vps_host:$remote_bundle"
ssh -- "$vps_user@$vps_host" \
  "podman load --input '$remote_bundle' && rm -f '$remote_bundle' && systemctl --user daemon-reload && systemctl --user restart iamjk-site.service"

ssh -- "$vps_user@$vps_host" bunny-purge

printf 'Deployment complete: %s@%s:%s\n' "$vps_user" "$vps_host" "$vps_path"
