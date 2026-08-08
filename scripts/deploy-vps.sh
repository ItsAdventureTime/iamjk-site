#!/usr/bin/env bash
set -Eeuo pipefail

project_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
container_image="${CONTAINER_IMAGE:-docker.io/library/node:24-alpine}"
vps_user="${VPS_USER:-jk}"
vps_host="${VPS_HOST:-}"
vps_path="${VPS_PATH:-/home/jk/iamjk-site}"
pnpm_version="${PNPM_VERSION:-11.15.1}"
release_image="${RELEASE_IMAGE:-localhost/iamjk-site:release}"
quadlet_dir="${QUADLET_DIR:-/home/$vps_user/.config/containers/systemd/iamjk-site}"
quadlet_file="$quadlet_dir/iamjk-site.container"
caddy_config_path="${CADDY_CONFIG_PATH:-/home/$vps_user/caddy/conf/Caddyfile}"
update_caddy="${UPDATE_CADDY:-1}"
app_container_name="${APP_CONTAINER_NAME:-}"
backup_stamp="$(date -u +%Y%m%d%H%M%S)"
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
ssh "${ssh_options[@]}" -- "$ssh_target" \
  "mkdir -p '$vps_path' '$quadlet_dir'"
printf 'Installing/updating the application Quadlet with rsync...\n'
rsync --archive --human-readable --itemize-changes \
  -e "ssh ${ssh_options[*]}" \
  "$project_dir/deploy/iamjk-site.container.example" "$ssh_target:$quadlet_file"
ssh "${ssh_options[@]}" -- "$ssh_target" \
  "for secret in iamjk-site_TURNSTILE_SECRET iamjk-site_resend-api-key iamjk-site_resend-from iamjk-site_resend-to; do podman secret inspect \"\$secret\" >/dev/null || { echo \"Missing Podman secret: \$secret\" >&2; exit 1; }; done"
if [[ "$update_caddy" == "1" ]]; then
  printf 'Updating the iamjk.site Caddy upstream...\n'
  ssh "${ssh_options[@]}" -- "$ssh_target" \
    "if grep -Fq 'reverse_proxy iamjk-site:4321' '$caddy_config_path'; then :; elif grep -Fq 'reverse_proxy 127.0.0.1:4321' '$caddy_config_path'; then cp '$caddy_config_path' '$caddy_config_path.before-iamjk-network-fix.$backup_stamp' && sed -i 's/reverse_proxy 127\\.0\\.0\\.1:4321/reverse_proxy iamjk-site:4321/' '$caddy_config_path'; else echo 'Could not find the expected iamjk.site reverse_proxy directive; set UPDATE_CADDY=0 and update Caddy manually.' >&2; exit 1; fi"
fi
printf 'Uploading release archive (progress shown below)...\n'
rsync --archive --human-readable --itemize-changes --info=progress2 --partial --timeout=60 \
  -e "ssh ${ssh_options[*]}" \
  "$release_bundle" "$ssh_target:$remote_bundle"
ssh "${ssh_options[@]}" -- "$ssh_target" \
  "podman load --input '$remote_bundle' && rm -f '$remote_bundle' && systemctl --user daemon-reload && systemctl --user restart iamjk-site.service"

printf 'Checking the running application container...\n'
if [[ -z "$app_container_name" ]]; then
  app_container_name="$(ssh "${ssh_options[@]}" -- "$ssh_target" \
    "podman ps --format '{{.Names}}' | grep -E '^(iamjk-site|systemd-iamjk-site)$' | head -n 1" || true)"
fi
if [[ -z "$app_container_name" ]]; then
  printf 'Application container was not found after restarting iamjk-site.service.\n' >&2
  ssh "${ssh_options[@]}" -- "$ssh_target" \
    "systemctl --user status iamjk-site.service --no-pager || true; journalctl --user -u iamjk-site.service -n 80 --no-pager || true; podman ps --all --format 'table {{.Names}}\\t{{.Status}}'" >&2
  exit 1
fi
printf 'Application container: %s\n' "$app_container_name"
ssh "${ssh_options[@]}" -- "$ssh_target" \
  "podman exec '$app_container_name' node -e 'fetch(\"http://127.0.0.1:4321/\").then(async response => { const html = await response.text(); if (!response.ok || !html.includes(\"contact-form\")) process.exit(1); }).catch(() => process.exit(1))'"

if [[ "$update_caddy" == "1" ]]; then
  ssh "${ssh_options[@]}" -- "$ssh_target" \
    "podman exec caddy caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile && systemctl --user daemon-reload && systemctl --user restart caddy.service"
fi

ssh "${ssh_options[@]}" -- "$ssh_target" bunny-purge

printf 'Deployment complete: %s@%s:%s\n' "$vps_user" "$vps_host" "$vps_path"
