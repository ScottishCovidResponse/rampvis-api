import { NextFunction } from 'connect';
import { Request, Response } from 'express-serve-static-core';
import { controller, httpGet, httpPost } from 'inversify-express-utils';
import { inject } from 'inversify';

import { logger } from '../../utils/logger';
import { TYPES } from '../../services/config/types';
import { vmValidate } from '../../middleware/validators';
import { VisVm } from '../../infrastructure/ontology/vis.vm';
import { JwtToken } from '../../middleware/jwt.token';
import { IVis } from '../../infrastructure/ontology/vis.interface';
import { OntologyVisService } from '../../services/ontology-vis.service';
import { VisDto } from '../../infrastructure/ontology/vis.dto';
import { MAPPING_TYPES } from '../../services/config/automapper.config';
import { DataVm } from '../../infrastructure/ontology/data.vm';
import { OntologyDataService } from '../../services/ontology-data.service';
import { IData } from '../../infrastructure/ontology/data.interface';
import { DataDto } from '../../infrastructure/ontology/data.dto';

@controller('/ontology', JwtToken.verify)
export class OntologyController {
    constructor(
        @inject(TYPES.OntologyVisService) private ontologyVisService: OntologyVisService,
        @inject(TYPES.OntologyDataService) private ontologyDataService: OntologyDataService,
    ) {}

    //
    // Vis
    //
    @httpPost('/vis/create', vmValidate(VisVm))
    public async createVis(request: Request, response: Response, next: NextFunction): Promise<void> {
        const visVm: VisVm = request.body as any;
        logger.info(`OntologyController: createVis: visVm = ${JSON.stringify(visVm)}`);

        const vis: IVis = await this.ontologyVisService.createVis(visVm);
        const visDto: VisDto = automapper.map(MAPPING_TYPES.IVis, MAPPING_TYPES.VisDto, vis);
        logger.info(`OntologyController: createVis: visDto = ${visDto}`);

        response.status(200).send(visDto);
    }

    //
    // Data
    //
    @httpPost('/data/create', vmValidate(DataVm))
    public async createData(request: Request, response: Response, next: NextFunction): Promise<void> {
        const dataVm: DataVm = request.body as any;
        logger.info(`OntologyController: createData: dataVm = ${JSON.stringify(dataVm)}`);

        const data: IData = await this.ontologyDataService.createData(dataVm);
        const dataDto: DataDto = automapper.map(MAPPING_TYPES.IData, MAPPING_TYPES.DataDto, data);
        logger.info(`OntologyController: createData: dataDto = ${dataDto}`);
        response.status(200).send(dataDto);
    }
}
