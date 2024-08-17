import { createClient, RedisClientType, RedisDefaultModules } from 'redis';
import { StorageBackend } from './base';
import { RedisNotification } from './notifications';

export class RedisBackend implements StorageBackend {
  private redis: RedisClientType<RedisDefaultModules>;
  private enableNotifications: boolean;
  private notification: RedisNotification;

  constructor(redisUrl: string, enableNotifications: boolean = true) {
    this.redis = createClient({ url: redisUrl });
    this.redis.connect();  // Connect to Redis server
    this.enableNotifications = enableNotifications;
    this.notification = new RedisNotification(redisUrl);
  }

  async loadContext(contextKey: string): Promise<Record<string, any>> {
    const contextData = await this.redis.get(contextKey);
    return contextData ? JSON.parse(contextData) : {};
  }

  async saveContext(contextKey: string, context: Record<string, any>): Promise<void> {
    await this.redis.set(contextKey, JSON.stringify(context));
    if (this.enableNotifications) {
      await this.notification.publishUpdate(contextKey);
    }
  }

  async publishUpdate(channel: string): Promise<void> {
    if (this.enableNotifications) {
      await this.notification.publishUpdate(channel);
    }
  }

  async subscribeToUpdates(channel: string, callback: () => void): Promise<void> {
    if (this.enableNotifications) {
      await this.notification.subscribeToUpdates(channel, async () => callback());
    }
  }

  async acquireLock(key: string, lockValue: string, lockTimeout: number): Promise<boolean> {
    const result = await this.redis.set(key, lockValue, {
      NX: true,  // Only set the key if it does not already exist
      PX: lockTimeout,  // Set the expiration time in milliseconds
    });
    return result !== null;
  }

  async releaseLock(key: string, lockValue: string): Promise<number> {
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
      else
          return 0
      end
    `;
    const result = await this.redis.eval(script, { keys: [key], arguments: [lockValue] });
    return result as number;
  }
}
