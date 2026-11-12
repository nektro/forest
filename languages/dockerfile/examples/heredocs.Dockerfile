# syntax=docker/dockerfile:1
FROM debian:bookworm-slim

RUN <<EOF
set -eux
apt-get update
apt-get install -y --no-install-recommends nginx
rm -rf /var/lib/apt/lists/*
EOF

COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    root /usr/share/nginx/html;
}
EOF

RUN python3 <<'PY' > /usr/share/nginx/html/index.html
print("<h1>Hello from a heredoc</h1>")
PY

STOPSIGNAL SIGQUIT
CMD ["nginx", "-g", "daemon off;"]
