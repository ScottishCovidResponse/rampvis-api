import { NextFunction } from 'connect';
import { inject } from 'inversify';
import { controller, httpGet } from 'inversify-express-utils';
import { Request, Response } from 'express-serve-static-core';

import { TYPES } from '../../services/config/types';
import { OntologyPageService } from '../../services/ontology-page.service';
import { logger } from '../../utils/logger';
import { IPageTemplate } from '../../infrastructure/onto-page/page-template.interface';
import { SomethingWentWrong } from '../../exceptions/exception';
import { TemplateService } from '../../services/template.service';
import { IOntoPage } from '../../infrastructure/onto-page/onto-page.interface';
import { OntoPageDto } from '../../infrastructure/onto-page/onto-page.dto';
import { MAPPING_TYPES } from '../../services/config/automapper.config';

@controller('/template')
export class TemplateController {
    constructor(
        @inject(TYPES.TemplateService) private templateService: TemplateService,
        @inject(TYPES.OntologyPageService) private ontologyPageService: OntologyPageService,
    ) {}

    @httpGet('/pages')
    public async getPageTemplates(request: Request, response: Response, next: NextFunction): Promise<void> {
        try {
            const ontoPages: IOntoPage[] = await this.ontologyPageService.getAll();
            const pageDtos: OntoPageDto[] = automapper.map(MAPPING_TYPES.IOntoPage, MAPPING_TYPES.OntoPageDto, ontoPages);
            logger.info(`TemplateController:getPageTemplates: pageDtos = ${JSON.stringify(pageDtos)}`);
            response.status(200).send(pageDtos);
        } catch (e) {
            logger.error(`TemplateController:getPageTemplates: error = ${JSON.stringify(e)}`);
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
