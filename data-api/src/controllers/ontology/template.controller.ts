import { NextFunction } from 'connect';
import { inject } from 'inversify';
import { controller, httpGet } from 'inversify-express-utils';
import { Request, Response } from 'express-serve-static-core';

import { TYPES } from '../../services/config/types';
import { OntoPageService } from '../../services/onto-page.service';
import { logger } from '../../utils/logger';
import { IPageTemplate } from '../../infrastructure/onto-page/page-template.interface';
import { SomethingWentWrong } from '../../exceptions/exception';
import { TemplateService } from '../../services/template.service';
import { IOntoPage, PUBLISH_TYPE } from '../../infrastructure/onto-page/onto-page.interface';
import { OntoPageDto } from '../../infrastructure/onto-page/onto-page.dto';
import { MAPPING_TYPES } from '../../services/config/automapper.config';
import { queryParamValidate } from '../../middleware/validators';
import { OntoPageFilterVm } from '../../infrastructure/onto-page/onto-page-filter.vm';
import { PaginationVm } from '../../infrastructure/pagination.vm';

//
// Un-guarded - only support GET
//

@controller('/template')
export class TemplateController {
    constructor(
        @inject(TYPES.TemplateService) private templateService: TemplateService,
        @inject(TYPES.OntoPageService) private ontologyPageService: OntoPageService,
    ) {}

    @httpGet('/pages', queryParamValidate(OntoPageFilterVm))
    public async getPages(request: Request, response: Response, next: NextFunction): Promise<void> {
        const query: OntoPageFilterVm = request.query as any;
        logger.info(`TemplateController:getPages: query = ${JSON.stringify(query)}`);

        try {
            const result: PaginationVm<IOntoPage> = await this.ontologyPageService.getAllPages(query);

            const resultDto: PaginationVm<OntoPageDto> = {
                data: automapper.map(MAPPING_TYPES.IOntoPage, MAPPING_TYPES.OntoPageDto, result.data),
                page: result.page,
                pageCount: result.pageCount,
                totalCount: result.totalCount,
            } as PaginationVm<OntoPageDto>;

            resultDto.data.sort((d1, d2) => d2.date.getTime() -d1.date.getTime())
            logger.info(`TemplateController:getPages: pageDtos = ${JSON.stringify(resultDto)}`);
            response.status(200).send(resultDto);
        } catch (e) {
            logger.error(`TemplateController:getPages: error = ${JSON.stringify(e)}`);
            next(new SomethingWentWrong(e.message));
        }
    }

    @httpGet('/page/:pageId')
    public async getPageTemplate(request: Request, response: Response, next: NextFunction): Promise<void> {
        const pageId: string = request.params.pageId;
        logger.info(`TemplateController:getPageTemplate: pageId = ${pageId}`);

        try {
            const pageTemplate: IPageTemplate = await this.templateService.buildPageTemplate(pageId);
            logger.info(`TemplateController:getPageTemplate: pageTemplate = ${JSON.stringify(pageTemplate)}`);
            response.status(200).send(pageTemplate);
        } catch (e) {
            logger.error(`TemplateController: getPageTemplate: error = ${JSON.stringify(e)}`);
            next(new SomethingWentWrong(e.message));
        }
    }
}
