import { v4 as uuidv4 } from 'uuid';
import { StorageBackend } from './backends/base';
import { logger } from './common/logger';
import { eventEmitter } from './common/event';

export class Contextd {
    public contextKey: string;
    public context: Record<string, any> = {};
    public storage: StorageBackend;
    public lockKey: string;
    public lockValue: string;
    public enableNotifications: boolean;

    constructor(contextKey: string, storageBackend: StorageBackend, enableNotifications: boolean = true) {
        this.contextKey = contextKey;
        this.storage = storageBackend;
        this.lockKey = `${this.contextKey}_lock`;
        this.lockValue = uuidv4();  // Unique identifier for the lock owner
        this.enableNotifications = enableNotifications;
        logger.debug(`Initialized Contextd with contextKey: ${this.contextKey}`);
    }

    async initialize(): Promise<void> {
        logger.debug("Initializing context");
        this.context = await this.storage.loadContext(this.contextKey);
        if (this.enableNotifications) {
            await this.storage.subscribeToUpdates(this.contextKey, () => this.loadContext());
        }
        logger.debug("Context initialized and subscription to updates set");
    }

    async loadContext(): Promise<void> {
        logger.debug("Loading context");
        this.context = await this.storage.loadContext(this.contextKey);
        logger.debug(`Context loaded: ${JSON.stringify(this.context)}`);
    }

    async saveContext(): Promise<void> {
        logger.debug(`Saving context: ${JSON.stringify(this.context)}`);
        await this.storage.saveContext(this.contextKey, this.context);
        eventEmitter.emit('context_updated', this.context);  // Emit the event using the global event emitter
        logger.debug("Context saved");
    }

    async acquireLock(lockTimeout: number = 10000, retryDelay: number = 100, maxRetries: number = 50): Promise<boolean> {
        logger.debug(`Acquiring lock with key: ${this.lockKey}`);
        for (let i = 0; i < maxRetries; i++) {
            const lockAcquired = await this.storage.acquireLock(this.lockKey, this.lockValue, lockTimeout);
            if (lockAcquired) {
                logger.debug("Lock acquired");
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
        logger.debug("Failed to acquire lock");
        return false;
    }

    async releaseLock(): Promise<void> {
        logger.debug(`Releasing lock with key: ${this.lockKey}`);
        await this.storage.releaseLock(this.lockKey, this.lockValue);
        logger.debug("Lock released");
    }

    async updateContext(key: string, value: any): Promise<void> {
        logger.debug(`Updating context key: ${key} with value: ${value}`);
        if (await this.acquireLock()) {
            try {
                this.context[key] = value;
                await this.saveContext();
            } finally {
                await this.releaseLock();
            }
        } else {
            logger.error("Failed to acquire lock for updating context");
            throw new Error("Failed to acquire lock for updating context");
        }
    }

    async transactionalUpdate(operations: Record<string, any>): Promise<void> {
        logger.debug(`Performing transactional update with operations: ${JSON.stringify(operations)}`);
        if (await this.acquireLock()) {
            try {
                for (const [key, value] of Object.entries(operations)) {
                    this.context[key] = value;
                }
                await this.saveContext();
            } finally {
                await this.releaseLock();
            }
        } else {
            logger.error("Failed to acquire lock for transactional update");
            throw new Error("Failed to acquire lock for transactional update");
        }
    }

    getContext(): Record<string, any> {
        logger.debug(`Getting context: ${JSON.stringify(this.context)}`);
        return this.context;
    }
}
