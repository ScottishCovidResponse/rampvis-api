import { NextFunction } from 'connect';
import { Request, Response } from 'express-serve-static-core';
import { controller, httpDelete, httpGet, httpPost, httpPut } from 'inversify-express-utils';
import { inject } from 'inversify';

import { logger } from '../../utils/logger';
import { TYPES } from '../../services/config/types';
import { queryParamValidate, vmValidate } from '../../middleware/validators';
import { JwtToken } from '../../middleware/jwt.token';
import { IOntoVis } from '../../infrastructure/onto-vis/onto-vis.interface';
import { OntoVisVm } from '../../infrastructure/onto-vis/onto-vis.vm';
import { OntoVisDto } from '../../infrastructure/onto-vis/onto-vis.dto';
import { OntologyVisService } from '../../services/ontology-vis.service';
import { MAPPING_TYPES } from '../../services/config/automapper.config';
import { OntoDataVm } from '../../infrastructure/onto-data/onto-data.vm';
import { OntologyDataService } from '../../services/ontology-data.service';
import { IOntoData } from '../../infrastructure/onto-data/onto-data.interface';
import { OntoDataDto } from '../../infrastructure/onto-data/onto-data.dto';
import { OntoPageVm } from '../../infrastructure/onto-page/onto-page.vm';
import { OntologyPageService } from '../../services/ontology-page.service';
import { IOntoPage } from '../../infrastructure/onto-page/onto-page.interface';
import { SomethingWentWrong } from '../../exceptions/exception';
import { OntoPageDto } from '../../infrastructure/onto-page/onto-page.dto';
import { OntoPageFilterVm } from '../../infrastructure/onto-page/onto-page-filter.vm';
import { PaginationVm } from '../../infrastructure/pagination.vm';

@controller('/ontology', JwtToken.verify)
export class OntologyController {
    constructor(
        @inject(TYPES.OntologyVisService) private ontologyVisService: OntologyVisService,
        @inject(TYPES.OntologyDataService) private ontologyDataService: OntologyDataService,
        @inject(TYPES.OntologyPageService) private ontologyPageService: OntologyPageService,
    ) {}

    //
    // Vis
    //
    @httpGet('/vis')
    public async getAllVis(request: Request, response: Response, next: NextFunction): Promise<void> {
        try {
            const visList: IOntoVis[] = await this.ontologyVisService.getAll();
            const visDtos: OntoVisDto[] = automapper.map(MAPPING_TYPES.IOntoVis, MAPPING_TYPES.OntoVisDto, visList);
            logger.info(`OntologyController:getAllVis: visDtos = ${JSON.stringify(visDtos)}`);
            response.status(200).send(visDtos);
        } catch (e) {
            logger.error(`OntologyController:getAllVis: error = ${JSON.stringify(e)}`);
            next(new SomethingWentWrong(e.message));
        }
    }

    @httpPost('/vis', vmValidate(OntoVisVm))
    public async createVis(request: Request, response: Response, next: NextFunction): Promise<void> {
        const visVm: OntoVisVm = request.body as any;
        logger.info(`OntologyController:createVis: visVm = ${JSON.stringify(visVm)}`);

        try {
            const vis: IOntoVis = await this.ontologyVisService.createVis(visVm);
            const visDto: OntoVisDto = automapper.map(MAPPING_TYPES.IOntoVis, MAPPING_TYPES.OntoVisDto, vis);
            logger.info(`OntologyController:createVis: visDto = ${visDto}`);
            response.status(200).send(visDto);
        } catch (e) {
            logger.error(`OntologyController:createVis: error = ${JSON.stringify(e)}`);
            next(new SomethingWentWrong(e.message));
        }
    }

    @httpPut('/vis/:visId', vmValidate(OntoVisVm))
    public async updateVis(request: Request, response: Response, next: NextFunction): Promise<void> {
        const visId: string = request.params.visId;
        const visVm: OntoVisVm = request.body as any;
        logger.info(`OntologyController:updateVis: visId = ${visId}, visVm = ${JSON.stringify(visVm)}`);

        try {
            const vis: IOntoVis = await this.ontologyVisService.updateVis(visId, visVm);
            const visDto: OntoVisDto = automapper.map(MAPPING_TYPES.IOntoVis, MAPPING_TYPES.OntoVisDto, vis);
            logger.info(`OntologyController:updateVis: visDto = ${visDto}`);
            response.status(200).send(visDto);
        } catch (e) {
            logger.error(`OntologyController:updateVis: error = ${JSON.stringify(e)}`);
            next(new SomethingWentWrong(e.message));
        }
    }

