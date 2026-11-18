# A small C project.

CC      ?= cc
CFLAGS  += -O2 -Wall -Wextra
PREFIX  ?= /usr/local
VERSION := $(shell git describe --tags 2>/dev/null || echo dev)

SRCS := $(wildcard src/*.c)
OBJS := $(SRCS:src/%.c=build/%.o)
DEPS := $(OBJS:.o=.d)

ifeq ($(DEBUG),1)
CFLAGS += -g -DDEBUG
else ifdef SANITIZE
CFLAGS += -fsanitize=$(SANITIZE)
endif

.PHONY: all clean install

all: build/app

build/app: $(OBJS) | build
	$(CC) $(LDFLAGS) -o $@ $^ $(LDLIBS)

build/%.o: src/%.c | build
	@echo "  CC  $<"
	$(CC) $(CFLAGS) -DVERSION='"$(VERSION)"' -MMD -c -o $@ $<

build:
	mkdir -p $@

install: build/app
ifneq ($(DESTDIR),)
	@echo "staging into $(DESTDIR)"
endif
	install -Dm755 $< $(DESTDIR)$(PREFIX)/bin/app

clean:
	-rm -rf build

# One test target per test script.
define test-rule
test-$(1): build/app
	./tests/$(1).sh $$<
endef

TESTS := $(notdir $(basename $(wildcard tests/*.sh)))
$(foreach t,$(TESTS),$(eval $(call test-rule,$(t))))

-include $(DEPS)
