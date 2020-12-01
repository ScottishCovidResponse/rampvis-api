import { NextFunction } from 'connect';
import { Request, Response } from 'express-serve-static-core';
import { controller, httpDelete, httpGet, httpPost, httpPut } from 'inversify-express-utils';
import { inject } from 'inversify';

import { logger } from '../../utils/logger';
import { TYPES } from '../../services/config/types';
import { queryParamValidate, vmValidate } from '../../middleware/validators';
import { JwtToken } from '../../middleware/jwt.token';
import { MAPPING_TYPES } from '../../services/config/automapper.config';
import { OntoDataVm } from '../../infrastructure/onto-data/onto-data.vm';
import { OntoDataService } from '../../services/onto-data.service';
import { IOntoData } from '../../infrastructure/onto-data/onto-data.interface';
import { OntoDataDto } from '../../infrastructure/onto-data/onto-data.dto';
import { InvalidQueryParametersException, SearchError, SomethingWentWrong } from '../../exceptions/exception';
import { DATA_TYPE } from '../../infrastructure/onto-data/onto-data-types';
import { OntoDataFilterVm } from '../../infrastructure/onto-data/onto-data-filter.vm';
import { PaginationVm } from '../../infrastructure/pagination.vm';

@controller('/ontology/data', JwtToken.verify)
export class OntoDataController {
    constructor(
        @inject(TYPES.OntoDataService) private ontologyDataService: OntoDataService,
    ) {}
   
    @httpGet('/', queryParamValidate(OntoDataFilterVm))
    public async getAllData(request: Request, response: Response, next: NextFunction): Promise<void> {
        const query: OntoDataFilterVm = request.query as any;
        logger.info(`OntoDataController:getAllData: query = ${JSON.stringify(query)}`);

        try {
            const result: PaginationVm<IOntoData> = await this.ontologyDataService.getAllData(query);
            const resultDto: PaginationVm<OntoDataDto> = {
                data: automapper.map(MAPPING_TYPES.IOntoData, MAPPING_TYPES.OntoDataDto, result.data),
                page: result.page,
                pageCount: result.pageCount,
                totalCount: result.totalCount,
            };
            logger.info(`OntoDataController:getAllData: resultDto = ${JSON.stringify(resultDto)}`);
            response.status(200).send(resultDto);
        } catch (e) {
            logger.error(`OntoDataController:getAllData: error = ${JSON.stringify(e)}`);
            next(new SomethingWentWrong(e.message));
        }
    }

    @httpGet('/search') 
    public async search(request: Request, response: Response, next: NextFunction): Promise<void> {
        const dataType = request.query.dataType as DATA_TYPE;
        const query = request.query.query as string;
        logger.info(`OntoDataController: search: query = ${query}, dataType = ${dataType}`);

        if (!query || !dataType) {
            return next(new InvalidQueryParametersException('Missing dataType or query.'));
        }

        try {
            const data = await this.ontologyDataService.search(query);
            const filteredData = data.filter(d => d.dataType === dataType);
            const dataDto: OntoDataDto = automapper.map(MAPPING_TYPES.IOntoData, MAPPING_TYPES.OntoDataDto, filteredData);
            logger.info(`OntoDataController:getData: search = ${JSON.stringify(dataDto)}`);
            response.status(200).send(dataDto);
        } catch (error) {
            next(new SearchError(error.message));
        } 
    }

    @httpGet('/:dataId')
    public async getData(request: Request, response: Response, next: NextFunction): Promise<void> {
        const dataId = request.params.dataId;
        logger.info(`OntoDataController:getData: dataId = ${JSON.stringify(dataId)}`);

        try {
            const data: IOntoData = await this.ontologyDataService.get(dataId);
            const dataDto: OntoDataDto = automapper.map(MAPPING_TYPES.IOntoData, MAPPING_TYPES.OntoDataDto, data);
            logger.info(`OntoDataController:getData: dataDto = ${JSON.stringify(dataDto)}`);
            response.status(200).send(dataDto);
        } catch (e) {
            logger.error(`OntoDataController:getData: error = ${JSON.stringify(e)}`);
            next(new SomethingWentWrong(e.message));
        }
    }

    @httpPost('/', vmValidate(OntoDataVm))
    public async createData(request: Request, response: Response, next: NextFunction): Promise<void> {
        const dataVm: OntoDataVm = request.body as any;
        logger.info(`OntoDataController:createData: dataVm = ${JSON.stringify(dataVm)}`);

        try {
            const data: IOntoData = await this.ontologyDataService.createData(dataVm);
            const dataDto: OntoDataDto = automapper.map(MAPPING_TYPES.IOntoData, MAPPING_TYPES.OntoDataDto, data);
            logger.info(`OntoDataController:createData: dataDto = ${JSON.stringify(dataDto)}`);
            response.status(200).send(dataDto);
        } catch (e) {
            logger.error(`OntoDataController:createData: error = ${JSON.stringify(e)}`);
            next(new SomethingWentWrong(e.message));
        }
    }

    @httpPut('/:dataId', vmValidate(OntoDataVm))
    public async updateData(request: Request, response: Response, next: NextFunction): Promise<void> {
        const dataId: string = request.params.dataId;
        const dataVm: OntoDataVm = request.body as any;
        logger.info(`OntoDataController:updateData: dataId = ${dataId}, dataVm = ${JSON.stringify(dataVm)}`);
        try {
            const data: IOntoData = await this.ontologyDataService.updateData(dataId, dataVm);
            const dataDto: OntoDataDto = automapper.map(MAPPING_TYPES.IOntoData, MAPPING_TYPES.OntoDataDto, data);
            logger.info(`OntoDataController:updateData: dataDto = ${JSON.stringify(dataDto)}`);
            response.status(200).send(dataDto);
        } catch (e) {
            logger.error(`OntoDataController:updateData: error = ${JSON.stringify(e)}`);
            next(new SomethingWentWrong(e.message));
        }
    }

    @httpDelete('/:dataId') 
    public async deleteData(request: Request, response: Response, next: NextFunction): Promise<void> {
        const dataId: string = request.params.dataId;
        logger.info(`OntoDataController:deleteData: dataId = ${dataId}`);

        try {
            const ontoData: IOntoData = await this.ontologyDataService.delete(dataId);
            const ontoDataDto: OntoDataDto = automapper.map(MAPPING_TYPES.IOntoData, MAPPING_TYPES.OntoDataDto, ontoData);
            logger.info(`OntoDataController:deleteData: ontoDataDto = ${JSON.stringify(ontoDataDto)}`);
            response.status(200).send(ontoDataDto);
        } catch (e) {
            logger.error(`OntoDataController:deleteData: error = ${JSON.stringify(e)}`);
            next(new SomethingWentWrong(e.message));
        }
    }

}
