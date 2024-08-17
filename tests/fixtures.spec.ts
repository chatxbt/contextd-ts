import { MongoMemoryServer } from 'mongodb-memory-server';
import RedisServer from 'redis-server';
import { GenericContainer } from 'testcontainers';
import { MongoDBBackend } from '../backends/mongodb_backend';
import { RedisBackend } from '../backends/redis_backend';
import { S3Backend } from '../backends/s3_backend';

// MongoDB Container
let mongodbContainer: MongoMemoryServer;
let redisContainer: RedisServer;
let s3Container: GenericContainer | any;

// Fixtures
let mongodbBackend: MongoDBBackend;
let redisBackend: RedisBackend;
let s3Backend: S3Backend;

beforeAll(async () => {
    // MongoDB Setup
    mongodbContainer = new MongoMemoryServer();
    const mongoUri = await mongodbContainer.getUri();
    mongodbBackend = new MongoDBBackend(mongoUri, 'test_db');

    // Redis Setup
    redisContainer = new RedisServer();
    await redisContainer.open();
    // const redisUrl = `redis://localhost:${redisContainer.port}`;
    const redisUrl = `redis://localhost:${8000}`;
    redisBackend = new RedisBackend(redisUrl);

    // S3 Setup
    s3Container = await new GenericContainer('minio/minio:latest')
        .withExposedPorts(9000)
        .withEnvironment({
            'MINIO_ACCESS_KEY': 'test_access_key',
            'MINIO_SECRET_KEY': 'test_secret_key'
        })
        // .withEnv('MINIO_ACCESS_KEY', 'test_access_key')
        // .withEnv('MINIO_SECRET_KEY', 'test_secret_key')
        .start();

    const s3Url = `http://${s3Container.getHost()}:${s3Container.getMappedPort(9000)}`;
    s3Backend = new S3Backend({
        bucketName: 'test_bucket',
        awsAccessKeyId: 'test_access_key',
        awsSecretAccessKey: 'test_secret_key',
        redisUrl: s3Url,
        regionName: 'us-east-1',
    });
});

afterAll(async () => {
    // Stop all containers
    await mongodbContainer.stop();
    await redisContainer.close();
    await s3Container.stop();
});

describe('Test Backend Connections', () => {
    test('MongoDB connection', () => {
        expect(mongodbBackend).toBeDefined();
        expect(mongodbBackend).toBeInstanceOf(MongoDBBackend);
    });

    test('Redis connection', () => {
        expect(redisBackend).toBeDefined();
        expect(redisBackend).toBeInstanceOf(RedisBackend);
    });

    test('S3 connection', () => {
        expect(s3Backend).toBeDefined();
        expect(s3Backend).toBeInstanceOf(S3Backend);
    });
});
