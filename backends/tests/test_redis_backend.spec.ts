import { RedisBackend } from '../redis_backend';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import RedisServer from 'redis-server';
import { jest } from '@jest/globals';

describe('TestRedisBackend', async () => {
    let redisContainer: RedisServer;
    let backend: RedisBackend;

    beforeAll(async () => {
        redisContainer = new RedisServer();
        await redisContainer.open();

        backend = new RedisBackend(
            // redisContainer.getConnectionString(),
            "",
            false, // Disable notifications for testing
        );
    });

    afterAll(async () => {
        await redisContainer.close();
    });

    test('save_and_load_context', async () => {
        const contextKey = 'test_key';
        const contextData = { key: 'value' };
        
        await backend.saveContext(contextKey, contextData);
        const loadedContext = await backend.loadContext(contextKey);

        expect(loadedContext).toEqual(contextData);
    });

    test('acquire_and_release_lock', async () => {
        const lockKey = 'test_lock';
        const lockValue = 'test_value';
        const lockTimeout = 10000; // 10 seconds

        // Acquire the lock
        const lockAcquired = await backend.acquireLock(lockKey, lockValue, lockTimeout);
        expect(lockAcquired).toBe(true);

        // Release the lock
        const lockReleased = await backend.releaseLock(lockKey, lockValue);
        expect(lockReleased).toBe(1);
    });

    test('publish_and_subscribe_updates', async () => {
        const channel = 'test_channel';
        const updateReceived = new Promise<void>((resolve) => {
            const callback = async () => {
                resolve();
            };
            backend.subscribeToUpdates(channel, callback);
        });

        await backend.publishUpdate(channel);
        await expect(updateReceived).resolves.not.toThrow();
    });
});
