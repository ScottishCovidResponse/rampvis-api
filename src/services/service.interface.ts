export interface IService<T> {
    get(id: string): Promise<T>;
    get(query: object): Promise<T>;
    getAll(query?: object, options?: object): Promise<T[]>;
    getLatest(query: object, numDocs: number): Promise<T>;
    getOrCreate(query: object, entity: T): Promise<T>;
    save(entity: T): Promise<T>;
    delete(id: string): Promise<T>;
    update(id: string, entity: T): Promise<boolean>;
    updateAndGet(id: string, entity: T): Promise<T>;
    createIndex(field: any, expiry: number): Promise<boolean>;
}
