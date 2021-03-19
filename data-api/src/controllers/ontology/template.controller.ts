import { NextFunction } from 'connect';
import { inject } from 'inversify';
import { controller, httpGet } from 'inversify-express-utils';
import { Request, Response } from 'express-serve-static-core';

import { TYPES } from '../../services/config/types';
import { OntoPageService } from '../../services/onto-page.service';
import { logger } from '../../utils/logger';
import { SomethingWentWrong } from '../../exceptions/exception';
import { TemplateService } from '../../services/template.service';
import { IOntoPage, BINDING_TYPE } from '../../infrastructure/onto-page/onto-page.interface';
import { OntoPageDto, OntoPageExtDto } from '../../infrastructure/onto-page/onto-page.dto';
import { MAPPING_TYPES } from '../../services/config/automapper.config';
import { queryParamValidate } from '../../middleware/validators';
import { OntoPageFilterVm } from '../../infrastructure/onto-page/onto-page-filter.vm';
import { PaginationVm } from '../../infrastructure/pagination.vm';
import { BindingDto, BindingExtDto } from '../../infrastructure/onto-page/binding.dto';
import { OntoVisDto } from '../../infrastructure/onto-vis/onto-vis.dto';
import { IOntoVis } from '../../infrastructure/onto-vis/onto-vis.interface';
import { OntoDataDto } from '../../infrastructure/onto-data/onto-data.dto';
import { IOntoData } from '../../infrastructure/onto-data/onto-data.interface';
import { OntoDataService } from '../../services/onto-data.service';
import { OntoVisService } from '../../services/onto-vis.service';

//
// Un-guarded - only support GET
//

@controller('/template')
export class TemplateController {
    constructor(
        @inject(TYPES.TemplateService) private templateService: TemplateService,
        @inject(TYPES.OntoVisService) private ontoVisService: OntoVisService,
        @inject(TYPES.OntoDataService) private ontoDataService: OntoDataService,
        @inject(TYPES.OntoPageService) private ontoPageService: OntoPageService,
    ) {}

    @httpGet('/pages', queryParamValidate(OntoPageFilterVm))
    public async getPages(request: Request, response: Response, next: NextFunction): Promise<void> {
        const query: OntoPageFilterVm = request.query as any;
        logger.info(`TemplateController:getPages: query = ${JSON.stringify(query)}`);

        try {
            const result: PaginationVm<IOntoPage> = await this.ontoPageService.getPaginated(query);

            const resultDto: PaginationVm<OntoPageDto> = {
                data: automapper.map(MAPPING_TYPES.IOntoPage, MAPPING_TYPES.OntoPageDto, result.data),
                page: result.page,
                pageCount: result.pageCount,
                totalCount: result.totalCount,
            } as PaginationVm<OntoPageDto>;

            resultDto.data.sort((d1, d2) => d2.date.getTime() -d1.date.getTime())
            // logger.info(`TemplateController:getPages: pageDtos = ${JSON.stringify(resultDto)}`);
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

        // Get all pages
        const ontoPage: IOntoPage = await this.ontoPageService.get(pageId);

        // IOntoPage -> OntoPageDto
        const ontoPageDto: OntoPageDto = automapper.map(MAPPING_TYPES.IOntoPage, MAPPING_TYPES.OntoPageDto, ontoPage);

        // OntoPageDto -> OntoPageExtDto
        let bindingExts: BindingExtDto[] = await this.bindingDtoToBindingExtDto(ontoPageDto.bindings);
        let ontoPageExtDto: any = { ...ontoPageDto, bindings: bindingExts };

        try {
            logger.info(`TemplateController:getPageTemplate: ontoPageExtDto = ${JSON.stringify(ontoPageExtDto)}`);
            response.status(200).send(ontoPageExtDto);
        } catch (e) {
            logger.error(`TemplateController: getPageTemplate: error = ${JSON.stringify(e)}`);
            next(new SomethingWentWrong(e.message));
        }
    }

    private async bindingDtoToBindingExtDto(bindings: BindingDto[]) {
        let bindingExts: BindingExtDto[] = [];

        for (let d of bindings) {
            const ontoVis: IOntoVis = await this.ontoVisService.get(d.visId);
            const ontoVisDto: OntoVisDto = automapper.map(MAPPING_TYPES.IOntoVis, MAPPING_TYPES.OntoVisDto, ontoVis);

            let ontoDataDtos: OntoDataDto[] = [];
            for (let dataId of d.dataIds) {
                const ontoData: IOntoData = await this.ontoDataService.get(dataId);
                let ontoDataDto: OntoDataDto = automapper.map(MAPPING_TYPES.IOntoData, MAPPING_TYPES.OntoDataDto, ontoData);
                ontoDataDtos.push(ontoDataDto);
            }

            bindingExts.push({ vis: ontoVisDto, data: ontoDataDtos } as BindingExtDto);
        }

        return bindingExts;
    }
}
