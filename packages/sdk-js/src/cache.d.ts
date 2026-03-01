export declare class Cache<T> {
    private store;
    private ttlMs;
    constructor(ttlMs?: number);
    get(key: string): T | undefined;
    set(key: string, value: T): void;
    has(key: string): boolean;
    delete(key: string): void;
    clear(): void;
    size(): number;
}
