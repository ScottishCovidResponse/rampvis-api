import { NextFunction } from 'connect';
import { Request, Response } from 'express-serve-static-core';
import { controller, httpDelete, httpGet, httpPost, httpPut } from 'inversify-express-utils';
import { inject } from 'inversify';

import { logger } from '../../utils/logger';
import { TYPES } from '../../services/config/types';
import { queryParamValidate, vmValidate } from '../../middleware/validators';
import { JwtToken } from '../../middleware/jwt.token';
import { MAPPING_TYPES } from '../../services/config/automapper.config';
import { OntoPageVm } from '../../infrastructure/onto-page/onto-page.vm';
import { OntoPageService } from '../../services/onto-page.service';
import { IOntoPage } from '../../infrastructure/onto-page/onto-page.interface';
import { SomethingWentWrong } from '../../exceptions/exception';
import { BindingExtDto, OntoPageDto, OntoPageExtDto } from '../../infrastructure/onto-page/onto-page.dto';
import { OntoPageFilterVm } from '../../infrastructure/onto-page/onto-page-filter.vm';
import { PaginationVm } from '../../infrastructure/pagination.vm';
import { OntoVisService } from '../../services/onto-vis.service';
import { OntoDataService } from '../../services/onto-data.service';
import { IOntoVis } from '../../infrastructure/onto-vis/onto-vis.interface';
import { OntoVisDto } from '../../infrastructure/onto-vis/onto-vis.dto';
import { IOntoData } from '../../infrastructure/onto-data/onto-data.interface';
import { OntoDataDto } from '../../infrastructure/onto-data/onto-data.dto';

@controller('/ontology', JwtToken.verify)
export class OntoPageController {
    constructor(
        @inject(TYPES.OntoPageService) private ontoPageService: OntoPageService,
        @inject(TYPES.OntoVisService) private ontoVisService: OntoVisService,
        @inject(TYPES.OntoDataService) private ontoDataService: OntoDataService
    ) {}

    @httpGet('/pages', queryParamValidate(OntoPageFilterVm))
    public async getPages(request: Request, response: Response, next: NextFunction): Promise<void> {
        const query: OntoPageFilterVm = request.query as any;
        logger.info(`OntoPageController:getPages: query = ${JSON.stringify(query)}`);

        try {
            const result: PaginationVm<IOntoPage> = await this.ontoPageService.getAllPages(query);

            const resultDto: PaginationVm<OntoPageDto> = {
                data: automapper.map(MAPPING_TYPES.IOntoPage, MAPPING_TYPES.OntoPageDto, result.data),
                page: result.page,
                pageCount: result.pageCount,
                totalCount: result.totalCount,
            };
            logger.info(`OntoPageController:getPages: pageDtos = ${JSON.stringify(resultDto)}`);
            response.status(200).send(resultDto);
        } catch (e) {
            logger.error(`OntoPageController:getPages: error = ${JSON.stringify(e)}`);
            next(new SomethingWentWrong(e.message));
        }
    }

    @httpPost('/page', vmValidate(OntoPageVm))
    public async createPage(request: Request, response: Response, next: NextFunction): Promise<void> {
        const ontoPageVm: OntoPageVm = request.body as any;
        logger.info(`OntoPageController:createPage: dataVm = ${JSON.stringify(ontoPageVm)}`);

        try {
            const ontoPage: IOntoPage = await this.ontoPageService.createPage(ontoPageVm);
            const ontoPageDto: OntoPageDto = automapper.map(MAPPING_TYPES.IOntoPage, MAPPING_TYPES.OntoPageDto, ontoPage);
            logger.info(`OntoPageController:createPage: ontoPageDto = ${JSON.stringify(ontoPageDto)}`);
            response.status(200).send(ontoPageDto);
        } catch (e) {
            logger.error(`OntoPageController:createPage: error = ${JSON.stringify(e)}`);
            next(new SomethingWentWrong(e.message));
        }
    }

