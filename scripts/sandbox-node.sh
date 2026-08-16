#!/usr/bin/env bash
set -Eeuo pipefail

project_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
node_image="${SANDBOX_NODE_IMAGE:-docker.io/library/node:24.18.0-alpine}"
with_pnpm=0
pnpm_version_override=""

usage() {
  printf '%s\n' \
    'Usage: ./scripts/sandbox-node.sh [--with-pnpm] [--pnpm-version VERSION] COMMAND [ARG...]' \
    '' \
    'Runs COMMAND in the project-pinned Node 24.18.0 container inside Docker Sandbox.' \
    'Use --with-pnpm when COMMAND needs the pinned pnpm CLI.'
}

while (($# > 0)); do
  case "$1" in
    --with-pnpm)
      with_pnpm=1
      shift
      ;;
    --pnpm-version)
      if (($# < 2)); then
        printf '%s\n' '--pnpm-version requires a value.' >&2
        exit 2
      fi
      pnpm_version_override="$2"
      shift 2
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      break
      ;;
  esac
done

if (($# == 0)); then
  usage >&2
  exit 2
fi

if ! command -v docker >/dev/null 2>&1; then
  printf '%s\n' 'Docker is required inside the Docker Sandbox.' >&2
  exit 127
fi

uid="$(id -u)"
gid="$(id -g)"
docker_args=(
  run
  --rm
  --user "$uid:$gid"
  --volume "$project_dir:/workspace"
  --workdir /workspace
  --tmpfs "/workspace/node_modules:rw,exec,nodev,nosuid,uid=$uid,gid=$gid"
)

if (( with_pnpm )); then
  pnpm_version="${pnpm_version_override:-${SANDBOX_PNPM_VERSION:-11.15.1}}"
  if [[ ! "$pnpm_version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    printf 'Invalid pnpm version: %s\n' "$pnpm_version" >&2
    exit 2
  fi
  docker_args+=(--env "SANDBOX_PNPM_VERSION=$pnpm_version")
  exec docker "${docker_args[@]}" "$node_image" sh -c '
    set -eu
    export HOME=/tmp/iamjk-home
    mkdir -p "$HOME" /tmp/iamjk-pnpm
    npm install --no-audit --no-fund --loglevel=error \
      --prefix /tmp/iamjk-pnpm "pnpm@$SANDBOX_PNPM_VERSION" >/dev/null
    export PATH="/tmp/iamjk-pnpm/node_modules/.bin:$PATH"
    exec "$@"
  ' -- "$@"
fi

exec docker "${docker_args[@]}" "$node_image" "$@"
