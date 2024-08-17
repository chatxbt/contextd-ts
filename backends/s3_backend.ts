import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { StorageBackend } from './base';
import { RedisNotification, MongoNotification  } from './notifications';
import { DateTime } from 'luxon';

export class S3Backend implements StorageBackend {
  private s3: S3Client;
  private bucketName: string;
  private enableNotifications: boolean;
  private notification: RedisNotification | MongoNotification | null = null;

  constructor({
    bucketName,
    awsAccessKeyId,
    awsSecretAccessKey,
    regionName,
    notificationType  = 'redis',
    redisUrl,
    mongoUri,
    dbName,
    enableNotifications = true
  }:{
    bucketName: string,
    awsAccessKeyId: string,
    awsSecretAccessKey: string,
    regionName: string,
    notificationType?: 'redis' | 'mongo',
    redisUrl?: string,
    mongoUri?: string,
    dbName?: string,
    enableNotifications?: boolean
  }
  ) {
    this.s3 = new S3Client({
      region: regionName,
      credentials: {
        accessKeyId: awsAccessKeyId,
        secretAccessKey: awsSecretAccessKey,
      },
    });
    this.bucketName = bucketName;
    this.enableNotifications = enableNotifications;

    if (notificationType === 'mongo' && mongoUri && dbName) {
      this.notification = new MongoNotification(mongoUri, dbName);
    } else if (notificationType === 'redis' && redisUrl) {
      this.notification = new RedisNotification(redisUrl);
    }
  }

  async loadContext(contextKey: string): Promise<Record<string, any>> {
    try {
      const command = new GetObjectCommand({ Bucket: this.bucketName, Key: contextKey });
      const response = await this.s3.send(command);
      const body = await streamToString(response.Body as ReadableStream);
      return JSON.parse(body);
    } catch (error) {
      if (error.name === 'NoSuchKey') {
        return {};
      }
      throw error;
    }
  }

  async saveContext(contextKey: string, context: Record<string, any>): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: contextKey,
      Body: JSON.stringify(context),
    });
    await this.s3.send(command);

    if (this.enableNotifications && this.notification) {
      await this.notification.publishUpdate(contextKey);
    }
  }

  async publishUpdate(channel: string): Promise<void> {
    if (this.enableNotifications && this.notification) {
      await this.notification.publishUpdate(channel);
    }
  }

  async subscribeToUpdates(channel: string, callback: () => void): Promise<void> {
    if (this.enableNotifications && this.notification) {
      await this.notification.subscribeToUpdates(channel, async () => callback());
    }
  }

  async acquireLock(key: string, lockValue: string, lockTimeout: number): Promise<boolean> {
    const expireAt = DateTime.utc().plus({ milliseconds: lockTimeout }).toISO();
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: lockValue,
      Metadata: { expire_at: expireAt },
      // ConditionExpression: 'attribute_not_exists(lock_value)',
    });

    try {
      await this.s3.send(command);
      return true;
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        return false;
      }
      throw error;
    }
  }

  async releaseLock(key: string, lockValue: string): Promise<void> {
    try {
      const getCommand = new GetObjectCommand({ Bucket: this.bucketName, Key: key });
      const response = await this.s3.send(getCommand);
      const body = await streamToString(response.Body as ReadableStream);

      if (body === lockValue) {
        const deleteCommand = new DeleteObjectCommand({ Bucket: this.bucketName, Key: key });
        await this.s3.send(deleteCommand);
      }
    } catch (error) {
      if (error.name !== 'NoSuchKey') {
        throw error;
      }
    }
  }
}

// Helper function to convert a readable stream to a string
async function streamToString(stream: ReadableStream | null): Promise<string> {
  if (!stream) {
    return '';
  }
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let result = '';
  let done = false;

  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    if (value) {
      result += decoder.decode(value, { stream: !done });
    }
  }

  return result;
}
