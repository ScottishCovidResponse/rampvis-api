import { NextFunction } from 'connect';
import { inject } from 'inversify';
import { controller, httpGet } from 'inversify-express-utils';
import { Request, Response } from 'express-serve-static-core';

import { TYPES } from '../services/config/types';
import { OntoPageService } from '../services/onto-page.service';
import { logger } from '../utils/logger';
import { SearchError, SomethingWentWrong } from '../exceptions/exception';
import { IOntoPage, PAGE_TYPE } from '../infrastructure/onto-page/onto-page.interface';
import { OntoPageDto, OntoPageExtDto } from '../infrastructure/onto-page/onto-page.dto';
import { MAPPING_TYPES } from '../services/config/automapper.config';
import { queryParamValidate } from '../middleware/validators';
import { OntoPageFilterVm } from '../infrastructure/onto-page/onto-page-filter.vm';
import { PaginationVm } from '../infrastructure/pagination.vm';
import { OntoDataService } from '../services/onto-data.service';
import { OntoVisService } from '../services/onto-vis.service';
import { OntoPageSearchService } from '../services/onto-page-search.service';
import { OntoPageSearchFilterVm } from '../infrastructure/onto-page/onto-page-search-filter.vm';
import { IOntoPageSearch } from '../infrastructure/onto-page/onto-page-search.interface';
import { OntoPageSearchDto } from '../infrastructure/onto-page/onto-page-search.dto';
import { VIS_TYPE } from '../infrastructure/onto-vis/onto-vis-type.enum';
import generateTitle from '../utils/title-generation';
import { ThumbnailService } from '../services/thumbnail.service';
import { IThumbnail } from '../infrastructure/thumbnail/thumbnail.interface';
import { ThumbnailDto } from '../infrastructure/thumbnail/thumbnail.dto';

//
// Un-guarded: to only support GET
//

@controller('/template')
export class TemplateController {
    constructor(
        @inject(TYPES.OntoVisService) private ontoVisService: OntoVisService,
        @inject(TYPES.OntoDataService) private ontoDataService: OntoDataService,
        @inject(TYPES.OntoPageService) private ontoPageService: OntoPageService,
        @inject(TYPES.OntoPageSearchService) private ontoPageSearchService: OntoPageSearchService,
        @inject(TYPES.ThumbnailService) private thumbnailService: ThumbnailService
    ) {}

    @httpGet('/pages/search/', queryParamValidate(OntoPageSearchFilterVm))
    public async search(request: Request, response: Response, next: NextFunction): Promise<void> {
        const ontPageSearchFilterVm: OntoPageSearchFilterVm = request.query as any;
        logger.info(`OntoPageController:search: ontPageSearchFilterVm = ${JSON.stringify(ontPageSearchFilterVm)}`);

        try {
            let ontoPageSearchList: IOntoPageSearch[] = await this.ontoPageSearchService.search(ontPageSearchFilterVm);
            // const resultDto: PaginationVm<OntoDataDto> = {
            //     data: automapper.map(MAPPING_TYPES.IOntoDataSearch, MAPPING_TYPES.OntoDataSearchDto, result.data),
            //     page: result.page,
            //     pageCount: result.pageCount,
            //     totalCount: result.totalCount,
            // };

            let ontoPageSearchDtos: OntoPageSearchDto[] = automapper.map(
                MAPPING_TYPES.IOntoPageSearch,
                MAPPING_TYPES.OntoPageSearchDto,
                ontoPageSearchList
            );
            ontoPageSearchDtos = ontoPageSearchDtos.map((d: OntoPageSearchDto) => {
                console.log('id = ', d.id, 'keywords = ', d.keywords);
                return { ...d, title: generateTitle([d.keywords]) };
            });
            // logger.info(`OntoPageController:search: ontoPageSearchDtos = ${JSON.stringify(ontoPageSearchDto)}`);
            response.status(200).send(ontoPageSearchDtos);
        } catch (e: any) {
            logger.error(`OntoPageController:search: error = ${JSON.stringify(e)}`);
            next(new SearchError(e.message));
        }
    }

