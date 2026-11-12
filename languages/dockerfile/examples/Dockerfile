# syntax=docker/dockerfile:1

ARG GO_VERSION=1.22

FROM --platform=$BUILDPLATFORM golang:${GO_VERSION}-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod \
    go mod download
COPY . .
ARG TARGETOS TARGETARCH
RUN --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOOS=$TARGETOS GOARCH=$TARGETARCH \
    go build -trimpath -o /out/server ./cmd/server

FROM alpine:3.20 AS runtime
RUN apk add --no-cache ca-certificates tzdata \
    # a non-root user for the server
    && adduser -D -u 10001 app
COPY --from=build --chown=app:app /out/server /usr/local/bin/server
ENV PORT=8080 LOG_LEVEL="info"
LABEL org.opencontainers.image.title="server" \
      org.opencontainers.image.source="https://example.com/server"
EXPOSE ${PORT}/tcp
USER app
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget -qO- "http://localhost:${PORT}/healthz" || exit 1
ENTRYPOINT ["/usr/local/bin/server"]
CMD ["--listen", ":8080"]
