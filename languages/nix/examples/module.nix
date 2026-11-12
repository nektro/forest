# A NixOS module for a small web service.
{ config, lib, pkgs, ... }:

let
  cfg = config.services.greeter;
  inherit (lib) mkEnableOption mkIf mkOption types;

  configFile = pkgs.writeText "greeter.json" (builtins.toJSON {
    inherit (cfg) port;
    greeting = "Hello, ${cfg.name}!";
  });
in
{
  options.services.greeter = {
    enable = mkEnableOption "the greeter service";

    port = mkOption {
      type = types.port;
      default = 8080;
      description = "Port to listen on.";
    };

    name = mkOption {
      type = types.str;
      default = "world";
    };
  };

  config = mkIf cfg.enable {
    systemd.services.greeter = {
      wantedBy = [ "multi-user.target" ];
      serviceConfig.ExecStart = "${pkgs.greeter}/bin/greeter --config ${configFile}";
      environment.GREETER_DEBUG = if cfg.port < 1024 then "1" else "0";
    };

    networking.firewall.allowedTCPPorts = lib.optionals (cfg ? port) [ cfg.port ];
  };
}
