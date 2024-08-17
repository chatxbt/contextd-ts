import { MongoClient, Db, UpdateResult, Condition } from 'mongodb';
import { StorageBackend } from './base';
import { MongoNotification } from './notifications';
import { DateTime } from 'luxon';

export class MongoDBBackend implements StorageBackend {
  private client: MongoClient;
  private db: Db;
  private enableNotifications: boolean;
  private notification: MongoNotification;

  constructor(mongoUri: string, dbName: string, enableNotifications: boolean = true) {
    this.client = new MongoClient(mongoUri);
    this.db = this.client.db(dbName);
    this.enableNotifications = enableNotifications;
    this.notification = new MongoNotification(mongoUri, dbName);
  }

  async loadContext(contextKey: string): Promise<Record<string, any>> {
    const document = await this.db.collection('contexts').findOne({ context_key: contextKey });
    return document?.context || {};
  }

  async saveContext(contextKey: string, context: Record<string, any>): Promise<void> {
    await this.db.collection('contexts').updateOne(
      { context_key: contextKey },
      { $set: { context } },
      { upsert: true }
    );
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
    const expireAt = DateTime.utc().plus({ milliseconds: lockTimeout }).toJSDate();
    const result: UpdateResult = await this.db.collection('locks').updateOne(
      { _id: key as any, lock_value: { $exists: false } },
      { $set: { lock_value: lockValue, expire_at: expireAt } },
      { upsert: true }
    );
    return result.modifiedCount === 1;
  }

  async releaseLock(key: string, lockValue: string): Promise<void> {
    await this.db.collection('locks').deleteOne({ _id: key as any, lock_value: lockValue });
  }
}
