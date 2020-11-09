import { NextFunction } from 'connect';
import { Request, Response } from 'express-serve-static-core';
import { controller, httpGet, httpPost, httpPut } from 'inversify-express-utils';
import { inject } from 'inversify';

import { logger } from '../../utils/logger';
import { TYPES } from '../../services/config/types';
import { vmValidate } from '../../middleware/validators';
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
import { OntoPageDto } from '../../infrastructure/onto-page/onto-page.dto';
import { SomethingWentWrong } from '../../exceptions/exception';

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
        const visList: IOntoVis[] = await this.ontologyVisService.getAll();
        const visDtos: OntoVisDto[] = automapper.map(MAPPING_TYPES.IOntoVis, MAPPING_TYPES.OntoVisDto, visList);
        logger.info(`OntologyController: getAllVis: visDtos = ${JSON.stringify(visDtos)}`);
        response.status(200).send(visDtos);
    }

    @httpPost('/vis/create', vmValidate(OntoVisVm))
    public async createVis(request: Request, response: Response, next: NextFunction): Promise<void> {
        const visVm: OntoVisVm = request.body as any;
        logger.info(`OntologyController: createVis: visVm = ${JSON.stringify(visVm)}`);

        const vis: IOntoVis = await this.ontologyVisService.createVis(visVm);
        const visDto: OntoVisDto = automapper.map(MAPPING_TYPES.IOntoVis, MAPPING_TYPES.OntoVisDto, vis);
        logger.info(`OntologyController: createVis: visDto = ${visDto}`);
        response.status(200).send(visDto);
    }

    @httpPut('/vis/update', vmValidate(OntoVisVm))
    public async updateVis(request: Request, response: Response, next: NextFunction): Promise<void> {
        const visVm: OntoVisVm = request.body as any;
        logger.info(`OntologyController: updateVis: visVm = ${JSON.stringify(visVm)}`);

        const vis: IOntoVis = await this.ontologyVisService.updateVis(visVm.id, visVm);
        const visDto: OntoVisDto = automapper.map(MAPPING_TYPES.IOntoVis, MAPPING_TYPES.OntoVisDto, vis);
        logger.info(`OntologyController: updateVis: visDto = ${visDto}`);
        response.status(200).send(visDto);
    }

    //
    // Data
    //
    @httpGet('/data')
    public async getAllData(request: Request, response: Response, next: NextFunction): Promise<void> {
        const dataList: IOntoData[] = await this.ontologyDataService.getAll();
        const dataDtos: OntoDataDto[] = automapper.map(MAPPING_TYPES.IOntoData, MAPPING_TYPES.OntoDataDto, dataList);
        logger.info(`OntologyController: getAllData: dataDtos = ${JSON.stringify(dataDtos)}`);
        response.status(200).send(dataDtos);
    }

    @httpPost('/data/create', vmValidate(OntoDataVm))
    public async createData(request: Request, response: Response, next: NextFunction): Promise<void> {
        const dataVm: OntoDataVm = request.body as any;
        logger.info(`OntologyController: createData: dataVm = ${JSON.stringify(dataVm)}`);

        try {
            const data: IOntoData = await this.ontologyDataService.createData(dataVm);
            const dataDto: OntoDataDto = automapper.map(MAPPING_TYPES.IOntoData, MAPPING_TYPES.OntoDataDto, data);
            logger.info(`OntologyController: createData: dataDto = ${JSON.stringify(dataDto)}`);
            response.status(200).send(dataDto);
        } catch (e) {
            logger.error(`OntologyController: createData: error = ${JSON.stringify(e)}`);
            next(new SomethingWentWrong(e.message));
        }
    }

    @httpPut('/data/update', vmValidate(OntoDataVm))
    public async updateData(request: Request, response: Response, next: NextFunction): Promise<void> {
        const dataVm: OntoDataVm = request.body as any;
        logger.info(`OntologyController: updateData: dataVm = ${JSON.stringify(dataVm)}`);

        const data: IOntoData = await this.ontologyDataService.updateData(dataVm.id, dataVm);
        const dataDto: OntoDataDto = automapper.map(MAPPING_TYPES.IOntoData, MAPPING_TYPES.OntoDataDto, data);
        logger.info(`OntologyController: updateData: dataDto = ${JSON.stringify(dataDto)}`);
        response.status(200).send(dataDto);
    }

    //
    // Page
    //

    @httpGet('/page')
    public async getAllPage(request: Request, response: Response, next: NextFunction): Promise<void> {
        const ontoPages: IOntoPage[] = await this.ontologyPageService.getAll();
        const dataDtos: OntoPageDto[] = automapper.map(MAPPING_TYPES.IOntoPage, MAPPING_TYPES.OntoPageDto, ontoPages);
        logger.info(`OntologyController: getAllPage: dataDtos = ${JSON.stringify(dataDtos)}`);
        response.status(200).send(dataDtos);
    }

    @httpPost('/page/create', vmValidate(OntoPageVm))
    public async createPage(request: Request, response: Response, next: NextFunction): Promise<void> {
        const ontoPageVm: OntoPageVm = request.body as any;
        logger.info(`OntologyController: createPage: dataVm = ${JSON.stringify(ontoPageVm)}`);

        const ontoPage: IOntoPage = await this.ontologyPageService.createPage(ontoPageVm);
        const ontoPageDto: OntoPageDto = automapper.map(MAPPING_TYPES.IOntoPage, MAPPING_TYPES.OntoPageDto, ontoPage);
        logger.info(`OntologyController:createPage: ontoPageDto = ${JSON.stringify(ontoPageDto)}`);
        response.status(200).send(ontoPageDto);
    }

    @httpPut('/page/create', vmValidate(OntoPageVm)) 
    public async updatePage(request: Request, response: Response, next: NextFunction): Promise<void> {
        // TODO
        response.status(200).send({});
    }

}
