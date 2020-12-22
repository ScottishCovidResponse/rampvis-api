import { inject, unmanaged } from 'inversify';
import { provide } from 'inversify-binding-decorators';
import {
    AggregationCursor,
    Collection,
    FilterQuery,
    FindAndModifyWriteOpResultObject,
    FindOneAndUpdateOption,
    FindOneOptions,
    ObjectId,
    UpdateOneOptions,
    UpdateQuery,
    UpdateWriteOpResult,
} from 'mongodb';

import { DbClient } from '../infrastructure/db/mongodb.connection';
import { MAPPING_TYPES } from './config/automapper.config';
import { TYPES } from './config/types';

@provide(TYPES.DataService)
export abstract class DataService<T extends { _id: any }> {
    private readonly dbCollection: Collection<T>;
    private dbName: string;
    private readonly dbCollectionName: string;

    protected constructor(
        @inject(TYPES.DbClient) dbClient: DbClient,
        @unmanaged() dbName: string,
        @unmanaged() collectionName: string,
    ) {
        this.dbName = dbName;
        this.dbCollectionName = collectionName;
        this.dbCollection = dbClient.db(this.dbName).collection<T>(this.dbCollectionName);
    }

    public getDbCollection(): Collection<T> {
        return this.dbCollection;
    }

    public async get(arg: string | FilterQuery<T>): Promise<T> {
        let doc: T; // typeof _id = ObjectId

        if (typeof arg === 'string') {
            doc = (await this.dbCollection.findOne({ _id: new ObjectId(arg) } as FilterQuery<T>)) as T;
        } else if (typeof arg === 'object') {
            doc = (await this.dbCollection.findOne(arg as FilterQuery<T>)) as T;
        } else {
            return null as any;
        }

        return automapper.map(MAPPING_TYPES.MongoDbObjectId, MAPPING_TYPES.TsString, doc);
    }

    public async matchAny(arg: any): Promise<T> {
        return (await this.dbCollection.findOne({$or: arg})) as T;
    }

    public async getAll(query: FilterQuery<T> = {}, options: FindOneOptions<any> = {}): Promise<T[]> {
        const docs: any[] = await this.dbCollection.find(query).project(options).toArray();
        return automapper.map(MAPPING_TYPES.MongoDbObjectId, MAPPING_TYPES.TsString, docs);
    }

    // Get latest numDocs number of document from a collection passing the query
    public async getLatest(query: FilterQuery<T> = {}, numDocs: number = 1): Promise<T> {
        // Auto created _id field it has a lastPostDate embedded in it (_id: 1) or use natural order ($natural: 1)
        // 1 will sort ascending (oldest to newest) and -1 will sort descending (newest to oldest.)
        const docs: any[] = await this.dbCollection.find(query).sort({ $natural: -1 }).limit(numDocs).toArray();
        return automapper.map(MAPPING_TYPES.MongoDbObjectId, MAPPING_TYPES.TsString, docs)[0];
    }

    // get or create and get object
    public async getOrCreate(query: FilterQuery<T> = {}, entity: T): Promise<T> {
        const res: FindAndModifyWriteOpResultObject<T> = await this.getDbCollection().findOneAndUpdate(
            query,
            { $setOnInsert: entity } as UpdateQuery<T>,
            {
                returnOriginal: false, // When false, returns the updated document rather than the original. The default is true.
                upsert: true,
            } as FindOneAndUpdateOption<T>,
        );

        return automapper.map(MAPPING_TYPES.MongoDbObjectId, MAPPING_TYPES.TsString, res.value);
    }

    public async create(entity: T): Promise<T> {
        const res = await this.dbCollection.insertOne(entity as any);
        return automapper.map(MAPPING_TYPES.MongoDbObjectId, MAPPING_TYPES.TsString, res.ops[0]);
    }

    public async delete(id: string): Promise<T> {
        const res: FindAndModifyWriteOpResultObject<T> = await this.dbCollection.findOneAndDelete({
            _id: new ObjectId(id),
        } as FilterQuery<T>);
        return automapper.map(MAPPING_TYPES.MongoDbObjectId, MAPPING_TYPES.TsString, res.value);
    }

    // update and get update status
    public async update(id: string, entity: T): Promise<boolean> {
        const res: UpdateWriteOpResult = await this.dbCollection.updateOne(
            { _id: new ObjectId(id) } as FilterQuery<T>,
            { $set: entity } as UpdateQuery<T>,
            {
                upsert: false, // does not insert a new document when no match is found
            } as UpdateOneOptions,
        );
        return res.result.ok === 1;
    }

    // update and get the updated doc
    public async updateAndGet(id: string, entity: T): Promise<T> {
        const res: FindAndModifyWriteOpResultObject<T> = await this.getDbCollection().findOneAndUpdate(
            { _id: new ObjectId(id) } as FilterQuery<T>,
            { $set: entity } as UpdateQuery<T>,
            {
                returnOriginal: false, // When false, returns the updated document rather than the original. The default is true.
                upsert: false,
            } as FindOneAndUpdateOption<T>,
        );

        const result: T = automapper.map(MAPPING_TYPES.MongoDbObjectId, MAPPING_TYPES.TsString, res.value);
        return result as T;
    }

    public aggregate(pipeline: object[]): AggregationCursor<T> {
        return this.dbCollection.aggregate(pipeline);
    }

    public async aggregateOne(pipeline: object[]): Promise<T | null> {
        const cur = this.aggregate(pipeline);
        if (!(await cur.hasNext())) {
            return null;
        }
        return await cur.next();
    }

    public async createIndex(field: any, expiry: number): Promise<boolean> {
        return new Promise<boolean>(async (resolve) => {
            try {
                await this.getDbCollection().dropIndex(field);
            } catch (e) {
                resolve(true);
            }

            this.getDbCollection().createIndex(field, { expireAfterSeconds: expiry }, (err, dbResult) => {
                if (err) throw err;
                resolve(true);
            });
        });
    }

    public async createTextIndex(obj: any): Promise<void> {
        try {
            await Promise.all(Object.keys(obj).map(async (d) => await this.getDbCollection().dropIndex(d) ));
        } catch (e) {
            Promise.resolve();
        }
        
        await this.getDbCollection().createIndex(obj,);
    }
}
