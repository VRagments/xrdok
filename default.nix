let
  pkgs = import (fetchTarball { # 18.09
    url = https://github.com/NixOS/nixpkgs-channels/archive/7795a7ad5f0.tar.gz;
    sha256 = "1kh35ys6f60x35bsav64alqwnzps3xc21m1ayrcms005ylryi34c";
  }) {};
in with pkgs; {
  pogstateEnv = stdenv.mkDerivation {
    name = "xrdok";
    buildInputs = [
      arcanist
      firefox-devedition-bin
      inotifyTools
      nodejs-8_x
      stdenv
      yarn
    ];
  };
}
