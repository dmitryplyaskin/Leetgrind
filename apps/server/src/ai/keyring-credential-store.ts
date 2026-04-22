import { AsyncEntry } from "@napi-rs/keyring";
import type { ProviderCredentialStore } from "@leetgrind/ai";

const DEFAULT_KEYRING_SERVICE = "leetgrind.ai.providers";

export class KeyringCredentialStore implements ProviderCredentialStore {
  constructor(private readonly service = DEFAULT_KEYRING_SERVICE) {}

  async deleteSecret(providerId: string): Promise<void> {
    try {
      await this.entry(providerId).deleteCredential();
    } catch {
      return;
    }
  }

  async getSecret(providerId: string): Promise<string | null> {
    try {
      return (await this.entry(providerId).getPassword()) ?? null;
    } catch {
      return null;
    }
  }

  async hasSecret(providerId: string): Promise<boolean> {
    return (await this.getSecret(providerId)) !== null;
  }

  async setSecret(providerId: string, secret: string): Promise<void> {
    await this.entry(providerId).setPassword(secret);
  }

  private entry(providerId: string) {
    return new AsyncEntry(this.service, providerId);
  }
}
