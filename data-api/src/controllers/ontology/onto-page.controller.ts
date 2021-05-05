import { NextFunction } from 'connect';
import { Request, Response } from 'express-serve-static-core';
import { controller, httpDelete, httpGet, httpPost, httpPut } from 'inversify-express-utils';
import { inject } from 'inversify';
import * as _ from 'lodash';

import { logger } from '../../utils/logger';
import { TYPES } from '../../services/config/types';
import { queryParamValidate, vmValidate } from '../../middleware/validators';
import { JwtToken } from '../../middleware/jwt.token';
import { MAPPING_TYPES } from '../../services/config/automapper.config';
import { OntoPageVm } from '../../infrastructure/onto-page/onto-page.vm';
import { OntoPageService } from '../../services/onto-page.service';
import { IOntoPage } from '../../infrastructure/onto-page/onto-page.interface';
import { SearchError, SomethingWentWrong } from '../../exceptions/exception';
import { OntoPageDto, OntoPageExtDto } from '../../infrastructure/onto-page/onto-page.dto';
import { OntoPageFilterVm } from '../../infrastructure/onto-page/onto-page-filter.vm';
import { PaginationVm } from '../../infrastructure/pagination.vm';
import { OntoVisService } from '../../services/onto-vis.service';
import { OntoDataService } from '../../services/onto-data.service';
import { IOntoVis } from '../../infrastructure/onto-vis/onto-vis.interface';
import { OntoVisDto } from '../../infrastructure/onto-vis/onto-vis.dto';
import { IOntoData } from '../../infrastructure/onto-data/onto-data.interface';
import { OntoDataDto } from '../../infrastructure/onto-data/onto-data.dto';
import { BindingDto, BindingExtDto } from '../../infrastructure/onto-page/binding.dto';
import { OntoPageExtSearchGroupDto } from '../../infrastructure/onto-page/onto-page-search-group.dto';
import { ActivityService } from '../../services/activity.service';
import { IUser } from '../../infrastructure/user/user.interface';
import { ACTIVITY_TYPE, ACTIVITY_ACTION } from '../../infrastructure/activity/activity.interface';
import { UpdateOntoPageDataVm } from '../../infrastructure/onto-page/update-onto-page-data.vm';


@controller('/ontology', JwtToken.verify)
export class OntoPageController {
    constructor(
        @inject(TYPES.ActivityService) private activityService: ActivityService,
        @inject(TYPES.OntoPageService) private ontoPageService: OntoPageService,
        @inject(TYPES.OntoVisService) private ontoVisService: OntoVisService,
        @inject(TYPES.OntoDataService) private ontoDataService: OntoDataService
    ) {}

    @httpGet('/pages', queryParamValidate(OntoPageFilterVm))
    public async getPages(request: Request, response: Response, next: NextFunction): Promise<void> {
        const ontoPageFilterVm: OntoPageFilterVm = request.query as any;
        logger.info(`OntoPageController:getPages: OntoPageFilterVm = ${JSON.stringify(ontoPageFilterVm)}`);

        try {
            const result: PaginationVm<IOntoPage> = await this.ontoPageService.getPaginated(ontoPageFilterVm);
            const ontoPageDtos: OntoPageDto[] = automapper.map( MAPPING_TYPES.IOntoPage, MAPPING_TYPES.OntoPageDto, result.data );
            const ontoPageExtDtos: OntoPageExtDto[] = [];

            for (let ontoPageDto of ontoPageDtos) {
                let bindingExts: BindingExtDto[] = await this.bindingDtoToBindingExtDto(ontoPageDto.bindings);
                ontoPageExtDtos.push({...ontoPageDto, bindingExts});
            }

            const resultDto: PaginationVm<OntoPageExtDto> = { ...result, data: ontoPageExtDtos, };

            // logger.info(`OntoPageController:getPages: pageDtos = ${JSON.stringify(resultDto)}`);
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
            const ontoPage: any = await this.ontoPageService.createPage(ontoPageVm);
            const ontoPageDto: OntoPageDto = automapper.map(MAPPING_TYPES.IOntoPage, MAPPING_TYPES.OntoPageDto, ontoPage);

            const user = request.user as IUser
            await this.activityService.createActivity(
                user,
                ACTIVITY_TYPE.ONTO_PAGE,
                ACTIVITY_ACTION.CREATE,
                user._id.toString()
            );

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

            const user = request.user as IUser
            await this.activityService.createActivity(
                user,
                ACTIVITY_TYPE.ONTO_PAGE,
                ACTIVITY_ACTION.UPDATE,
                user._id.toString()
            );

            logger.info(`OntoPageController:updatePage: ontoPageDto = ${JSON.stringify(ontoPageDto)}`);
            response.status(200).send(ontoPageDto);
        } catch (e) {
            logger.error(`OntoPageController:updatePage: error = ${JSON.stringify(e)}`);
            next(new SomethingWentWrong(e.message));
        }
    }

