let
  unstable = import (fetchTarball { # nixos-unstable
    url = https://github.com/NixOS/nixpkgs-channels/archive/c26dbef830a.tar.gz;
    sha256 = "1bh3c7in7lfainbak1dmn9kwaba07z6wc65g99ylyahcy5g4pb0w";
  }) {};

  pkgs = import (fetchTarball { # 18.09
    url = https://github.com/NixOS/nixpkgs-channels/archive/7795a7ad5f0.tar.gz;
    sha256 = "1kh35ys6f60x35bsav64alqwnzps3xc21m1ayrcms005ylryi34c";
  }) {};
in with pkgs; {
  pogstateEnv = stdenv.mkDerivation {
    name = "xrdok";
    buildInputs = [
      unstable.firefox-devedition-bin
      inotifyTools
      nodejs-8_x
      stdenv
      yarn
    ];
  };
}
