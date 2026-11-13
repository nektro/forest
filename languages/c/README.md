# tree-sitter-c

A [tree-sitter](https://tree-sitter.github.io) grammar for C, with no
external scanner.

- **C23**, from Annex A of ISO/IEC 9899:2024: `[[attributes]]`, `typeof`,
  `constexpr`, `auto` inference, `_BitInt`, `nullptr`, enums with a fixed
  underlying type, `#elifdef`, digit separators.
- **The extensions headers use**: GNU attributes, extended `asm`, statement
  expressions, `?:`, case ranges, labels as values, `__extension__`,
  `__typeof__`; MSVC `__declspec`, calling conventions and pointer modifiers;
  K&R definitions; `extern "C"` blocks.
- **Code full of macros parses.** See below.

## Validation

`script/check-c-repo.sh <dir>...` parses every `.c` and `.h` file under the
given directories and lists those with errors. Results from 2026-11-11:

| Input | Files without errors |
| --- | --- |
| SQLite `src/` | 124 of 149 |
| musl (`zig/lib/libc/musl`) | 1,809 of 1,827 |
| glibc headers (`zig/lib/libc/glibc`) | 156 of 160 |
| mingw-w64 (`zig/lib/libc/mingw`) | 476 of 488 |
| Clang's headers (`zig/lib/include`) | 236 of 246 |
| Linux `kernel/ mm/ lib/ fs/ext4/ net/ipv4/ include/linux/` | 4,507 of 4,669 |

Most of the rest are things no grammar of C can parse without running the
preprocessor: macros whose arguments are statements or operators
(`VVA_ONLY(x = 1;)`, `OP(add, +=)`), `#if` branches that are only valid one
at a time, and data fragments meant to be `#include`d into an array. The
musl failures are 12 such fragments, 5 macro tricks and one pair of `#if` branches; the Clang ones
include C++, AltiVec `vector` and assembler.

Parsing runs at about 6.5 MB/s on SQLite's `vdbe.c`.

## The preprocessor

Each directive is one line and is an **extra**: it may appear anywhere, and
the code around it is parsed as if it were not there. `#if X`, `#else` and
`#endif` are separate nodes (`preproc_if`, `preproc_else`, `preproc_endif`)
rather than a node that contains its branches.

So all branches of an `#if` are parsed one after another. That works whenever
the branches together read as valid C, which covers whole declarations or
statements in each branch, members of an initializer, and
`#ifdef __cplusplus` / `extern "C" {` / `#endif`. It fails when each branch
is an alternative for the same piece of code, such as two versions of a
function header.

Macro bodies and the text of `#pragma`, `#error` and other directives are
`preproc_arg` nodes, unparsed. `#if` conditions are parsed. Keywords are
accepted as macro names (`#define bool _Bool`).

## Typedef names and macros

C cannot be parsed without knowing which identifiers are types, and code that
uses macros cannot be parsed without expanding them. This grammar does
neither. It keeps every reading and picks one with dynamic precedence:

- `T * x;` and `T x;` are declarations, `f(x);` is a call, `(T)-1` is a cast.
- An identifier where a specifier or qualifier would go is a `macro_modifier`:
  `SQLITE_API int f(void);`, `static void __init f(void)`,
  `char *CONST p;`, `(void __user *)p`.
- So is an identifier or `NAME(args)` after a declarator:
  `int f(int) __THROW __nonnull((1));`, `int x __read_mostly;`.
- `NAME(type)` can be a type: `ElfW(Addr) a;` (`macro_type_specifier`).
- A call or identifier can be a statement without a semicolon
  (`SWAP(a, b)`), a member (`DECLARE_BITMAP(bits, N);`), or a declaration
  with only a storage class (`static DEFINE_MUTEX(lock);`).
- Macro arguments may be types: `va_arg(ap, int)`,
  `offsetof(struct s, f)`.

A reading with a macro is only chosen when nothing else parses, so these never
change how macro-free code parses. Where both readings are plausible the tree
can still be wrong: `(a) + b` is a cast, and in `A B c;` either `A` or `c`
may be the macro.

## Other choices

- C23 keywords that older code defines itself (`bool`, `true`, `false`,
  `alignof`, ...) are accepted as typedef and enumerator names, so
  `typedef enum { false, true } bool;` parses.
- `TRUE`/`FALSE` are `true`/`false` nodes and `NULL` is a `null` node.
- A `case_statement` contains the statements after its label.
- Numbers are preprocessing numbers: any digits, letters, `.`, `'` and
  exponent signs, so every suffix is accepted.

## Queries

`queries/` has `highlights.scm`, `locals.scm`, `tags.scm`, `folds.scm` and
`injections.scm`. In `highlights.scm` the last matching pattern wins.

## Development

```bash
tree-sitter generate --js-runtime bun
```

```bash
tree-sitter test
```

```bash
script/check-c-repo.sh ~/src/sqlite/src
```

`tree-sitter test --update` writes corpus trees without field names; run
`script/update-corpus-fields.py` instead, then review the diff.
