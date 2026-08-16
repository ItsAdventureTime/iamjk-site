#!/usr/bin/env bash
set -Eeuo pipefail

project_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
config_path="${DEPLOY_CONFIG_FILE:-$project_dir/.deploy-vps.conf}"
init_config=0

usage() {
  printf '%s\n' \
    'Usage: ./scripts/deploy-vps.sh [--init] [--config PATH]' \
    '' \
    'Normal update:' \
    '  ./scripts/deploy-vps.sh' \
    '  Runs the Node 24 gate and image build through jk-sbx-project; the VPS only loads the image.' \
    '' \
    'Options:' \
    '  --init          Create the local deployment config interactively.' \
    '  --config PATH   Use a different local config file.' \
    '  --help          Show this help.' \
    '' \
    'One-off environment-variable overrides remain supported for automation.'
}

while (($# > 0)); do
  case "$1" in
    --help|-h)
      usage
      exit 0
      ;;
    --init)
      init_config=1
      shift
      ;;
    --config)
      if (($# < 2)); then
        printf '%s\n' '--config requires a path.' >&2
        exit 2
      fi
      config_path="$2"
      shift 2
      ;;
    *)
      printf 'Unknown option: %s\n' "$1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

if [[ "$config_path" != /* ]]; then
  config_path="$project_dir/$config_path"
fi

init_deploy_config() {
  local host user path

  if [[ -e "$config_path" ]]; then
    printf 'Deployment config already exists: %s\n' "$config_path" >&2
    printf '%s\n' 'Edit it directly or choose another path with --config.' >&2
    exit 1
  fi
  if [[ ! -t 0 ]]; then
    printf '%s\n' 'Interactive setup requires a terminal. Copy deploy/iamjk-site.local.conf.example or provide VPS_HOST for a one-off deployment.' >&2
    exit 2
  fi

  read -r -p 'VPS host (required): ' host
  read -r -p 'VPS user [jk]: ' user
  read -r -p "VPS path [/home/${user:-jk}/iamjk-site]: " path
  user="${user:-jk}"
  path="${path:-/home/$user/iamjk-site}"

  if [[ -z "$host" || "$host" == *[[:space:]]* ]]; then
    printf '%s\n' 'VPS host must be non-empty and contain no whitespace.' >&2
    exit 2
  fi
  if [[ -z "$user" || "$user" == *[[:space:]]* ]]; then
    printf '%s\n' 'VPS user must be non-empty and contain no whitespace.' >&2
    exit 2
  fi
  if [[ -z "$path" ]]; then
    printf '%s\n' 'VPS path must be non-empty.' >&2
    exit 2
  fi

  umask 077
  mkdir -p -- "$(dirname -- "$config_path")"
  {
    printf '%s\n' '# Local-only iamjk.site deployment settings.'
    printf '%s\n' '# Do not add secrets here; VPS Podman secrets stay on the server.'
    printf 'DEPLOY_VPS_HOST=%q\n' "$host"
    printf 'DEPLOY_VPS_USER=%q\n' "$user"
    printf 'DEPLOY_VPS_PATH=%q\n' "$path"
  } > "$config_path"
  chmod 600 "$config_path"
  printf 'Created %s (mode 600).\n' "$config_path"
  printf '%s\n' 'Run ./scripts/deploy-vps.sh to deploy the current checkout.'
}

if (( init_config )); then
  init_deploy_config
  exit 0
fi

if [[ -f "$config_path" ]]; then
  # shellcheck disable=SC1090
  source "$config_path"
fi

vps_user="${VPS_USER:-${DEPLOY_VPS_USER:-jk}}"
vps_host="${VPS_HOST:-${DEPLOY_VPS_HOST:-}}"
vps_path="${VPS_PATH:-${DEPLOY_VPS_PATH:-/home/$vps_user/iamjk-site}}"
pnpm_version="${PNPM_VERSION:-${DEPLOY_PNPM_VERSION:-11.15.1}}"
release_image="${RELEASE_IMAGE:-${DEPLOY_RELEASE_IMAGE:-localhost/iamjk-site:release}}"
target_platform="${TARGET_PLATFORM:-${DEPLOY_TARGET_PLATFORM:-}}"
quadlet_dir="${QUADLET_DIR:-${DEPLOY_QUADLET_DIR:-/home/$vps_user/.config/containers/systemd/iamjk-site}}"
quadlet_file="$quadlet_dir/iamjk-site.container"
caddy_config_path="${CADDY_CONFIG_PATH:-${DEPLOY_CADDY_CONFIG_PATH:-/home/$vps_user/caddy/conf/Caddyfile}}"
update_caddy="${UPDATE_CADDY:-${DEPLOY_UPDATE_CADDY:-1}}"
app_container_name="${APP_CONTAINER_NAME:-${DEPLOY_APP_CONTAINER_NAME:-}}"
release_archive="$project_dir/.iamjk-site-release.tar"
remote_release_archive="$vps_path/.iamjk-site-release.tar"

if [[ ! "$pnpm_version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  printf 'Invalid pnpm version: %s\n' "$pnpm_version" >&2
  exit 2
fi

if [[ -z "$vps_host" ]]; then
  printf '%s\n' 'No VPS host configured.' >&2
  printf '%s\n' 'Run ./scripts/deploy-vps.sh --init once, or set VPS_HOST for a one-off deployment.' >&2
  exit 2
fi

backup_stamp="$(date -u +%Y%m%d%H%M%S)"
# macOS can reject ControlPath values longer than the Unix socket limit.
# Keep this path short; %C still makes the socket unique per SSH destination.
ssh_control_dir="$(mktemp -d /tmp/iamjk-site-XXXXXX)"
ssh_control_path="$ssh_control_dir/control"
ssh_target="$vps_user@$vps_host"
ssh_options=(-o ControlMaster=auto -o ControlPersist=5m -o ControlPath="$ssh_control_path")
ssh_connected=0

cleanup() {
  rm -f -- "$release_archive"
  if (( ssh_connected )); then
    ssh "${ssh_options[@]}" -- "$ssh_target" \
      "rm -f -- '$remote_release_archive'" >/dev/null 2>&1 || true
    ssh "${ssh_options[@]}" -O exit -- "$ssh_target" >/dev/null 2>&1 || true
  fi
  rmdir "$ssh_control_dir" >/dev/null 2>&1 || true
}
trap cleanup EXIT

for command_name in jk-sbx-project rsync ssh; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    printf 'Required command not found: %s\n' "$command_name" >&2
    exit 127
  fi
done

(
  cd -- "$project_dir"
  jk-sbx-project exec ./scripts/sandbox-node.sh node -e 'const [major, minor] = process.versions.node.split(".").map(Number); if (major < 24 || (major === 24 && minor < 18)) { console.error(`Node ${process.version} is below the project minimum 24.18.0.`); process.exit(1); }'
  jk-sbx-project exec ./scripts/sandbox-node.sh --with-pnpm --pnpm-version "$pnpm_version" sh -c 'CI=true pnpm install --frozen-lockfile && CI=true pnpm run check && CI=true pnpm test'
)

printf 'Opening authenticated SSH connection to %s...\n' "$ssh_target"
ssh "${ssh_options[@]}" -MNf -- "$ssh_target"
ssh_connected=1
ssh "${ssh_options[@]}" -- "$ssh_target" \
  "mkdir -p '$vps_path' '$quadlet_dir'"
remote_arch="$(ssh "${ssh_options[@]}" -- "$ssh_target" uname -m)"
if [[ -z "$target_platform" ]]; then
  case "$remote_arch" in
    x86_64|amd64)
      target_platform='linux/amd64'
      ;;
    aarch64|arm64)
      target_platform='linux/arm64'
      ;;
    *)
      printf 'Unsupported VPS architecture: %s. Set DEPLOY_TARGET_PLATFORM explicitly.\n' "$remote_arch" >&2
      exit 1
      ;;
  esac
fi
printf 'Building the release image in Docker Sandbox (%s for VPS %s)...\n' "$target_platform" "$remote_arch"
(
  cd -- "$project_dir"
  jk-sbx-project exec docker buildx build \
    --pull \
    --platform "$target_platform" \
    --tag "$release_image" \
    --load \
    --file Containerfile \
    .
  jk-sbx-project exec docker save --output .iamjk-site-release.tar "$release_image"
)
printf 'Transferring the locally built release image with rsync...\n'
rsync --archive --human-readable --itemize-changes --info=progress2 --partial --timeout=60 \
  -e "ssh ${ssh_options[*]}" \
  "$release_archive" "$ssh_target:$remote_release_archive"
printf 'Installing/updating the application Quadlet with rsync...\n'
rsync --archive --human-readable --itemize-changes \
  -e "ssh ${ssh_options[*]}" \
  "$project_dir/deploy/iamjk-site.container.example" "$ssh_target:$quadlet_file"
ssh "${ssh_options[@]}" -- "$ssh_target" \
  "for secret in iamjk-site_TURNSTILE_SECRET iamjk-site_resend-api-key iamjk-site_resend-from iamjk-site_resend-to; do podman secret inspect \"\$secret\" >/dev/null || { echo \"Missing Podman secret: \$secret\" >&2; exit 1; }; done"
if [[ "$update_caddy" == "1" ]]; then
  printf 'Updating the iamjk.site Caddy upstream and API cache policy...\n'
  ssh "${ssh_options[@]}" -- "$ssh_target" "bash -s -- '$caddy_config_path' '$backup_stamp'" <<'REMOTE_CADDY_PATCH'
set -Eeuo pipefail

caddy_config_path="$1"
backup_stamp="$2"

if [[ ! -f "$caddy_config_path" ]]; then
  printf 'Caddyfile not found: %s\n' "$caddy_config_path" >&2
  exit 1
fi

site_policy_state() {
  awk '
    BEGIN { in_site = 0; depth = 0 }
    !in_site && $0 ~ /^[[:space:]]*iamjk[.]site[[:space:]]*\{/ {
      in_site = 1
      depth = 1
      next
    }
    in_site {
      if ($0 ~ /reverse_proxy (iamjk-site|127[.]0[.]0[.]1):4321/) proxy = 1
      if ($0 ~ /@iamjk_api path \/api\/\*/) api = 1
      if ($0 ~ /Cache-Control "private, no-store"/) cache = 1
      if ($0 ~ /CDN-Cache-Control "no-store"/) cdn_cache = 1
      if ($0 ~ /request_body @iamjk_api/) body = 1
      if ($0 ~ /max_size 16KB/) body_size = 1
      opens = gsub(/\{/, "{")
      closes = gsub(/\}/, "}")
      depth += opens - closes
      if (depth <= 0) in_site = 0
    }
    END {
      if (proxy && api && cache && cdn_cache && body && body_size) exit 0
      if (proxy && (api || cache || cdn_cache || body || body_size)) exit 2
      if (proxy) exit 1
      exit 3
    }
  ' "$caddy_config_path"
}

