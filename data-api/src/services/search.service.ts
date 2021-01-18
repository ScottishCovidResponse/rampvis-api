import { provide } from 'inversify-binding-decorators';
import { inject, unmanaged } from 'inversify';
import config from 'config';

import { SearchClient } from '../infrastructure/db/elasticsearch.connection';
import { TYPES } from './config/types';
import { logger } from '../utils/logger';
import { IndicesPutMappingParams } from 'elasticsearch';

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
            type: '_doc',
            body: body,
        });
    }

    public async update(obj: T) {
        const { _id, ...body } = obj;

        await this.searchClient.update({
            index: this.index,
            id: _id.toString(),
            type: '_doc',
            body: { doc: body, doc_as_upsert: true },
        });
    }

    public async delete(id: string) {
        await this.searchClient.delete({
            index: this.index,
            id: id,
            type: '_doc',
        });
    }

    public async deleteAll() {
        await this.searchClient.indices.delete({
            index: this.index,
        });
    }

    public async _putMapping(mappingProps: any) {
        return await this.searchClient.indices.putMapping({
            index: this.index,
            body: {
                properties: mappingProps,
            },
        } as IndicesPutMappingParams);
    }

    public async _search(dsl: any): Promise<any> {
        return await this.searchClient.search({
            "from" : 0, "size" : 1000,
            index: this.index,
            type: '_doc',
            body: dsl,
        });
    }

    public async _searchAsYouType(dsl: any): Promise<any> {
        console.log('_searchAsYouType dsl = ', dsl, ', index = ', this.index);
        return this.searchClient.search({
            index: this.index,
            body: dsl,
        });
    }

    public async _suggestCompletion(dsl: any): Promise<any> {
        console.log('suggest dsl = ', dsl, ', index = ', this.index);
        return this.searchClient.search({
            index: this.index,
            body: dsl,
        });
    }
}
