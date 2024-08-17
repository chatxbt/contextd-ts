// import { S3Backend } from '../s3_backend';
// import { MinioContainer } from 'testcontainers-minio';
// import { jest } from '@jest/globals';

// describe('TestS3Backend', () => {
//     let minioContainer: MinioContainer;
//     let backend: S3Backend;

//     beforeAll(async () => {
//         minioContainer = new MinioContainer('minio/minio:latest')
//             .withEnv('MINIO_ACCESS_KEY', 'minioadmin')
//             .withEnv('MINIO_SECRET_KEY', 'minioadmin');
//         await minioContainer.start();

//         const minioConfig = minioContainer.getConfig();

//         backend = new S3Backend({
//             bucketName: 'test_bucket',
//             awsAccessKeyId: minioConfig.access_key,
//             awsSecretAccessKey: minioConfig.secret_key,
//             regionName: 'us-east-1',
//         });
//     });

//     afterAll(async () => {
//         await minioContainer.stop();
//     });

//     test('save_and_load_context', async () => {
//         const contextKey = 'test_key';
//         const contextData = { key: 'value' };

//         await backend.saveContext(contextKey, contextData);
//         const loadedContext = await backend.loadContext(contextKey);

//         expect(loadedContext).toEqual(contextData);
//     });

//     test('publish_update', async () => {
//         const channel = 'test_channel';
//         await backend.publishUpdate(channel);
//         // No assertions needed as publishUpdate doesn't return anything
//     });

//     test('subscribe_to_updates', async () => {
//         const channel = 'test_channel';
//         const updateReceived = new Promise<void>((resolve) => {
//             const callback = async () => {
//                 resolve();
//             };
//             backend.subscribeToUpdates(channel, callback);
//         });

//         await backend.publishUpdate(channel);
//         await expect(updateReceived).resolves.not.toThrow();
//     });

//     test('acquire_and_release_lock', async () => {
//         const key = 'test_key';
//         const lockValue = 'test_value';
//         const lockTimeout = 10000; // 10 seconds

//         const lockAcquired = await backend.acquireLock(key, lockValue, lockTimeout);
//         expect(lockAcquired).toBe(true);

//         const lockReleased = await backend.releaseLock(key, lockValue);
//         expect(lockReleased).toBe(true);
//     });
// });