    @httpDelete('/vis/:visId') 
    public async deleteVis(request: Request, response: Response, next: NextFunction): Promise<void> {
        const visId: string = request.params.visId;
        logger.info(`OntologyController:deleteVis: visId = ${visId}`);

        try {
            const ontoVis: IOntoVis = await this.ontologyVisService.delete(visId);
            const ontoVisDto: OntoVisDto = automapper.map(MAPPING_TYPES.IOntoVis, MAPPING_TYPES.OntoVisDto, ontoVis);
            logger.info(`OntologyController:deleteVis: ontoVisDto = ${JSON.stringify(ontoVisDto)}`);
            response.status(200).send(ontoVisDto);
        } catch (e) {
            logger.error(`OntologyController:deleteVis: error = ${JSON.stringify(e)}`);
            next(new SomethingWentWrong(e.message));
        }
    }

    //
    // Data
    //
    @httpGet('/data')
    public async getAllData(request: Request, response: Response, next: NextFunction): Promise<void> {
        try {
            const dataList: IOntoData[] = await this.ontologyDataService.getAll();
            const dataDtos: OntoDataDto[] = automapper.map(MAPPING_TYPES.IOntoData, MAPPING_TYPES.OntoDataDto, dataList);
            logger.info(`OntologyController:getAllData: dataDtos = ${JSON.stringify(dataDtos)}`);
            response.status(200).send(dataDtos);
        } catch (e) {
            logger.error(`OntologyController:getAllData: error = ${JSON.stringify(e)}`);
            next(new SomethingWentWrong(e.message));
        }
    }

    @httpGet('/data/:dataId')
    public async getData(request: Request, response: Response, next: NextFunction): Promise<void> {
        const dataId = request.params.dataId;
        logger.info(`OntologyController:getData: dataId = ${JSON.stringify(dataId)}`);

        try {
            const data: IOntoData = await this.ontologyDataService.get(dataId);
            const dataDto: OntoDataDto = automapper.map(MAPPING_TYPES.IOntoData, MAPPING_TYPES.OntoDataDto, data);
            logger.info(`OntologyController:getData: dataDto = ${JSON.stringify(dataDto)}`);
            response.status(200).send(dataDto);
        } catch (e) {
            logger.error(`OntologyController:getData: error = ${JSON.stringify(e)}`);
            next(new SomethingWentWrong(e.message));
        }
    }

    @httpPost('/data', vmValidate(OntoDataVm))
    public async createData(request: Request, response: Response, next: NextFunction): Promise<void> {
        const dataVm: OntoDataVm = request.body as any;
        logger.info(`OntologyController:createData: dataVm = ${JSON.stringify(dataVm)}`);

        try {
            const data: IOntoData = await this.ontologyDataService.createData(dataVm);
            const dataDto: OntoDataDto = automapper.map(MAPPING_TYPES.IOntoData, MAPPING_TYPES.OntoDataDto, data);
            logger.info(`OntologyController:createData: dataDto = ${JSON.stringify(dataDto)}`);
            response.status(200).send(dataDto);
        } catch (e) {
            logger.error(`OntologyController:createData: error = ${JSON.stringify(e)}`);
            next(new SomethingWentWrong(e.message));
        }
    }

    @httpPut('/data/:dataId', vmValidate(OntoDataVm))
    public async updateData(request: Request, response: Response, next: NextFunction): Promise<void> {
        const dataId: string = request.params.dataId;
        const dataVm: OntoDataVm = request.body as any;
        logger.info(`OntologyController:updateData: dataId = ${dataId}, dataVm = ${JSON.stringify(dataVm)}`);
        try {
            const data: IOntoData = await this.ontologyDataService.updateData(dataId, dataVm);
            const dataDto: OntoDataDto = automapper.map(MAPPING_TYPES.IOntoData, MAPPING_TYPES.OntoDataDto, data);
            logger.info(`OntologyController:updateData: dataDto = ${JSON.stringify(dataDto)}`);
            response.status(200).send(dataDto);
        } catch (e) {
            logger.error(`OntologyController:updateData: error = ${JSON.stringify(e)}`);
            next(new SomethingWentWrong(e.message));
        }
    }