    @httpPut('/page/:pageId', vmValidate(OntoPageVm))
    public async updatePage(request: Request, response: Response, next: NextFunction): Promise<void> {
        const pageId: string = request.params.pageId;
        const ontoPageVm: OntoPageVm = request.body as any;
        logger.info(`OntoPageController:updatePage: pageId = ${pageId}, ontoPageVm = ${JSON.stringify(ontoPageVm)}`);

        try {
            const ontoPage: IOntoPage = await this.ontoPageService.updatePage(pageId, ontoPageVm);
            const ontoPageDto: OntoPageDto = automapper.map(MAPPING_TYPES.IOntoPage, MAPPING_TYPES.OntoPageDto, ontoPage);
            logger.info(`OntoPageController:updatePage: ontoPageDto = ${JSON.stringify(ontoPageDto)}`);
            response.status(200).send(ontoPageDto);
        } catch (e) {
            logger.error(`OntoPageController:updatePage: error = ${JSON.stringify(e)}`);
            next(new SomethingWentWrong(e.message));
        }
    }

    @httpDelete('/page/:pageId')
    public async deletePage(request: Request, response: Response, next: NextFunction): Promise<void> {
        const pageId: string = request.params.pageId;
        logger.info(`OntoPageController:deletePage: pageId = ${pageId}`);

        try {
            const ontoPage: IOntoPage = await this.ontoPageService.delete(pageId);
            const ontoPageDto: OntoPageDto = automapper.map(MAPPING_TYPES.IOntoPage, MAPPING_TYPES.OntoPageDto, ontoPage);
            logger.info(`OntoPageController:deletePage: ontoPageDto = ${JSON.stringify(ontoPageDto)}`);
            response.status(200).send(ontoPageDto);
        } catch (e) {
            logger.error(`OntoPageController:deletePage: error = ${JSON.stringify(e)}`);
            next(new SomethingWentWrong(e.message));
        }
    }

    @httpGet('/page/:pageId')
    public async getOntoPageExt(request: Request, response: Response, next: NextFunction): Promise<void> {
        const pageId: string = request.params.pageId;
        logger.info(`OntoPageController:getOntoPageExt: pageId = ${JSON.stringify(pageId)}`);

        try {
            const ontoPage: IOntoPage = await this.ontoPageService.get(pageId);
            const ontoPageDto: OntoPageDto = automapper.map(MAPPING_TYPES.IOntoPage, MAPPING_TYPES.OntoPageDto, ontoPage);

            let bindingExts: BindingExtDto[] = [];

            for (let d of ontoPageDto.bindings) {
                const ontoVis: IOntoVis = await this.ontoVisService.get(d.visId);
                const ontoVisDto: OntoVisDto = automapper.map(MAPPING_TYPES.IOntoVis, MAPPING_TYPES.OntoVisDto, ontoVis);

                let ontoDataDtos: OntoDataDto[] = [];
                for (let dataId of d.dataIds) {
                    const ontoData: IOntoData = await this.ontoDataService.get(dataId);
                    let ontoDataDto: OntoDataDto = automapper.map(MAPPING_TYPES.IOntoData, MAPPING_TYPES.OntoDataDto, ontoData);
                    ontoDataDtos.push(ontoDataDto);
                }

                bindingExts.push( {vis:  ontoVisDto, data: ontoDataDtos } as BindingExtDto);
            }

            const ontoPageExtDto: OntoPageExtDto = { ...ontoPageDto, bindingExts: bindingExts };
            logger.info(`OntoPageController:getOntoPageExt: ontoPageExtDto = ${JSON.stringify(ontoPageExtDto)}`);
            response.status(200).send(ontoPageExtDto);
        } catch (e) {
            logger.error(`OntoPageController:getBindings: error = ${JSON.stringify(e)}`);
            next(new SomethingWentWrong(e.message));
        }
    }
}
