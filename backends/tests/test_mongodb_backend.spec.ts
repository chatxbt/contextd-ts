import { MongoMemoryServer } from 'mongodb-memory-server';
import { TestBase } from './test_base.spec'; // Import the TestBase class you created earlier
import { MongoDBBackend } from '../mongodb_backend'; // Assuming this is your MongoDB backend class

describe('TestMongoDBBackend', () => {
    let backend: MongoDBBackend;
    let mongoUri: string;

    beforeAll(async () => {
        await TestBase.setUpClass(); // Set up the containers and other necessary setups
        mongoUri = TestBase.mongodbContainer.getUri(); // Get the MongoDB URI from the TestBase class

        backend = new MongoDBBackend(
            mongoUri,
            'test_db'
        );
    });

    afterAll(async () => {
        await TestBase.tearDownClass(); // Tear down the containers
    });

    test('save_and_load_context', async () => {
        const contextKey = 'test_key';
        const contextData = { key: 'value' };

        await backend.saveContext(contextKey, contextData);
        const loadedContext = await backend.loadContext(contextKey);

        expect(loadedContext).toEqual(contextData);
    });
});
