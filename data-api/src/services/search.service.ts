import { provide } from 'inversify-binding-decorators';
import { inject, unmanaged } from 'inversify';
import config from 'config';

import { SearchClient } from '../infrastructure/db/elasticsearch.connection';
import { TYPES } from './config/types';
import { logger } from '../utils/logger';

@provide(TYPES.SearchService)
export abstract class SearchService<T extends { _id: any }> {
    public constructor(
        @inject(TYPES.SearchClient) private searchClient: SearchClient, 
        @unmanaged() private index: string,
    ) {}

    public async createIndexes(): Promise<void> {
        try {
            if (!(await this.checkIndexExists(this.index))) {
                await this.createIndex(this.index);
                logger.info(`SearchService: createIndexes: ${this.index}, created`);
            } else {
                logger.info(`SearchService: createIndexes: ${this.index}, already exists`);
            }
        } catch (e) {
            logger.error(`SearchService: createIndexes: error = ${JSON.stringify(e)}`);
        }
    }

    private async checkIndexExists(name: string) {
        return this.searchClient.indices.exists({
            index: name,
        });
    }

    private async createIndex(name: string) {
        return this.searchClient.indices.create({
            index: name,
        });
    }

    public async create(obj: T) {
        const { _id, ...body } = obj;

        return this.searchClient.index({
            index: this.index,
            id: _id.toString(),
            type: this.index + 'type',
            body: body,
        });
    }

    public async update(obj: T) {
        const { _id, ...body } = obj;

        await this.searchClient.update({
            index: this.index,
            id: _id.toString(),
            type: this.index + 'type',
            body: { doc: body, doc_as_upsert: true},
        });
    }

    public async delete(id: string) {
        await this.searchClient.delete({
            index: this.index,
            id: id,
            type: this.index + 'type',
        });
    }

    public async deleteAll() {
        await this.searchClient.indices.delete({
            index: this.index
        });
    }
}
