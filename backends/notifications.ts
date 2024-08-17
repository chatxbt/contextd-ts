import { createClient, RedisClientType, RedisDefaultModules } from 'redis';
import { MongoClient, Db, ChangeStream } from 'mongodb';

export type RedisTimeoutError = Error;  // Alias for a potential timeout error, adjust as needed

export class RedisNotification {
  private redis: RedisClientType<RedisDefaultModules>;

  constructor(redisUrl: string) {
    this.redis = createClient({ url: redisUrl });
    this.redis.connect();
  }

  async publishUpdate(channel: string): Promise<void> {
    await this.redis.publish(channel, "update");
  }

  async subscribeToUpdates(channel: string, callback: () => Promise<void>): Promise<void> {
    const subscriber = this.redis.duplicate();  // Create a new Redis client for subscription
    await subscriber.connect();
    await subscriber.subscribe(channel, async (message) => {
      if (message === "update") {
        await callback();
      }
    });
  }
}

export class MongoNotification {
  private client: MongoClient;
  private db: Db;

  constructor(mongoUri: string, dbName: string) {
    this.client = new MongoClient(mongoUri);
    this.db = this.client.db(dbName);
  }

  async publishUpdate(channel: string): Promise<void> {
    // MongoDB change streams automatically handle publishing updates
  }

  async subscribeToUpdates(channel: string, callback: () => Promise<void>): Promise<void> {
    const collection = this.db.collection('contexts');
    const changeStream: ChangeStream = collection.watch([{ $match: { operationType: 'update' } }]);

    changeStream.on('change', async (change) => {
      await callback();
    });
  }
}
