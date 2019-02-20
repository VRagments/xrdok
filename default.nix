let
  stable = import (fetchTarball { # 18.09
    url = https://github.com/NixOS/nixpkgs-channels/archive/12b1462924a.tar.gz;
    sha256 = "138nrcc0p2jmvx69fadh2a69lhnp3pg4cimmbiw6aqi9pgk0ig1j";
  }) {};

  unstable = import (fetchTarball { # nixos-unstable
    url = https://github.com/NixOS/nixpkgs-channels/archive/2d6f84c1090.tar.gz;
    sha256 = "0l8b51lwxlqc3h6gy59mbz8bsvgc0q6b3gf7p3ib1icvpmwqm773";
  }) {};
in {
  pogstateEnv = stable.stdenv.mkDerivation {
    name = "xrdok";
    buildInputs = [
      unstable.firefox-devedition-bin
      stable.inotifyTools
      stable.nodejs-8_x
      stable.stdenv
      stable.yarn
    ];
  };
}
