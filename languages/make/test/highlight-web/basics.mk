# Variables
# <- comment
CC ?= gcc
# <- variable
#  ^ operator
override CFLAGS += -O2 $(EXTRA)
# <- keyword
#        ^ variable
#               ^ operator
#                      ^ punctuation.special
#                        ^ variable
SRCS := $(wildcard src/*.c)
#         ^ function.builtin
OBJS = $(SRCS:.c=.o)
#        ^ variable
#            ^ operator
#               ^ operator
DATE != date +%F
#    ^ operator
export PATH
# <- keyword
#      ^ variable
HERE := $(CURDIR) $$HOME
#         ^ variable.builtin
#                 ^ string.escape
GREET = $(call greet,world)
#         ^ function.builtin
#              ^ function.call

# Rules
.PHONY: all clean
# <- function.builtin
#     ^ punctuation.delimiter
#       ^ string.special.path
all: $(OBJS) | build
# <- function
#            ^ punctuation.delimiter
#              ^ string.special.path
	@$(CC) -o $@ $^
#^ punctuation.special
#   ^ variable
#          ^ variable.builtin
#             ^ variable.builtin
	-rm -f $(@D)/x
#^ punctuation.special
#         ^ variable.builtin
%.o: %.c
# <- function
#    ^ string.special.path
	$(CC) -c $< -o $@
$(OBJS): %.o: %.c
#        ^ string.special.path

# Conditionals and directives
ifeq ($(OS),Windows_NT)
# <- keyword.conditional
#    ^ punctuation.bracket
EXE := .exe
else ifneq "$(X)" "y"
# <- keyword.conditional
#    ^ keyword.conditional
#          ^ string
endif
# <- keyword.conditional
ifdef DEBUG
#     ^ variable
endif
-include $(OBJS:.o=.d)
# <- keyword.import
include config.mk
#       ^ string.special.path
vpath %.c src
# <- keyword
#     ^ string.special.path
define greet
# <- keyword
#      ^ variable
echo hello $(1)
#            ^ variable
endef
# <- keyword
