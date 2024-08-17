import { StorageBackend } from './base';

export class OverlayStorageBackend implements StorageBackend {
  private primaryBackend: StorageBackend;
  private secondaryBackends: StorageBackend[];
  private enableNotifications: boolean;

  constructor(primaryBackend: StorageBackend, ...secondaryBackends: StorageBackend[]) {
    this.primaryBackend = primaryBackend;
    this.secondaryBackends = secondaryBackends;
    this.enableNotifications = true;
  }

  async loadContext(contextKey: string): Promise<Record<string, any>> {
    return await this.primaryBackend.loadContext(contextKey);
  }

  async saveContext(contextKey: string, context: Record<string, any>): Promise<void> {
    await this.primaryBackend.saveContext(contextKey, context);
    for (const backend of this.secondaryBackends) {
      await backend.saveContext(contextKey, context);
    }
    if (this.enableNotifications) {
      await this.primaryBackend.publishUpdate(contextKey);
    }
  }

  async publishUpdate(channel: string): Promise<void> {
    if (this.enableNotifications) {
      await this.primaryBackend.publishUpdate(channel);
    }
  }

  async subscribeToUpdates(channel: string, callback: () => void): Promise<void> {
    if (this.enableNotifications) {
      await this.primaryBackend.subscribeToUpdates(channel, callback);
    }
  }

  async acquireLock(key: string, lockValue: string, lockTimeout: number): Promise<boolean> {
    return await this.primaryBackend.acquireLock(key, lockValue, lockTimeout);
  }

  async releaseLock(key: string, lockValue: string): Promise<void> {
    await this.primaryBackend.releaseLock(key, lockValue);
    for (const backend of this.secondaryBackends) {
      await backend.releaseLock(key, lockValue);
    }
  }
}
