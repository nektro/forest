# syntax=docker/dockerfile:1
# <- comment
ARG GO_VERSION=1.22
# <- keyword
#   ^ variable
#             ^ operator
FROM --platform=$BUILDPLATFORM golang:1.22-alpine@sha256:0123abcd AS build
# <- keyword
#    ^ property
#      ^ property
#               ^ punctuation.special
#                ^ variable
#                              ^ type
#                                     ^ constant
#                                                 ^ string.special
#                                                                 ^ keyword
#                                                                    ^ label
# A comment.
# <- comment
RUN ["go", "build", "-o", "/out/app\n"]
#   ^ punctuation.bracket
#    ^ string
#        ^ punctuation.delimiter
#                                  ^ string.escape
ENV MODE="release" PATH=${PATH:-/bin}
#   ^ variable
#        ^ string
#                       ^ punctuation.special
#                         ^ variable
#                             ^ operator
LABEL org.opencontainers.image.title='app'
#     ^ property
#                                    ^ string
EXPOSE 8080/tcp
#      ^ number
STOPSIGNAL SIGTERM
#          ^ constant
HEALTHCHECK NONE
#           ^ constant.builtin
COPY <<EOF /etc/motd
#    ^ label
hello
EOF
# <- label
