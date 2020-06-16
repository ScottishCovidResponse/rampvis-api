import {inject, injectable, unmanaged} from 'inversify';
import {
    AggregationCursor,
    Collection,
    FilterQuery,
    FindAndModifyWriteOpResultObject,
    FindOneAndUpdateOption, FindOneOptions,
    ObjectId,
    UpdateOneOptions,
    UpdateQuery,
    UpdateWriteOpResult,
} from 'mongodb';

import { DbClient } from '../infrastructure/db/mongodb.connection';
import { MAPPING_TYPES } from './config/automapper.config';
import { TYPES } from './config/types';
import { IService } from './service.interface';

@injectable()
export abstract class DataService<T extends { _id: any }> implements IService<T> {
    private readonly db: Collection<T>;
    private readonly dbName: string;
    private readonly collectionName: string;


    public constructor(
        @inject(TYPES.DbClient) dbClient: DbClient,
        @unmanaged() dbName: string,
        @unmanaged() collectionName: string,
    ) {
        this.dbName = dbName;
        this.collectionName = collectionName;
        this.db = dbClient.db(this.dbName).collection<T>(this.collectionName);
    }


    public getCollection(): Collection<T> {
        return this.db;
    }


    // TODO id? query?
    public async get(id: string | FilterQuery<T>): Promise<T> {

        let doc: T;     // typeof _id = ObjectId
        let result: T;  // typeof _id = string

        if (typeof id === 'string') {
            doc = await this.db.findOne({_id: new ObjectId(id)} as FilterQuery<T>) as T;
        } else if (typeof id === 'object') {
            doc = await this.db.findOne(id as FilterQuery<T>) as T;
        } else {
            return null as any;
        }

        result = automapper.map(MAPPING_TYPES.MongoDbObjectId, MAPPING_TYPES.TsString, doc);
        return result;
    }


    public async getAll(query: FilterQuery<T> = {}, options: FindOneOptions = {}): Promise<T[]> {
        const docs: any[] = await this.db.find(query, options).toArray();
        const results: T[] = automapper.map(MAPPING_TYPES.MongoDbObjectId, MAPPING_TYPES.TsString, docs);
        return results;
    }

    // Get latest numDocs number of document from a collection passing the query
    public async getLatest(query: FilterQuery<T> = {}, numDocs: number = 1): Promise<T> {
        // Auto created _id field it has a date embedded in it (_id: 1) or use natural order ($natural: 1)
        // 1 will sort ascending (oldest to newest) and -1 will sort descending (newest to oldest.)
        const docs: any[] = await this.db.find(query).sort({$natural: -1}).limit(numDocs).toArray();
        const result: T = automapper.map(MAPPING_TYPES.MongoDbObjectId, MAPPING_TYPES.TsString, docs)[0];
        return result;
    }

    // get or create and get object
    public async getOrCreate(query: FilterQuery<T> = {}, entity: T): Promise<T> {
        const res: FindAndModifyWriteOpResultObject<T> = await this.getCollection().findOneAndUpdate(
            query,
            { $setOnInsert: entity } as UpdateQuery<T>,
            {
                upsert: true,
                returnOriginal: false,  // When false, returns the updated document rather than the original. The default is true.
            } as FindOneAndUpdateOption,
        );

        const result: T = automapper.map(MAPPING_TYPES.MongoDbObjectId, MAPPING_TYPES.TsString, res.value);
        return result as T;
    }


    public async save(entity: T): Promise<T> {
        const res = await this.db.insertOne(entity as any);
        const result: T = automapper.map(MAPPING_TYPES.MongoDbObjectId, MAPPING_TYPES.TsString, res.ops[0]);
        return result;
    }


    public async delete(id: string): Promise<T> {
        const res: FindAndModifyWriteOpResultObject<T> = await this.db.findOneAndDelete({_id: new ObjectId(id)} as FilterQuery<T>);
        const result: T = automapper.map(MAPPING_TYPES.MongoDbObjectId, MAPPING_TYPES.TsString, res.value);
        return result;
    }


    // update and get update status
    public async update(id: string, entity: T): Promise<boolean> {
        const res: UpdateWriteOpResult = await this.db.updateOne(
            {_id: new ObjectId(id)} as FilterQuery<T>,
            {$set: entity} as UpdateQuery<T>,
            {
                upsert: false, // does not insert a new document when no match is found
            } as UpdateOneOptions,
        );
        return res.result.ok === 1;
    }


    // update and get the updated doc
    public async updateAndGet(id: string, entity: T): Promise<T> {
        const res: FindAndModifyWriteOpResultObject<T> = await this.getCollection().findOneAndUpdate(
            { _id: new ObjectId(id) } as FilterQuery<T>,
            { $set: entity} as UpdateQuery<T>,
            {
                upsert: false,
                returnOriginal: false,  // When false, returns the updated document rather than the original. The default is true.
            } as FindOneAndUpdateOption,
        );

        const result: T = automapper.map(MAPPING_TYPES.MongoDbObjectId, MAPPING_TYPES.TsString, res.value);
        return result as T;
    }


    public aggregate(pipeline: object[]): AggregationCursor<T> {
        return this.db.aggregate(pipeline);
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
                await this.getCollection().dropIndex(field);
            } catch (e) {
                //
            }

            this.getCollection().createIndex(field, {expireAfterSeconds: expiry},
                (err, dbResult) => {
                    if (err) { throw err; }
                    resolve(true);
                });
        });
    }

}