    @httpPut('/page/:pageId/data', vmValidate(UpdateOntoPageDataVm))
    public async updatePageData(request: Request, response: Response, next: NextFunction): Promise<void> {
        const pageId: string = request.params.pageId;
        const updateOntoPageDataVm: UpdateOntoPageDataVm = request.body as any;
        logger.info(`OntoPageController:updatePageData: pageId = ${pageId}, dataIds = ${JSON.stringify(updateOntoPageDataVm)}`);

        try {
            const res: any = await this.ontoPageService.updatePageData(pageId, updateOntoPageDataVm);

            const user = request.user as IUser
            await this.activityService.createActivity(
                user,
                ACTIVITY_TYPE.ONTO_PAGE,
                ACTIVITY_ACTION.UPDATE,
                user._id.toString()
            );

            logger.info(`OntoPageController:updatePageData: ontoPageDto = ${JSON.stringify(res)}`);
            response.status(200).send(res);
        } catch (e) {
            logger.error(`OntoPageController:updatePageData: error = ${JSON.stringify(e)}`);
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

            const user = request.user as IUser
            await this.activityService.createActivity(
                user,
                ACTIVITY_TYPE.ONTO_PAGE,
                ACTIVITY_ACTION.DELETE,
                user._id.toString()
            );

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

            let bindingExts: BindingExtDto[] = await this.bindingDtoToBindingExtDto(ontoPageDto.bindings);

            const ontoPageExtDto: OntoPageExtDto = { ...ontoPageDto, bindingExts: bindingExts };
            logger.info(`OntoPageController:getOntoPageExt: ontoPageExtDto = ${JSON.stringify(ontoPageExtDto)}`);
            response.status(200).send(ontoPageExtDto);
        } catch (e) {
            logger.error(`OntoPageController:getBindings: error = ${JSON.stringify(e)}`);
            next(new SomethingWentWrong(e.message));
        }
    }

    @httpGet('/pages/search-group')
    public async searchGroup(request: Request, response: Response, next: NextFunction): Promise<void> {
        const visId: string = request.query.visId as any;
        logger.info(`OntoPageController:searchGroup: visId = ${JSON.stringify(visId)}`);

        try {
            //
            // TODO
            //  I am just grouping arbitrarily
            //

            // Find out the group size
            const linkedOntoPages: IOntoPage[] = await this.ontoPageService.getExamplePagesBindingVisId(visId);
            const groupLen = linkedOntoPages[0].bindings[0].pageIds?.length || 0;
            console.log('groupLen = ', groupLen);

            // Get all pages
            const ontoPages: IOntoPage[] = await this.ontoPageService.getAll();

            // Convert IOntoPage[] -> OntoPageDto[] -> OntoPageExtDto[]
            const ontoPageDtos: OntoPageDto[] = automapper.map( MAPPING_TYPES.IOntoPage, MAPPING_TYPES.OntoPageDto, ontoPages);
            let ontoPageExtDtos: OntoPageExtDto[] = [];

            for (let ontoPageDto of ontoPageDtos) {
                let bindingExts: BindingExtDto[] = await this.bindingDtoToBindingExtDto(ontoPageDto.bindings);
                ontoPageExtDtos.push({ ...ontoPageDto, bindingExts: bindingExts });
            }

            // Group OntoPageExtDto[] -> OntoPageExtSearchGroupDto
            const ontoDataSearchGroup: OntoPageExtSearchGroupDto[] = [];
            for (let d of _.chunk(ontoPageExtDtos, groupLen)) {
                ontoDataSearchGroup.push({ score: 0, groups: d } as OntoPageExtSearchGroupDto);
            }

            logger.info(`OntoDataController:search: ontoDataSearchGroup = ${JSON.stringify(ontoDataSearchGroup)}`);
            response.status(200).send(ontoDataSearchGroup);
        } catch (e) {
            logger.error(`OntoDataController:search: error = ${JSON.stringify(e)}`);
            next(new SearchError(e.message));
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
