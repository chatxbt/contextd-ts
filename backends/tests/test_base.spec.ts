import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { MongoMemoryServer } from 'mongodb-memory-server';
import RedisServer from 'redis-server';

export class TestBase {
    static mongodbContainer: MongoMemoryServer;
    static redisContainer: RedisServer;
    static minioContainer: StartedTestContainer;

    // Set up containers before running tests
    static async setUpClass() {
        // MongoDB setup
        this.mongodbContainer = new MongoMemoryServer();
        await this.mongodbContainer.start();

        // Redis setup
        this.redisContainer = new RedisServer();
        await this.redisContainer.open();

        // MinIO setup
        this.minioContainer = await new GenericContainer('minio/minio:latest')
            .withEnvironment({
                'MINIO_ACCESS_KEY': 'minioadmin',
                'MINIO_SECRET_KEY': 'minioadmin'
            })
            .withExposedPorts(9000)
            .start();
    }

    // Tear down containers after tests complete
    static async tearDownClass() {
        if (this.mongodbContainer) {
            await this.mongodbContainer.stop();
        }
        if (this.redisContainer) {
            await this.redisContainer.close();
        }
        if (this.minioContainer) {
            await this.minioContainer.stop();
        }
    }
}

// Jest setup and teardown
beforeAll(async () => {
    await TestBase.setUpClass();
});

afterAll(async () => {
    await TestBase.tearDownClass();
});

// Example test case
describe('Example Test', () => {
    test('Dummy test to ensure setup works', () => {
        expect(TestBase.mongodbContainer).toBeDefined();
        expect(TestBase.redisContainer).toBeDefined();
        expect(TestBase.minioContainer).toBeDefined();
    });
});
