{
  lib,
  stdenv,
  fetchurl,
  testers,
  withNls ? true,
}:

stdenv.mkDerivation (finalAttrs: {
  pname = "hello";
  version = "2.12.1";

  src = fetchurl {
    url = "mirror://gnu/hello/hello-${finalAttrs.version}.tar.gz";
    hash = "sha256-jZkUKv2SV28wsM18tCqNxoCZmLxdYH2Idh9RLibH2yA=";
  };

  configureFlags = lib.optional (!withNls) "--disable-nls";

  doCheck = true;

  postInstall = ''
    mkdir -p $out/share/doc/hello
    cp README $out/share/doc/hello/
  '';

  passthru.tests.version = testers.testVersion { package = finalAttrs.finalPackage; };

  meta = {
    description = "Program that produces a familiar, friendly greeting";
    homepage = "https://www.gnu.org/software/hello/";
    license = lib.licenses.gpl3Plus;
    mainProgram = "hello";
    platforms = lib.platforms.all;
  };
})
