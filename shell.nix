with import <nixpkgs> {};

pkgs.mkShell {
  nativeBuildInputs = with pkgs; [
  ];

  env.LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [
    stdenv.cc.cc.lib
    ncurses
  ];

  hardeningDisable = [ "all" ];
}

# Install tree-sitter with:
#   nix-shell -p gcc stdenv.cc.cc.lib --run 'cargo install --locked tree-sitter-cli'
