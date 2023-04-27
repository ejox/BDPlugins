/**
 * @name DisableCallTimeout
 * @author ejox & Ahlawat
 * @version 0.0.1
 * @source https://github.com/ejox/BDPlugins
 * @description Lets you stay alone in a call for longer than 5 minutes.
 */
module.exports = (() => {
  const config = {
    info: {
      name: "DisableCallTimeout",
      authors: [
        {
          name: "ejox & Ahlawat",
          discord_id: "347046121304096768",
          github_username: "ejox",
        },
      ],
      version: "0.0.1",
      description:
        "Lets you stay alone in a call for longer than 5 minutes.",
      github: "",
      github_raw: "",
    },
    changelog: [
      {
        title: "README PLS!",
        items: ["This plugin is forked and a cleaned up section of the 'DiscordBypasses' plugin by Tharki-God as the source plugin does not work. I figured this feature is very useful and deserves to be its very own plugin. I am garbage at coding so don't judge my cleanup. >:c"],
	  }
    ],
    main: "DisableCallTimeout.plugin.js",
  };
  const RequiredLibs = [{
    window: "ZeresPluginLibrary",
    filename: "0PluginLibrary.plugin.js",
    external: "https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js",
    downloadUrl: "https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js"
  },
  ];
  class handleMissingLibrarys {
    load() {
      for (const Lib of RequiredLibs.filter(lib => !window.hasOwnProperty(lib.window)))
        BdApi.showConfirmationModal(
          "Library Missing",
          `The library plugin (${Lib.window}) needed for ${config.info.name} is missing. Please click Download Now to install it.`,
          {
            confirmText: "Download Now",
            cancelText: "Cancel",
            onConfirm: () => this.downloadLib(Lib),
          }
        );
    }
    async downloadLib(Lib) {
      const fs = require("fs");
      const path = require("path");
      const { Plugins } = BdApi;
      const LibFetch = await fetch(
        Lib.downloadUrl
      );
      if (!LibFetch.ok) return this.errorDownloadLib(Lib);
      const LibContent = await LibFetch.text();
      try {
        await fs.writeFile(
          path.join(Plugins.folder, Lib.filename),
          LibContent,
          (err) => {
            if (err) return this.errorDownloadLib(Lib);
          }
        );
      } catch (err) {
        return this.errorDownloadLib(Lib);
      }
    }
    errorDownloadZLib(Lib) {
      const { shell } = require("electron");
      BdApi.showConfirmationModal(
        "Error Downloading",
        [
          `${Lib.window} download failed. Manually install plugin library from the link below.`,
        ],
        {
          confirmText: "Download",
          cancelText: "Cancel",
          onConfirm: () => {
            shell.openExternal(
              Lib.external
            );
          },
        }
      );
    }
    start() { }
    stop() { }
  }
    return RequiredLibs.some(m => !window.hasOwnProperty(m.window))
    ? handleMissingLibrarys
    : (([Plugin, ZLibrary]) => {
      const {
        Utilities,
        Logger,
        PluginUpdater,
        Patcher,
        Settings: { SettingPanel, Switch, },
        DiscordModules: {},
      } = ZLibrary;
      const {
        LibraryUtils,
        LibraryModules: {
          Timeout      
        },
      } = BunnyLib.build(config);      
      const defaultSettings = {
        bandwidth: true,
      };
      return class DiscordBypasses extends Plugin {
        constructor() {
          super();
          this.settings = Utilities.loadData(
            config.info.name,
            "settings",
            defaultSettings
          );
        }
        onStart() {
          this.initialize();
        }
        initialize() {
          if (this.settings["bandwidth"]) this.patchTimeouts();    
        }
        patchTimeouts() {
          Patcher.after(Timeout.prototype, "start", (timeout, [_, args]) => {
            if (args?.toString().includes("BOT_CALL_IDLE_DISCONNECT")) {
              timeout.stop();
            }
          });
        }
        onStop() {
          Patcher.unpatchAll();
        }
        getSettingsPanel() {
          return SettingPanel.build(
            this.saveSettings.bind(this),
			new Switch(
              "Call timeout",
              "Lets you stay alone in a call for longer than 5 minutes.",
              this.settings["bandwidth"],
              (e) => {
                this.settings["bandwidth"] = e;
              },
            )
          );
        }
        saveSettings() {
          Utilities.saveData(config.info.name, "settings", this.settings);
          this.stop();
          this.initialize();
        }
      };
    })(ZLibrary.buildPlugin(config));
})();
/*@end@*/
