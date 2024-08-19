import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoDBBackend } from '../backends/mongodb_backend';
import { Contextd } from '../context';
import { jest } from '@jest/globals';

describe('TestContextd', () => {
    let mongoServer: MongoMemoryServer | any;
    let storageBackend: jest.Mocked<MongoDBBackend>;
    let contextKey: string;
    let contextd: Contextd;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = await mongoServer.getUri();
        storageBackend = {
            loadContext: jest.fn(),
            saveContext: jest.fn(),
            acquireLock: jest.fn(),
            releaseLock: jest.fn(),
            subscribeToUpdates: jest.fn()
        } as unknown as jest.Mocked<MongoDBBackend>;
        contextKey = "test_context";
        contextd = new Contextd(contextKey, storageBackend);
    });

    afterAll(async () => {
        await mongoServer.stop();
    });

    test('initialize', async () => {
        await contextd.initialize();
        expect(storageBackend.loadContext).toHaveBeenCalledWith(contextKey);
        expect(storageBackend.subscribeToUpdates).toHaveBeenCalledWith(contextKey, expect.any(Function));
    });

    test('loadContext', async () => {
        const contextData = { key: "value" };
        storageBackend.loadContext.mockResolvedValue(contextData);

        await contextd.loadContext();
        expect(contextd.getContext()).toEqual(contextData);
        expect(storageBackend.loadContext).toHaveBeenCalledWith(contextKey);
    });

    test('saveContext', async () => {
        contextd.context = { key: "value" };

        await contextd.saveContext();
        expect(storageBackend.saveContext).toHaveBeenCalledWith(contextKey, contextd.getContext());
    });

    test('acquireLock', async () => {
        storageBackend.acquireLock.mockResolvedValue(true);

        const lockAcquired = await contextd.acquireLock();
        expect(lockAcquired).toBe(true);
        expect(storageBackend.acquireLock).toHaveBeenCalledWith(contextd.lockKey, contextd.lockValue, 10000);
    });

    test('releaseLock', async () => {
        await contextd.releaseLock();
        expect(storageBackend.releaseLock).toHaveBeenCalledWith(contextd.lockKey, contextd.lockValue);
    });

    test('updateContext', async () => {
        storageBackend.acquireLock.mockResolvedValue(true);

        await contextd.updateContext("key", "value");
        expect(contextd.getContext()["key"]).toBe("value");
        expect(storageBackend.saveContext).toHaveBeenCalledWith(contextKey, contextd.getContext());
        expect(storageBackend.releaseLock).toHaveBeenCalledWith(contextd.lockKey, contextd.lockValue);
    });

    test('transactionalUpdate', async () => {
        storageBackend.acquireLock.mockResolvedValue(true);
        const operations = { key1: "value1", key2: "value2" };

        await contextd.transactionalUpdate(operations);
        expect(contextd.getContext()["key1"]).toBe("value1");
        expect(contextd.getContext()["key2"]).toBe("value2");
        expect(storageBackend.saveContext).toHaveBeenCalledWith(contextKey, contextd.getContext());
        expect(storageBackend.releaseLock).toHaveBeenCalledWith(contextd.lockKey, contextd.lockValue);
    });

    test('getContext', () => {
        contextd.context = { key: "value" };
        expect(contextd.getContext()).toEqual({ key: "value" });
    });
});
