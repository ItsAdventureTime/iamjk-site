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
# macOS can reject ControlPath values longer than the Unix socket limit.
# Keep this path short; %C still makes the socket unique per SSH destination.
ssh_control_dir="$(mktemp -d /tmp/iamjk-site-XXXXXX)"
ssh_control_path="$ssh_control_dir/control"
ssh_target="$vps_user@$vps_host"
ssh_options=(-o ControlMaster=auto -o ControlPersist=5m -o ControlPath="$ssh_control_path")
remote_bundle="$vps_path/.iamjk-site-release.tar"

cleanup() {
  ssh "${ssh_options[@]}" -O exit -- "$ssh_target" >/dev/null 2>&1 || true
  rm -f "$release_bundle"
  rmdir "$ssh_control_dir" >/dev/null 2>&1 || true
}
trap cleanup EXIT

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
printf 'Opening authenticated SSH connection to %s...\n' "$ssh_target"
ssh "${ssh_options[@]}" -MNf -- "$ssh_target"
ssh "${ssh_options[@]}" -- "$ssh_target" "mkdir -p '$vps_path'"
printf 'Uploading release archive (progress shown below)...\n'
rsync --archive --human-readable --itemize-changes --info=progress2 --partial --timeout=60 \
  -e "ssh ${ssh_options[*]}" \
  "$release_bundle" "$ssh_target:$remote_bundle"
ssh "${ssh_options[@]}" -- "$ssh_target" \
  "podman load --input '$remote_bundle' && rm -f '$remote_bundle' && systemctl --user daemon-reload && systemctl --user restart iamjk-site.service"

ssh "${ssh_options[@]}" -- "$ssh_target" bunny-purge

printf 'Deployment complete: %s@%s:%s\n' "$vps_user" "$vps_host" "$vps_path"
