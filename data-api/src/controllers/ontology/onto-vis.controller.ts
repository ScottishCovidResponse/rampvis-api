import { NextFunction } from 'connect';
import { Request, Response } from 'express-serve-static-core';
import { controller, httpDelete, httpGet, httpPost, httpPut } from 'inversify-express-utils';
import { inject } from 'inversify';

import { logger } from '../../utils/logger';
import { TYPES } from '../../services/config/types';
import { vmValidate } from '../../middleware/validators';
import { JwtToken } from '../../middleware/jwt.token';
import { IOntoVis } from '../../infrastructure/onto-vis/onto-vis.interface';
import { OntoVisVm } from '../../infrastructure/onto-vis/onto-vis.vm';
import { OntoVisDto } from '../../infrastructure/onto-vis/onto-vis.dto';
import { OntoVisService } from '../../services/onto-vis.service';
import { MAPPING_TYPES } from '../../services/config/automapper.config';
import { OntoDataService } from '../../services/onto-data.service';
import { OntoPageService } from '../../services/onto-page.service';
import { SomethingWentWrong } from '../../exceptions/exception';

@controller('/ontology/vis', JwtToken.verify)
export class OntoVisController {
    constructor(
        @inject(TYPES.OntoVisService) private ontologyVisService: OntoVisService,
        @inject(TYPES.OntoDataService) private ontologyDataService: OntoDataService,
        @inject(TYPES.OntoPageService) private ontologyPageService: OntoPageService,
    ) {}

    //
    // Vis
    //
    @httpGet('/')
    public async getAllVis(request: Request, response: Response, next: NextFunction): Promise<void> {
        try {
            const visList: IOntoVis[] = await this.ontologyVisService.getAll();
            const visDtos: OntoVisDto[] = automapper.map(MAPPING_TYPES.IOntoVis, MAPPING_TYPES.OntoVisDto, visList);
            logger.info(`OntoVisController:getAllVis: visList = ${JSON.stringify(visList)}`);
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
            const vis: IOntoVis = await this.ontologyVisService.createVis(visVm);
            const visDto: OntoVisDto = automapper.map(MAPPING_TYPES.IOntoVis, MAPPING_TYPES.OntoVisDto, vis);
            logger.info(`OntoVisController:createVis: visDto = ${visDto}`);
            response.status(200).send(visDto);
        } catch (e) {
            logger.error(`OntoVisController:createVis: error = ${JSON.stringify(e)}`);
            next(new SomethingWentWrong(e.message));
        }
    }

    @httpPut('/:visId', vmValidate(OntoVisVm))
    public async updateVis(request: Request, response: Response, next: NextFunction): Promise<void> {
        const visId: string = request.params.visId;
        const visVm: OntoVisVm = request.body as any;
        logger.info(`OntoVisController:updateVis: visId = ${visId}, visVm = ${JSON.stringify(visVm)}`);

        try {
            const vis: IOntoVis = await this.ontologyVisService.updateVis(visId, visVm);
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
            const ontoVis: IOntoVis = await this.ontologyVisService.delete(visId);
            const ontoVisDto: OntoVisDto = automapper.map(MAPPING_TYPES.IOntoVis, MAPPING_TYPES.OntoVisDto, ontoVis);
            logger.info(`OntoVisController:deleteVis: ontoVisDto = ${JSON.stringify(ontoVisDto)}`);
            response.status(200).send(ontoVisDto);
        } catch (e) {
            logger.error(`OntoVisController:deleteVis: error = ${JSON.stringify(e)}`);
            next(new SomethingWentWrong(e.message));
        }
    }

}
