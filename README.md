# Contextd

A Distributed Context Management System with Redis

## Overview

Contextd is an asynchronous, distributed context management system designed to work across multiple servers. It leverages Redis for storing the context and provides mechanisms to synchronize context updates across different instances using Redis Pub/Sub. The class also incorporates distributed locking to ensure safe, concurrent updates to individual context keys, making it ideal for use in distributed systems where multiple processes or servers need to share and update a common state.

## Features

- **Asynchronous Operations:** All operations are non-blocking and designed for use in an asynchronous environment.
- **Distributed Context Management:** Context is stored in Redis, allowing it to be shared across multiple instances or servers.
- **Event-Based Context Synchronization:** Automatically synchronizes context updates across all instances using Redis Pub/Sub.
- **Key-Based Distributed Locking:** Ensures that updates to individual context keys are thread-safe and free from race conditions.
- **Retry Mechanism:** Built-in retries for acquiring locks ensure robustness in high-contention environments.

## Installation

To use contextd, you need to install the following TypeScript package:

```bash
npm install ioredis
```

## Initialization

### Creating an Instance

To create an instance of Contextd, you need to specify a context key that uniquely identifies the context object in Redis. Optionally, you can also specify Redis connection details and the Pub/Sub channel name.

```typescript
import { Contextd } from 'contextd';

const context = new Contextd({
  contextKey: 'my_cxtd',
  redisHost: 'localhost',
  redisPort: 6379,
  redisDb: 0,
  pubsubChannel: 'context_updates'
});

```

### Initialize the Context

Before using the context, you must initialize it, which establishes the Redis connection, loads the initial context, and starts listening for updates.

```typescript
await context.initialize();
```

## Usage

### Updating the Context

You can update individual keys in the context using the update_context method. This method automatically handles acquiring and releasing a distributed lock for the specific key.

```typescript
await context.updateContext("user", { name: "John Doe", email: "john@example.com" });
```

### Transactional Updates

For updating multiple keys in a single atomic operation, use the transactional_update method. This ensures that all updates are applied together under the protection of a lock.

```typescript
await context.transactionalUpdate({
  user: { name: "Jane Doe", email: "jane@example.com" },
  loggedIn: true
});

```

### Retrieving the Context

To retrieve the current context, use the get_context method:

```typescript
const currentContext = await context.getContext();
console.log(currentContext);
```

### Listening for Updates

Contextd automatically listens for updates from other instances. When an update is received, the context is refreshed to reflect the latest state. This happens automatically, so you don’t need to manage it manually.

## Example

Here’s a full example demonstrating how to use Contextd:

```typescript
import { Contextd } from 'contextd';

(async () => {
  // Create and initialize the context
  const cxtd = new Contextd({ contextKey: "my_cxtd" });
  await cxtd.initialize();

  // Update context
  await cxtd.updateContext("user", { name: "John Doe", email: "john@example.com" });

  // Perform transactional updates
  await cxtd.transactionalUpdate({
    user: { name: "Jane Doe", email: "jane@example.com" },
    loggedIn: true
  });

  // Retrieve current context
  const currentContext = await cxtd.getContext();
  console.log(`Current Context: ${currentContext}`);
})();
```

## Advanced Configuration

### Redis Connection

By default, the class connects to Redis using localhost on port 6379 with database 0. You can customize these settings through the constructor:

```typescript
const cxtd = new Contextd({
  contextKey: "my_cxtd",
  redisHost: 'my-redis-server',
  redisPort: 6380,
  redisDb: 1
});
```

### Locking and Retry Mechanism

The acquire_lock method allows for setting a custom lock timeout, retry delay, and maximum number of retries:

```typescript
const lockAcquired = await context.acquireLock({
  key: "user",
  lockTimeout: 15000,  // 15 seconds
  retryDelay: 200,     // 200 ms
  maxRetries: 100      // Retry up to 100 times
});

```

## Best Practices

	•	Use Key-Based Locking: Each context key is locked independently, allowing different keys to be updated concurrently without conflicts.
	•	Optimize Retry Settings: Tune the retry delay and maximum retries based on your application’s concurrency requirements and Redis latency.
	•	Monitor Redis: Since Redis is central to this system, monitor its performance and availability, especially in production environments.

## Troubleshooting

	•	Lock Contention: If you experience high contention on locks, consider reviewing your application’s design to reduce simultaneous updates to the same keys or increase the retry count and delay.
	•	Redis Connection Issues: Ensure that the Redis server is reachable from all instances that use Contextd. If you experience connection timeouts or errors, verify the Redis configuration and network settings.

## TODO

1. Add support for local caching
2. Add support for multiple storage backends (Redis, SQLite, S3, etc.)

## License

Contextd is licensed under the MIT License. See the LICENSE file for more details.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue to discuss your ideas or report bugs.

## Contact

For questions or support, please open an issue on the GitHub repository.

This documentation should provide a comprehensive guide for using Contextd in your distributed applications.