    @httpDelete('/data/:dataId') 
    public async deleteData(request: Request, response: Response, next: NextFunction): Promise<void> {
        const dataId: string = request.params.dataId;
        logger.info(`OntologyController:deleteData: dataId = ${dataId}`);

        try {
            const ontoData: IOntoData = await this.ontologyDataService.delete(dataId);
            const ontoDataDto: OntoDataDto = automapper.map(MAPPING_TYPES.IOntoData, MAPPING_TYPES.OntoDataDto, ontoData);
            logger.info(`OntologyController:deleteData: ontoDataDto = ${JSON.stringify(ontoDataDto)}`);
            response.status(200).send(ontoDataDto);
        } catch (e) {
            logger.error(`OntologyController:deleteData: error = ${JSON.stringify(e)}`);
            next(new SomethingWentWrong(e.message));
        }
    }

    //
    // Page
    //

    @httpGet('/pages', queryParamValidate(OntoPageFilterVm))
    public async getPages(request: Request, response: Response, next: NextFunction): Promise<void> {
        const query: OntoPageFilterVm = request.query as any;
        logger.info(`OntologyController:getPages: query = ${JSON.stringify(query)}`);

        try {
            const result: PaginationVm<IOntoPage> = await this.ontologyPageService.getAllPages(query);

            const resultDto: PaginationVm<OntoPageDto> = {
                data: automapper.map(MAPPING_TYPES.IOntoPage, MAPPING_TYPES.OntoPageDto, result.data),
                page: result.page,
                pageCount: result.pageCount,
                totalCount: result.totalCount,
            } as PaginationVm<OntoPageDto>;

            logger.info(`OntologyController:getPages: pageDtos = ${JSON.stringify(resultDto)}`);
            response.status(200).send(resultDto);
        } catch (e) {
            logger.error(`OntologyController:getPages: error = ${JSON.stringify(e)}`);
            next(new SomethingWentWrong(e.message));
        }
    }

    
    @httpPost('/page', vmValidate(OntoPageVm))
    public async createPage(request: Request, response: Response, next: NextFunction): Promise<void> {
        const ontoPageVm: OntoPageVm = request.body as any;
        logger.info(`OntologyController:createPage: dataVm = ${JSON.stringify(ontoPageVm)}`);

        try {
            const ontoPage: IOntoPage = await this.ontologyPageService.createPage(ontoPageVm);
            const ontoPageDto: OntoPageDto = automapper.map(MAPPING_TYPES.IOntoPage, MAPPING_TYPES.OntoPageDto, ontoPage);
            logger.info(`OntologyController:createPage: ontoPageDto = ${JSON.stringify(ontoPageDto)}`);
            response.status(200).send(ontoPageDto);
        } catch (e) {
            logger.error(`OntologyController:createPage: error = ${JSON.stringify(e)}`);
            next(new SomethingWentWrong(e.message));
        }
    }

    @httpPut('/page/:pageId', vmValidate(OntoPageVm)) 
    public async updatePage(request: Request, response: Response, next: NextFunction): Promise<void> {
        const pageId: string = request.params.pageId;
        const ontoPageVm: OntoPageVm = request.body as any;
        logger.info(`OntologyController:updatePage: pageId = ${pageId}, ontoPageVm = ${JSON.stringify(ontoPageVm)}`);

        try {
            const ontoPage: IOntoPage = await this.ontologyPageService.updatePage(pageId, ontoPageVm);
            const ontoPageDto: OntoPageDto = automapper.map(MAPPING_TYPES.IOntoPage, MAPPING_TYPES.OntoPageDto, ontoPage);
            logger.info(`OntologyController:updatePage: ontoPageDto = ${JSON.stringify(ontoPageDto)}`);
            response.status(200).send(ontoPageDto);
        } catch (e) {
            logger.error(`OntologyController:updatePage: error = ${JSON.stringify(e)}`);
            next(new SomethingWentWrong(e.message));
        }
    }

    @httpDelete('/page/:pageId') 
    public async deletePage(request: Request, response: Response, next: NextFunction): Promise<void> {
        const pageId: string = request.params.pageId;
        logger.info(`OntologyController:deletePage: pageId = ${pageId}`);

        try {
            const ontoPage: IOntoPage = await this.ontologyPageService.delete(pageId);
            const ontoPageDto: OntoPageDto = automapper.map(MAPPING_TYPES.IOntoPage, MAPPING_TYPES.OntoPageDto, ontoPage);
            logger.info(`OntologyController:deletePage: ontoPageDto = ${JSON.stringify(ontoPageDto)}`);
            response.status(200).send(ontoPageDto);
        } catch (e) {
            logger.error(`OntologyController:deletePage: error = ${JSON.stringify(e)}`);
            next(new SomethingWentWrong(e.message));
        }
    }

}
