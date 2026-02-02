import { App, Notice, Plugin, PluginSettingTab, Setting } from "obsidian";
import { readCounter, writeCounter } from "./storage";
import { trackEvent } from "./analytics";

interface VaultOpsTemplateGuardSettings {
  enableAnalytics: boolean;
}

const DEFAULT_SETTINGS: VaultOpsTemplateGuardSettings = {
  enableAnalytics: false
};

export default class VaultOpsTemplateGuardPlugin extends Plugin {
  settings: VaultOpsTemplateGuardSettings = DEFAULT_SETTINGS;

  async onload(): Promise<void> {
    await this.loadSettings();
    this.addCommand({
      id: "vault-ops-template-guard-run-sample-command",
      name: "Vault Ops - Template Guard: Run sample command",
      callback: () => {
        new Notice("Vault Ops - Template Guard is active.");
      }
    });

    const currentCount = await readCounter(this);
    await writeCounter(this, currentCount + 1);
    trackEvent("plugin_loaded", { slug: "vault-ops-template-guard" });
    this.addSettingTab(new VaultOpsTemplateGuardSettingTab(this.app, this));
  }

  onunload(): void {
    // no-op
  }

  async loadSettings(): Promise<void> {
    this.settings = { ...DEFAULT_SETTINGS, ...(await this.loadData()) };
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

}

class VaultOpsTemplateGuardSettingTab extends PluginSettingTab {
  plugin: VaultOpsTemplateGuardPlugin;

  constructor(app: App, plugin: VaultOpsTemplateGuardPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Enable analytics events")
      .setDesc("Store simple usage counters locally.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableAnalytics)
          .onChange(async (value) => {
            this.plugin.settings.enableAnalytics = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
