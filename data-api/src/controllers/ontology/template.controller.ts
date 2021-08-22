import { NextFunction } from 'connect';
import { inject } from 'inversify';
import { controller, httpGet } from 'inversify-express-utils';
import { Request, Response } from 'express-serve-static-core';

import { TYPES } from '../../services/config/types';
import { OntoPageService } from '../../services/onto-page.service';
import { logger } from '../../utils/logger';
import { SomethingWentWrong } from '../../exceptions/exception';
import { IOntoPage } from '../../infrastructure/onto-page/onto-page.interface';
import { OntoPageDto, OntoPageExtDto } from '../../infrastructure/onto-page/onto-page.dto';
import { MAPPING_TYPES } from '../../services/config/automapper.config';
import { queryParamValidate } from '../../middleware/validators';
import { OntoPageFilterVm } from '../../infrastructure/onto-page/onto-page-filter.vm';
import { PaginationVm } from '../../infrastructure/pagination.vm';
import { OntoDataService } from '../../services/onto-data.service';
import { OntoVisService } from '../../services/onto-vis.service';

//
// Un-guarded - only support GET
//

@controller('/template')
export class TemplateController {
    constructor(
        @inject(TYPES.OntoVisService) private ontoVisService: OntoVisService,
        @inject(TYPES.OntoDataService) private ontoDataService: OntoDataService,
        @inject(TYPES.OntoPageService) private ontoPageService: OntoPageService,
    ) {}


    @httpGet('/pages', queryParamValidate(OntoPageFilterVm))
    public async getPages(request: Request, response: Response, next: NextFunction): Promise<void> {
        // TODO: Duplicated in onto-page.controller.ts

        const query: OntoPageFilterVm = request.query as any;
        logger.info(`TemplateController:getPages: query = ${JSON.stringify(query)}`);

        try {
            const result: PaginationVm<IOntoPage> = await this.ontoPageService.getPaginated(query);
            const ontoPageDtos: OntoPageDto[] = automapper.map( MAPPING_TYPES.IOntoPage, MAPPING_TYPES.OntoPageDto, result.data );
            const ontoPageExtDtos: OntoPageExtDto[] = [];
            for (let ontoPageDto of ontoPageDtos) {
                ontoPageExtDtos.push({
                    ...ontoPageDto,
                    vis: await this.ontoVisService.getOntoVisDto(ontoPageDto.visId),
                    data: await this.ontoDataService.getOntoDataDtos(ontoPageDto.dataIds)
                });
            }

            const resultDto: PaginationVm<OntoPageExtDto> = { ...result, data: ontoPageExtDtos, };
            resultDto.data.sort((d1, d2) => d2.date.getTime() -d1.date.getTime())
            logger.info(`TemplateController:getPages: pageDtos = ${JSON.stringify(resultDto)}`);

            response.status(200).send(resultDto);
        } catch (e) {
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
            const ontoPageDto: OntoPageDto = automapper.map(MAPPING_TYPES.IOntoPage, MAPPING_TYPES.OntoPageDto, ontoPage);
            const ontoPageExtDto: OntoPageExtDto = {
                ...ontoPageDto,
                vis: await this.ontoVisService.getOntoVisDto(ontoPageDto.visId),
                data: await this.ontoDataService.getOntoDataDtos(ontoPageDto.dataIds)
            };
            logger.info(`TemplateController:getPageTemplate: ontoPageExtDto = ${JSON.stringify(ontoPageExtDto)}`);

            response.status(200).send(ontoPageExtDto);
        } catch (e) {
            logger.error(`TemplateController: getPageTemplate: error = ${JSON.stringify(e)}`);
            next(new SomethingWentWrong(e.message));
        }
    }

}