host_header_present() {
  awk '
    BEGIN { in_site = 0; depth = 0 }
    !in_site && $0 ~ /^[[:space:]]*iamjk[.]site[[:space:]]*\{/ {
      in_site = 1
      depth = 1
      next
    }
    in_site {
      if ($0 ~ /reverse_proxy iamjk-site:4321/) {
        in_proxy = 1
        lines = 0
      }
      if (in_proxy) {
        lines++
        if ($0 ~ /header_up Host \{host\}/) found = 1
        if (lines > 6) in_proxy = 0
      }
      opens = gsub(/\{/, "{")
      closes = gsub(/\}/, "}")
      depth += opens - closes
      if (depth <= 0) in_site = 0
    }
    END { exit found ? 0 : 1 }
  ' "$caddy_config_path"
}

policy_state=0
site_policy_state || policy_state=$?
if [[ "$policy_state" == "2" ]]; then
  printf 'The iamjk.site Caddy API policy is incomplete; repair it manually before deploying.\n' >&2
  exit 1
fi
if [[ "$policy_state" == "3" ]]; then
  printf 'Could not find the iamjk.site reverse_proxy block.\n' >&2
  exit 1
fi

needs_backup=0
if ! host_header_present || [[ "$policy_state" != "0" ]]; then
  needs_backup=1
fi
if (( needs_backup )); then
  cp -- "$caddy_config_path" "$caddy_config_path.before-iamjk-site.$backup_stamp"
fi

if ! host_header_present; then
  temp_path="$caddy_config_path.tmp.$backup_stamp"
  awk '
    BEGIN { in_site = 0; depth = 0; done = 0 }
    !in_site && $0 ~ /^[[:space:]]*iamjk[.]site[[:space:]]*\{/ {
      in_site = 1
      depth = 1
      print
      next
    }
    in_site && !done && $0 ~ /^[[:space:]]*reverse_proxy (127[.]0[.]0[.]1|iamjk-site):4321[[:space:]]*$/ {
      if ($0 ~ /127[.]0[.]0[.]1/) {
        print "    reverse_proxy iamjk-site:4321 {"
      } else {
        print "    reverse_proxy iamjk-site:4321 {"
      }
      print "        header_up Host {host}"
      print "    }"
      done = 1
      next
    }
    in_site && !done && $0 ~ /^[[:space:]]*reverse_proxy (127[.]0[.]0[.]1|iamjk-site):4321[[:space:]]*\{/ {
      sub(/127[.]0[.]0[.]1:4321/, "iamjk-site:4321")
      print
      print "        header_up Host {host}"
      done = 1
      depth++
      next
    }
    { print }
    {
      if (in_site) {
        opens = gsub(/\{/, "{")
        closes = gsub(/\}/, "}")
        depth += opens - closes
        if (depth <= 0) in_site = 0
      }
    }
    END { if (!done) exit 1 }
  ' "$caddy_config_path" > "$temp_path"
  mv -- "$temp_path" "$caddy_config_path"
fi

if ! host_header_present; then
  printf 'iamjk.site reverse_proxy must preserve Host; deployment stopped safely.\n' >&2
  exit 1
fi

if [[ "$policy_state" != "0" ]]; then
  temp_path="$caddy_config_path.tmp.$backup_stamp"
  awk '
    BEGIN { in_site = 0; depth = 0; done = 0 }
    !in_site && $0 ~ /^[[:space:]]*iamjk[.]site[[:space:]]*\{/ {
      in_site = 1
      depth = 1
      print
      next
    }
    in_site && !done && $0 ~ /^[[:space:]]*reverse_proxy iamjk-site:4321[[:space:]]*\{/ {
      print "    @iamjk_api path /api/*"
      print "    header @iamjk_api {"
      print "        Cache-Control \"private, no-store\""
      print "        CDN-Cache-Control \"no-store\""
      print "        Pragma \"no-cache\""
      print "    }"
      print "    request_body @iamjk_api {"
      print "        max_size 16KB"
      print "    }"
      done = 1
    }
    { print }
    {
      if (in_site) {
        opens = gsub(/\{/, "{")
        closes = gsub(/\}/, "}")
        depth += opens - closes
        if (depth <= 0) in_site = 0
      }
    }
    END { if (!done) exit 1 }
  ' "$caddy_config_path" > "$temp_path"
  mv -- "$temp_path" "$caddy_config_path"
fi

if ! host_header_present || ! site_policy_state; then
  printf 'The iamjk.site Caddy changes failed validation; inspect the backup before retrying.\n' >&2
  exit 1
fi
REMOTE_CADDY_PATCH
fi
ssh "${ssh_options[@]}" -- "$ssh_target" \
  "podman load --input '$remote_release_archive' >/dev/null && systemctl --user daemon-reload && systemctl --user restart iamjk-site.service"
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
  "podman exec '$app_container_name' node -e 'Promise.all([fetch(\"http://127.0.0.1:4321/\"), fetch(\"http://127.0.0.1:4321/api/contact\")]).then(async ([home, api]) => { const html = await home.text(); if (!home.ok || !html.includes(\"contact-form\") || !html.includes(\"keep the conversation going\") || api.status !== 405) process.exit(1); }).catch(() => process.exit(1))'"

printf 'Formatting and validating the rootless Caddyfile...\n'
if ! ssh "${ssh_options[@]}" -- "$ssh_target" "bash -s -- '$caddy_config_path' '$backup_stamp'" <<'REMOTE_CADDY_FORMAT'
set -Eeuo pipefail

caddy_config_path="$1"
backup_stamp="$2"
caddy_config_dir="${caddy_config_path%/*}"
caddy_image="$(podman inspect --format '{{.ImageName}}' caddy 2>/dev/null || true)"
if [[ -z "$caddy_image" ]]; then
  caddy_image="docker.io/library/caddy:alpine"
fi

caddy_format_backup="$caddy_config_path.before-iamjk-site-format.$backup_stamp"
caddy_format_snapshot="$caddy_format_backup.pending"
caddy_format_volume="$caddy_config_dir:/etc/caddy:rw"
format_changed=0
caddy_restarted=0

caddy_temp_run() {
  podman run --rm --network none --security-opt label=disable \
    --user 0 --userns=host --entrypoint caddy \
    --volume "$caddy_format_volume" \
    "$caddy_image" "$@"
}

restore_format_backup() {
  if (( format_changed )); then
    cp -- "$caddy_format_backup" "$caddy_config_path"
    if (( caddy_restarted )); then
      systemctl --user restart caddy.service
    fi
  fi
}

# The permanent Caddy Quadlet already applies :Z to this directory. Do not
# relabel it from a second container: :Z creates a private SELinux label and
# can make the live Caddy mount unreadable. Rootless Podman maps container root
# to the invoking VPS user, which owns the host-mounted Caddyfile.
cp -- "$caddy_config_path" "$caddy_format_snapshot"
if ! caddy_temp_run fmt --overwrite /etc/caddy/Caddyfile; then
  cp -- "$caddy_format_snapshot" "$caddy_config_path"
  rm -f -- "$caddy_format_snapshot"
  exit 1
fi
if cmp -s -- "$caddy_format_snapshot" "$caddy_config_path"; then
  rm -f -- "$caddy_format_snapshot"
else
  if ! mv -- "$caddy_format_snapshot" "$caddy_format_backup"; then
    cp -- "$caddy_format_snapshot" "$caddy_config_path"
    rm -f -- "$caddy_format_snapshot"
    exit 1
  fi
  format_changed=1
fi

if ! caddy_temp_run validate --config /etc/caddy/Caddyfile --adapter caddyfile; then
  restore_format_backup
  exit 1
fi

if ! podman exec caddy test -r /etc/caddy/Caddyfile; then
  printf 'Caddy cannot read its mounted Caddyfile; reapplying the Quadlet mount label.\n' >&2
  if ! systemctl --user restart caddy.service; then
    restore_format_backup
    exit 1
  fi
  caddy_restarted=1
fi

if ! podman exec caddy caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile; then
  restore_format_backup
  exit 1
fi

systemctl --user daemon-reload
if systemctl --user is-active --quiet caddy.service; then
  podman exec caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
else
  systemctl --user restart caddy.service
fi
REMOTE_CADDY_FORMAT
then
  printf 'Caddy format/validate/reload failed. Capturing rootless service diagnostics...\n' >&2
  ssh "${ssh_options[@]}" -- "$ssh_target" \
    "systemctl --user status caddy.service --no-pager || true; journalctl --user -u caddy.service -n 120 --no-pager || true; podman ps --all --format 'table {{.Names}}\\t{{.Status}}'" >&2
  exit 1
fi
public_api_status="$(ssh "${ssh_options[@]}" -- "$ssh_target" \
  "curl --silent --show-error --output /dev/null --write-out '%{http_code}' https://iamjk.site/api/contact" || true)"
if [[ "$public_api_status" != "405" ]]; then
  printf 'Public contact endpoint check failed: expected HTTP 405, got %s. Check the Caddy upstream before purging the CDN.\n' "${public_api_status:-no response}" >&2
  exit 1
fi
public_post_status="$(ssh "${ssh_options[@]}" -- "$ssh_target" \
  "curl --silent --show-error --output /dev/null --write-out '%{http_code}' --request POST --header 'Origin: https://iamjk.site' --header 'Accept: application/json' --header 'Content-Type: application/json' --data '{\"name\":\"deployment-check\",\"country\":\"PH\",\"message\":\"deployment-check\"}' https://iamjk.site/api/contact" || true)"
if [[ "$public_post_status" != "400" ]]; then
  printf 'Public contact POST check failed: expected HTTP 400 validation response, got %s. Check the Caddy Host header before purging the CDN.\n' "${public_post_status:-no response}" >&2
  exit 1
fi

ssh "${ssh_options[@]}" -- "$ssh_target" bunny-purge

printf 'Deployment complete: %s@%s:%s\n' "$vps_user" "$vps_host" "$vps_path"
