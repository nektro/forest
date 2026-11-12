; Build stages and the variables a Dockerfile defines.

(from_instruction
  as: (image_alias) @name) @definition.module

(arg_pair
  name: (variable) @name) @definition.constant

(env_pair
  name: (variable) @name) @definition.constant

; FROM <stage> and COPY --from=<stage> may name an earlier stage.
(from_instruction
  (image_spec
    name: (image_name) @name)) @reference.module

(param
  name: (param_name) @_name
  value: (value) @name
  (#eq? @_name "from")) @reference.module
