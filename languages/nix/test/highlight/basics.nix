{ lib, stdenv, fetchurl ? null, ... }@args:
# <- punctuation.bracket
# ^ variable.parameter
#                       ^ operator
#                                 ^ punctuation.special
#                                    ^ operator
#                                     ^ variable.parameter

let
# <- keyword
  inherit (lib) mkIf;
# ^ keyword
#                ^ property
  name = "hello-${version}\n";
# ^ property
#        ^ string
#                ^ punctuation.special
#                   ^ variable
#                        ^ punctuation.special
#                          ^ string.escape
  add = x: y: x + y;
# ^ function
#       ^ variable.parameter
in
# <- keyword
stdenv.mkDerivation {
# ^ variable
#       ^ function.call
  src = ./src/${name}.tar;
#       ^ string.special.path
#             ^ punctuation.special
#                    ^ string.special.path
  nixpkgs = <nixpkgs>;
#           ^ string.special.path
  url = https://example.org;
#       ^ string.special.url
  n = if true then 1 else 2.5;
#     ^ keyword.conditional
#        ^ boolean
#                  ^ number
#                         ^ number.float
  v = lib.version or null;
#                 ^ keyword.operator
#                    ^ constant.builtin
  p = import ./foo.nix;
#     ^ function.builtin
  q = builtins.toJSON { };
#     ^ module.builtin
#              ^ function.builtin
  postInstall = ''
    echo ''${x} $out
#        ^ string.escape
#               ^ string
  '';
  ok = assert args ? lib; true;
#      ^ keyword.debug
#                  ^ operator
}
