# Using contextd with Redis

[`contextd`](https://github.com/contextualized/contextd-ts) is a TypeScript library for managing context data in applications. It provides a simple and flexible way to store and retrieve context-specific data, such as user preferences, session information, or application state.

In this example, we'll demonstrate how to use `contextd` with Redis as the backend store for storing and retrieving context data.

## Prerequisites

Before running this example, make sure you have the following:

- A Redis server running (either locally or on a remote server)
- The Redis TypeScript client library installed:

```bash
npm install ioredis
```


## Example Code

```typescript
import { Contextd } from 'contextd';
import Redis from 'ioredis';

// Connect to Redis
const redisClient = new Redis({
  host: 'localhost',
  port: 6379,
  db: 0,
});

// Create a context manager with Redis as the backend store
const contextManager = new Contextd({
  backend: 'redis',
  backendOptions: { client: redisClient },
});

// Use the context manager as you would normally
(async () => {
  const ctx = await contextManager.startContext('my_context');

  await ctx.set('key1', 'value1');
  await ctx.set('key2', 'value2');

  // Retrieve values from the context
  const value1 = await ctx.get('key1');
  const value2 = await ctx.get('key2');
  console.log(`Value1: ${value1}, Value2: ${value2}`);

  // The context data is now stored in Redis
})();


# The context data is now stored in Redis
```

## Explanation

1. We import the necessary modules: `contextd` for the context management library and `redis` for the Redis client.
2. We connect to a Redis server (in this case, running locally on the default port).
3. We create a `ContextManager` instance with `'redis'` as the backend and pass the Redis client as the `backend_options`.
4. We start a new context named `'my_context'` using the `start_context` method.
5. Within the context, we set two key-value pairs using the `set` method.
6. We retrieve the values of the keys using the `get` method and print them.
7. When the context manager exits (either by reaching the end of the `with` block or due to an exception), the context data is automatically stored in Redis.

## Usage

To run this example, ensure you have a Redis server running and the ioredis TypeScript library installed. You can install it using: npm install ioredis

Update the Redis connection details (host, port, etc.) in the code to match your Redis server configuration.

This example demonstrates how `contextd` can be used with Redis as the backend store for storing and retrieving context data. By leveraging Redis, you can easily share context data across multiple processes or machines, making it suitable for distributed applications or microservices architectures.