    @httpGet('/pages/:pageType/', queryParamValidate(OntoPageFilterVm))
    @httpGet('/pages/:pageType/:visType/', queryParamValidate(OntoPageFilterVm))
    public async getPages(request: Request, response: Response, next: NextFunction): Promise<void> {
        // TODO: Review the onto-page.controller.ts
        const pageType: PAGE_TYPE = request.params.pageType as any;
        const visType: VIS_TYPE = request.params.visType as any;
        const ontoPageFilterVm: OntoPageFilterVm = request.query as any;
        // prettier-ignore
        logger.info(`TemplateController:getPages: pageType=${pageType}, visType=${visType}, ontoPageFilterVm=${JSON.stringify(ontoPageFilterVm)}`);

        try {
            const result: PaginationVm<IOntoPage> = await this.ontoPageService.getPaginated(
                pageType,
                visType,
                ontoPageFilterVm
            );
            const ontoPageDtos: OntoPageDto[] = automapper.map(
                MAPPING_TYPES.IOntoPage,
                MAPPING_TYPES.OntoPageDto,
                result.data
            );
            const ontoPageExtDtos: OntoPageExtDto[] = [];

            for (let ontoPageDto of ontoPageDtos) {
                const data = await this.ontoDataService.getOntoDataDtos(ontoPageDto.dataIds);
                const keywordsList = Object.values(data).map((d) => d.keywords);
                const title = generateTitle(keywordsList);
                ontoPageExtDtos.push({
                    ...ontoPageDto,
                    vis: await this.ontoVisService.getOntoVisDto(ontoPageDto.visId),
                    data: data,
                    title: title,
                });
            }

            const resultDto: PaginationVm<OntoPageExtDto> = { ...result, data: ontoPageExtDtos };
            resultDto.data.sort((d1, d2) => d2.date.getTime() - d1.date.getTime());
            // logger.info(`TemplateController:getPages: pageDtos = ${JSON.stringify(resultDto.data.length)}`);

            response.status(200).send(resultDto);
        } catch (e: any) {
            logger.error(`TemplateController:getPages: error = ${JSON.stringify(e)}`);
            next(new SomethingWentWrong(e.message));
        }
    }

    // TODO: Duplicated in onto-page.controller.ts
    @httpGet('/page/:pageId')
    public async getPageTemplate(request: Request, response: Response, next: NextFunction): Promise<void> {
        const pageId: string = request.params.pageId;
        logger.info(`TemplateController:getPageTemplate: pageId = ${pageId}`);

        try {
            const ontoPage: IOntoPage = await this.ontoPageService.get(pageId);
            const ontoPageDto: OntoPageDto = automapper.map(
                MAPPING_TYPES.IOntoPage,
                MAPPING_TYPES.OntoPageDto,
                ontoPage
            );
            const data = await this.ontoDataService.getOntoDataDtos(ontoPageDto.dataIds);
            const keywordsList = Object.values(data).map((d) => d.keywords);
            console.log('keywords = ', keywordsList);

            const title = generateTitle(keywordsList);

            const ontoPageExtDto: OntoPageExtDto = {
                ...ontoPageDto,
                vis: await this.ontoVisService.getOntoVisDto(ontoPageDto.visId),
                data: data,
                title: title,
            };
            logger.info(`TemplateController:getPageTemplate: ontoPageExtDto = ${JSON.stringify(ontoPageExtDto)}`);

            response.status(200).send(ontoPageExtDto);
        } catch (e: any) {
            logger.error(`TemplateController: getPageTemplate: error = ${JSON.stringify(e)}`);
            next(new SomethingWentWrong(e.message));
        }
    }

    @httpGet('/thumbnail/:pageId')
    public async getThumbnail(request: Request, response: Response, next: NextFunction): Promise<void> {
        const pageId = request.params.pageId;
        logger.debug(`TemplateController: getThumbnail: pageId = ${pageId}`);
        try {
            const result: IThumbnail = await this.thumbnailService.getThumbnail(pageId);
            const resultDto: ThumbnailDto = automapper.map(
                MAPPING_TYPES.IThumbnail,
                MAPPING_TYPES.ThumbnailDto,
                result
            );
            logger.debug(`TemplateController: getThumbnail: resultDto = ${result}`);

            // const fs = require('fs');
            // let buffer = Buffer.from(result.thumbnail, 'base64');
            // fs.writeFileSync('new-path.jpeg', buffer);

            response.status(200).send(result.thumbnail);
        } catch (error: any) {
            next(new SomethingWentWrong(error.message));
        }
    }
}
