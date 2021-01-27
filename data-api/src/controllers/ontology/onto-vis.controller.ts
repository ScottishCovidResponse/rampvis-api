import { NextFunction } from 'connect';
import { Request, Response } from 'express-serve-static-core';
import { controller, httpDelete, httpGet, httpPost, httpPut } from 'inversify-express-utils';
import { inject } from 'inversify';

import { logger } from '../../utils/logger';
import { TYPES } from '../../services/config/types';
import { queryParamValidate, vmValidate } from '../../middleware/validators';
import { JwtToken } from '../../middleware/jwt.token';
import { IOntoVis, IOntoVisSearch } from '../../infrastructure/onto-vis/onto-vis.interface';
import { OntoVisVm } from '../../infrastructure/onto-vis/onto-vis.vm';
import { OntoVisDto, OntoVisSearchDto } from '../../infrastructure/onto-vis/onto-vis.dto';
import { OntoVisService } from '../../services/onto-vis.service';
import { MAPPING_TYPES } from '../../services/config/automapper.config';
import { InvalidQueryParametersException, SearchError, SomethingWentWrong } from '../../exceptions/exception';
import { IOntoData } from '../../infrastructure/onto-data/onto-data.interface';
import { OntoDataDto } from '../../infrastructure/onto-data/onto-data.dto';
import { OntoVisSearchService } from '../../services/onto-vis-search.service';
import { OntoVisSearchFilterVm } from '../../infrastructure/onto-page/onto-vis-search-filter.vm';
import { IOntoPage } from '../../infrastructure/onto-page/onto-page.interface';
import { BindingDto } from '../../infrastructure/onto-page/binding.dto';
import { BindingExtDto } from '../../infrastructure/onto-page/binding.dto';
import { OntoPageService } from '../../services/onto-page.service';
import { OntoDataService } from '../../services/onto-data.service';
import { OntoPageDto } from '../../infrastructure/onto-page/onto-page.dto';
import { OntoPageExtDto } from '../../infrastructure/onto-page/onto-page.dto';

@controller('/ontology/vis', JwtToken.verify)
export class OntoVisController {
    constructor(
        @inject(TYPES.OntoVisService) private ontoVisService: OntoVisService,
        @inject(TYPES.OntoVisSearchService) private ontoVisSearchService: OntoVisSearchService,
        @inject(TYPES.OntoPageService) private ontoPageService: OntoPageService,
        @inject(TYPES.OntoDataService) private ontoDataService: OntoDataService
    ) {}

    @httpGet('/')
    public async getAllVis(request: Request, response: Response, next: NextFunction): Promise<void> {
        try {
            const visList: IOntoVis[] = await this.ontoVisService.getAll();
            const visDtos: OntoVisDto[] = automapper.map(MAPPING_TYPES.IOntoVis, MAPPING_TYPES.OntoVisDto, visList);
            logger.info(`OntoVisController:getAllVis: visDtos = ${JSON.stringify(visDtos)}`);
            response.status(200).send(visDtos);
        } catch (e) {
            logger.error(`OntoVisController:getAllVis: error = ${JSON.stringify(e)}`);
            next(new SomethingWentWrong(e.message));
        }
    }

    @httpPost('/', vmValidate(OntoVisVm))
    public async createVis(request: Request, response: Response, next: NextFunction): Promise<void> {
        const visVm: OntoVisVm = request.body as any;
        logger.info(`OntoVisController:createVis: visVm = ${JSON.stringify(visVm)}`);

        try {
            const vis: IOntoVis = await this.ontoVisService.createVis(visVm);
            const visDto: OntoVisDto = automapper.map(MAPPING_TYPES.IOntoVis, MAPPING_TYPES.OntoVisDto, vis);
            logger.info(`OntoVisController:createVis: visDto = ${visDto}`);
            response.status(200).send(visDto);
        } catch (e) {
            logger.error(`OntoVisController:createVis: error = ${JSON.stringify(e)}`);
            next(new SomethingWentWrong(e.message));
        }
    }

    @httpGet('/suggest')
    public async suggest(request: Request, response: Response, next: NextFunction): Promise<void> {
        const queryStr = request.query.query as string;
        logger.info(`OntoVisController: search: query = ${queryStr}`);

        if (!queryStr) {
            return next(new InvalidQueryParametersException('Missing query.'));
        }

        try {
            const vis: IOntoVisSearch[] = await this.ontoVisSearchService.searchAsYouType(queryStr);
            const visDto: OntoVisSearchDto = automapper.map(MAPPING_TYPES.IOntoVisSearch, MAPPING_TYPES.OntoVisSearchDto, vis);

            logger.info(`OntoVisController:suggest: visDto = ${JSON.stringify(visDto)}`);
            response.status(200).send(visDto);
        } catch (e) {
            logger.error(`OntoVisController:suggest: error = ${JSON.stringify(e)}`);
            next(new SearchError(e.message));
        }
    }

    @httpGet('/search', queryParamValidate(OntoVisSearchFilterVm))
    public async search(request: Request, response: Response, next: NextFunction): Promise<void> {
        const ontoVisSearchFilterVm: OntoVisSearchFilterVm = request.query as any;
        logger.info(`OntoVisController:search: ontoVisSearchFilterVm = ${JSON.stringify(ontoVisSearchFilterVm)}`);

        try {
            let result: IOntoVisSearch[] = await this.ontoVisSearchService.search(ontoVisSearchFilterVm);
            let resultDto = automapper.map(MAPPING_TYPES.IOntoVisSearch, MAPPING_TYPES.OntoVisSearchDto, result);

            logger.info(`OntoVisController:search: resultDto = ${JSON.stringify(resultDto)}`);
            response.status(200).send(resultDto);
        } catch (e) {
            logger.error(`OntoDataController:search: error = ${JSON.stringify(e)}`);
            next(new SearchError(e.message));
        }
    }

