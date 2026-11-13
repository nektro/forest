# Small helpers for an interactive shell.

# Make a directory and change into it.
mkcd() {
  mkdir -p -- "$1" && cd -- "$1" || return
}

# Extract an archive, whatever its kind.
extract() {
  local file=$1
  [[ -f $file ]] || { printf '%s: no such file\n' "$file" >&2; return 1; }
  case ${file,,} in
    *.tar.gz|*.tgz) tar -xzf "$file" ;;
    *.tar.xz)       tar -xJf "$file" ;;
    *.zip)          unzip -q "$file" ;;
    *.gz)           gunzip -k "$file" ;;
    *)              echo "don't know how to extract $file" >&2; return 1 ;;
  esac
}

# Print each directory in $PATH on its own line, numbered.
path() {
  local IFS=: i=0 dir
  for dir in $PATH; do
    printf '%3d  %s\n' $((++i)) "$dir"
  done
}

# Retry a command up to N times, waiting longer after each failure.
retry() {
  local tries=$1 delay=1; shift
  until "$@"; do
    (( --tries > 0 )) || return 1
    sleep "$delay"
    delay=$(( delay * 2 ))
  done
}

alias ll='ls -lh' la='ls -A'
export HISTCONTROL=ignoreboth HISTSIZE=10000
