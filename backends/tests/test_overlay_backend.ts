// import { MongoDBBackend } from '../mongodb_backend';
// import { RedisBackend } from '../redis_backend';
// import { S3Backend } from '../s3_backend';
// import { OverlayStorageBackend } from '../overlay_backend';
// import { TestBase } from './test_base.spec';
// import { jest } from '@jest/globals';

// describe('TestMongoDBBackend', () => {
//     let mongodbBackend: MongoDBBackend | any;

//     beforeAll(async () => {
//         await TestBase.setUpClass();
//         mongodbBackend = new MongoDBBackend(
//             TestBase.mongodbContainer.getUri(),
//             'test_db',
//         );
//     });

//     afterAll(async () => {
//         await TestBase.tearDownClass();
//     });

//     test('delete_context', async () => {
//         const contextKey = 'test_key';
//         const contextData = { key: 'value' };

//         await mongodbBackend.saveContext(contextKey, contextData);
//         await mongodbBackend.deleteContext(contextKey);
//         const deletedContext = await mongodbBackend.loadContext(contextKey);
//         expect(deletedContext).toBeNull();
//     });

//     test('list_contexts', async () => {
//         const contextKeys = ['key1', 'key2', 'key3'];
//         for (const key of contextKeys) {
//             await mongodbBackend.saveContext(key, { data: key });
//         }

//         const listedKeys = await mongodbBackend.listContexts();
//         expect(new Set(listedKeys)).toEqual(new Set(contextKeys));
//     });
// });

// describe('TestRedisBackend', () => {
//     let redisBackend: RedisBackend;

//     beforeAll(async () => {
//         await TestBase.setUpClass();
//         redisBackend = new RedisBackend(
//             TestBase.redisContainer.getConnectionString(),
//             false,
//         );
//     });

//     afterAll(async () => {
//         await TestBase.tearDownClass();
//     });

//     test('delete_context', async () => {
//         const contextKey = 'test_key';
//         const contextData = { key: 'value' };

//         await redisBackend.saveContext(contextKey, contextData);
//         await redisBackend.deleteContext(contextKey);
//         const deletedContext = await redisBackend.loadContext(contextKey);
//         expect(deletedContext).toBeNull();
//     });

//     test('list_contexts', async () => {
//         const contextKeys = ['key1', 'key2', 'key3'];
//         for (const key of contextKeys) {
//             await redisBackend.saveContext(key, { data: key });
//         }

//         const listedKeys = await redisBackend.listContexts();
//         expect(new Set(listedKeys)).toEqual(new Set(contextKeys));
//     });
// });

// describe('TestS3Backend', () => {
//     let s3Backend: S3Backend;

//     beforeAll(async () => {
//         await TestBase.setUpClass();
//         const config = TestBase.minioContainer.getConfig();
//         s3Backend = new S3Backend({
//             bucketName: 'test_bucket',
//             awsAccessKeyId: config.accessKey,
//             awsSecretAccessKey: config.secretKey,
//             regionName: 'us-east-1',
//         });
//     });

//     afterAll(async () => {
//         await TestBase.tearDownClass();
//     });

//     test('delete_context', async () => {
//         const contextKey = 'test_key';
//         const contextData = { key: 'value' };

//         await s3Backend.saveContext(contextKey, contextData);
//         await s3Backend.deleteContext(contextKey);
//         const deletedContext = await s3Backend.loadContext(contextKey);
//         expect(deletedContext).toBeNull();
//     });

//     test('list_contexts', async () => {
//         const contextKeys = ['key1', 'key2', 'key3'];
//         for (const key of contextKeys) {
//             await s3Backend.saveContext(key, { data: key });
//         }

//         const listedKeys = await s3Backend.listContexts();
//         expect(new Set(listedKeys)).toEqual(new Set(contextKeys));
//     });
// });

// describe('TestOverlayStorageBackend', () => {
//     let primaryBackend: MongoDBBackend;
//     let secondaryBackend: RedisBackend;
//     let overlayBackend: OverlayStorageBackend;

//     beforeAll(async () => {
//         await TestBase.setUpClass();
//         primaryBackend = new MongoDBBackend(
//             TestBase.mongodbContainer.getUri(),
//             'test_db',
//         );
//         secondaryBackend = new RedisBackend(
//             TestBase.redisContainer.getConnectionString(),
//             false,
//         );
//         overlayBackend = new OverlayStorageBackend(primaryBackend, secondaryBackend);
//     });

//     afterAll(async () => {
//         await TestBase.tearDownClass();
//     });

//     test('save_and_load_context', async () => {
//         const contextKey = 'test_key';
//         const contextData = { key: 'value' };

//         await overlayBackend.saveContext(contextKey, contextData);
//         const primaryContext = await primaryBackend.loadContext(contextKey);
//         const secondaryContext = await secondaryBackend.loadContext(contextKey);

//         expect(contextData).toEqual(primaryContext);
//         expect(contextData).toEqual(secondaryContext);

//         const loadedContext = await overlayBackend.loadContext(contextKey);
//         expect(contextData).toEqual(loadedContext);
//     });

//     test('publish_update', async () => {
//         const channel = 'test_channel';
//         const publishUpdateSpy = jest.spyOn(overlayBackend, 'publishUpdate');

//         await overlayBackend.publishUpdate(channel);

//         expect(publishUpdateSpy).toHaveBeenCalledWith(channel);
//     });

//     test('subscribe_to_updates', async () => {
//         const channel = 'test_channel';
//         const callback = jest.fn();
//         const subscribeSpy = jest.spyOn(overlayBackend, 'subscribeToUpdates');

//         await overlayBackend.subscribeToUpdates(channel, callback);

//         expect(subscribeSpy).toHaveBeenCalledWith(channel, callback);
//     });

//     test('acquire_and_release_lock', async () => {
//         const key = 'test_key';
//         const lockValue = 'test_value';
//         const lockTimeout = 1000;

//         const lockAcquired = await overlayBackend.acquireLock(key, lockValue, lockTimeout);
//         expect(lockAcquired).toBe(true);

//         const releaseSpy = jest.spyOn(overlayBackend, 'releaseLock');
//         await overlayBackend.releaseLock(key, lockValue);

//         expect(releaseSpy).toHaveBeenCalledWith(key, lockValue);
//     });
// });