    @httpGet('/:visId')
    public async getVis(request: Request, response: Response, next: NextFunction): Promise<void> {
        const visId: string = request.params.visId;
        try {
            const ontoVis: IOntoVis = await this.ontoVisService.get(visId);
            const visDto: OntoVisDto = automapper.map(MAPPING_TYPES.IOntoVis, MAPPING_TYPES.OntoVisDto, ontoVis);
            logger.info(`OntoVisController:getVis: visDto = ${JSON.stringify(visDto)}`);
            response.status(200).send(visDto);
        } catch (e) {
            logger.error(`OntoVisController:getVis: error = ${JSON.stringify(e)}`);
            next(new SomethingWentWrong(e.message));
        }
    }

    @httpPut('/:visId', vmValidate(OntoVisVm))
    public async updateVis(request: Request, response: Response, next: NextFunction): Promise<void> {
        const visId: string = request.params.visId;
        const visVm: OntoVisVm = request.body as any;
        logger.info(`OntoVisController:updateVis: visId = ${visId}, visVm = ${JSON.stringify(visVm)}`);

        try {
            const vis: IOntoVis = await this.ontoVisService.updateVis(visId, visVm);
            const visDto: OntoVisDto = automapper.map(MAPPING_TYPES.IOntoVis, MAPPING_TYPES.OntoVisDto, vis);
            logger.info(`OntoVisController:updateVis: visDto = ${visDto}`);
            response.status(200).send(visDto);
        } catch (e) {
            logger.error(`OntoVisController:updateVis: error = ${JSON.stringify(e)}`);
            next(new SomethingWentWrong(e.message));
        }
    }

    @httpDelete('/:visId')
    public async deleteVis(request: Request, response: Response, next: NextFunction): Promise<void> {
        const visId: string = request.params.visId;
        logger.info(`OntoVisController:deleteVis: visId = ${visId}`);

        try {
            const ontoVis: IOntoVis = await this.ontoVisService.delete(visId);
            const ontoVisDto: OntoVisDto = automapper.map(MAPPING_TYPES.IOntoVis, MAPPING_TYPES.OntoVisDto, ontoVis);
            logger.info(`OntoVisController:deleteVis: ontoVisDto = ${JSON.stringify(ontoVisDto)}`);
            response.status(200).send(ontoVisDto);
        } catch (e) {
            logger.error(`OntoVisController:deleteVis: error = ${JSON.stringify(e)}`);
            next(new SomethingWentWrong(e.message));
        }
    }

    @httpGet('/:visId/data')
    public async getExampleOntoDataBindingVisId(request: Request, response: Response, next: NextFunction): Promise<void> {
        const visId: string = request.params.visId;
        try {
            const ontoPages: IOntoPage[] = await this.ontoPageService.getExamplePagesBindingVisId(visId);
            const ontoData: IOntoData[] = await this.ontoDataService.getMultiple(ontoPages[0].bindings[0].dataIds)
            const ontoDataDto: OntoDataDto[] = automapper.map(MAPPING_TYPES.IOntoData, MAPPING_TYPES.OntoDataDto, ontoData);

            logger.info(`OntoVisController:getExampleOntoDataBindingVisId: ontoDataDto = ${JSON.stringify(ontoDataDto)}`);
            response.status(200).send(ontoDataDto);
        } catch (e) {
            logger.error(`OntoVisController:getExampleOntoDataBindingVisId: error = ${JSON.stringify(e)}`);
            next(new SomethingWentWrong(e.message));
        }
    }

    @httpGet('/:visId/links')
    public async getExampleLinksBindingVisId(request: Request, response: Response, next: NextFunction): Promise<void> {
        const visId: string = request.params.visId;
        logger.info(`OntoVisController:getExampleLinksBindingVisId: visId = ${JSON.stringify(visId)}`);

        try {
            const ontoPages1: IOntoPage[] = await this.ontoPageService.getExamplePagesBindingVisId(visId);
            let links: IOntoPage[] = [];

            if (ontoPages1[0]?.bindings[0]?.pageIds?.length) {
                links = await this.ontoPageService.getMultiple(ontoPages1[0]?.bindings[0]?.pageIds);
            }

            console.log('OntoVisController:getExampleLinksBindingVisId: pageIds = ', ontoPages1[0].bindings[0].pageIds, 'links = ', links);

            const linkDtos: OntoPageDto[] = automapper.map( MAPPING_TYPES.IOntoPage, MAPPING_TYPES.OntoPageDto, links);
            const linkExtDtos: OntoPageExtDto[] = [];

            for (let ontoPageDto of linkDtos) {
                let exts: BindingExtDto[] = await this.bindingDtoToBindingExtDto(ontoPageDto.bindings);
                linkExtDtos.push({ ...ontoPageDto, bindingExts: exts });
            }

            logger.info(`OntoVisController:getExampleLinksBindingVisId: linkExtDtos = ${JSON.stringify(linkExtDtos)}`);
            response.status(200).send(linkExtDtos);
        } catch (e) {
            logger.error(`OntoVisController:getExampleLinksBindingVisId: error = ${JSON.stringify(e)}`);
            next(new SomethingWentWrong(e.message));
        }
    }

    public async bindingDtoToBindingExtDto(bindings: BindingDto[]) {
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
