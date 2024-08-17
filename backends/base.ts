export interface StorageBackend {
  loadContext(contextKey: string): Promise<any>;
  saveContext(contextKey: string, context: Record<string, any>): Promise<void>;
  publishUpdate(channel: string): Promise<void>;
  subscribeToUpdates(channel: string, callback: () => void): Promise<void>;
  acquireLock(key: string, lockValue: string, lockTimeout: number): Promise<boolean>;
  releaseLock(key: string, lockValue: string): Promise<any>;
}

export abstract class AbstractStorageBackend implements StorageBackend {
  abstract loadContext(contextKey: string): Promise<any>;
  abstract saveContext(contextKey: string, context: Record<string, any>): Promise<void>;
  abstract publishUpdate(channel: string): Promise<void>;
  abstract subscribeToUpdates(channel: string, callback: () => void): Promise<void>;
  abstract acquireLock(key: string, lockValue: string, lockTimeout: number): Promise<boolean>;
  abstract releaseLock(key: string, lockValue: string): Promise<any>;
}
