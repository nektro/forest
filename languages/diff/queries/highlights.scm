; Highlights for diffs and patches.
;
; Changed lines use the @diff.plus, @diff.minus and @diff.delta captures (as
; in nvim-treesitter); a theme colors the whole line. When several patterns
; match a node, the last one wins.

; Lines
; -----

(addition) @diff.plus

(deletion) @diff.minus

(change) @diff.delta

(no_newline) @comment

; Files
; -----

(command
  "diff" @keyword)

(command
  (option) @variable.parameter)

(command
  (argument) @string.special.path)

(svn_index
  "Index:" @keyword)

(old_file
  [
    "---"
    "***"
  ] @diff.minus)

(new_file
  [
    "+++"
    "---"
  ] @diff.plus)

(old_file
  (path) @string.special.path)

(new_file
  (path) @string.special.path)

(timestamp) @comment

; Extended headers
; ----------------

[
  "index"
  "old mode"
  "new mode"
  "new file mode"
  "deleted file mode"
  "mode"
  "similarity index"
  "dissimilarity index"
  "rename from"
  "rename to"
  "rename old"
  "rename new"
  "copy from"
  "copy to"
  "GIT binary patch"
  "literal"
  "delta"
] @keyword

(index
  (hash) @constant)

(mode) @number

(percentage) @number

(rename
  (path) @string.special.path)

(copy
  (path) @string.special.path)

(binary_files) @keyword

(binary_hunk
  (size) @number)

(binary_data) @string

; Hunk headers
; ------------

(hunk_header
  "@@" @punctuation.special)

(combined_hunk_header
  "@@@" @punctuation.special)

[
  "***************"
  "****"
  "----"
] @punctuation.special

(old_lines
  "***" @punctuation.special)

(new_lines
  "---" @punctuation.special)

(range) @number

(heading) @function

(change_command) @label

(normal_hunk
  "---" @punctuation.special)

; Around the diffs
; ----------------

(separator) @punctuation.special

(signature
  "-- " @punctuation.special)

(signature
  (text) @comment)

(diffstat_file
  (path) @string.special.path)

(diffstat_file
  (number) @number)

(diffstat_file
  (added) @diff.plus)

(diffstat_file
  (removed) @diff.minus)

(diffstat_file
  (binary) @comment)

(diffstat_summary) @comment
