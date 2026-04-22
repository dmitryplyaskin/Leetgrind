import type { ProviderCredentialStore } from "@leetgrind/ai";

export class InMemoryCredentialStore implements ProviderCredentialStore {
  private readonly secrets = new Map<string, string>();

  async deleteSecret(providerId: string): Promise<void> {
    this.secrets.delete(providerId);
  }

  async getSecret(providerId: string): Promise<string | null> {
    return this.secrets.get(providerId) ?? null;
  }

  async hasSecret(providerId: string): Promise<boolean> {
    return this.secrets.has(providerId);
  }

  async setSecret(providerId: string, secret: string): Promise<void> {
    this.secrets.set(providerId, secret);
  }
}
