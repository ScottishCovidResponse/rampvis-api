import { inject } from 'inversify';
import { provide } from 'inversify-binding-decorators';
import config from 'config';

import { TYPES } from './config/types';
import { IOntoData } from '../infrastructure/onto-data/onto-data.interface';
import { OntologyVisService } from './ontology-vis.service';
import { OntologyDataService } from './ontology-data.service';
import { OntologyPageService } from './ontology-page.service';
import { IPageTemplate } from '../infrastructure/onto-page/page-template.interface';
import { IOntoPage } from '../infrastructure/onto-page/onto-page.interface';

@provide(TYPES.TemplateService)
export class TemplateService {
    public constructor(
        @inject(TYPES.OntologyVisService) private ontologyVisService: OntologyVisService,
        @inject(TYPES.OntologyDataService) private ontologyDataService: OntologyDataService,
        @inject(TYPES.OntologyPageService) private ontologyPageService: OntologyPageService,
    ) {}

    public async buildPageTemplate(pageId: string): Promise<IPageTemplate> {
        const ontoPage: IOntoPage = await this.ontologyPageService.get(pageId);

        const getVisFunction = async (visId: string) => {
            return (await this.ontologyVisService.get(visId)).function;
        };
        const getQueryparams = (queryParams: any) => {
            let fqQueryparams = '';
            // console.log('queryParams = ', queryParams);
            if (queryParams && queryParams.length > 0) {
                for (let d1 of queryParams) {
                    fqQueryparams += d1.query + '=' + d1.params + '&';
                }
            }
            // console.log(fqQueryparams)
            return fqQueryparams;
        };
        const getEndPoints = async (bindData: any) => {
            // return (await this.ontologyVisService.get(visId)).function;
            return await Promise.all(
                bindData.map(async (d: any) => {
                    const ontoData: IOntoData = await this.ontologyDataService.get(d.dataId);
                    // console.log('ontoData = ', ontoData);
                    let fqEndpoint = config.get(`urlCode.${ontoData.url}`)  + ontoData.endpoint;
                    let fqQueryparams = getQueryparams(d.queryParams);
                    if (fqQueryparams && fqQueryparams !== '') {
                        fqEndpoint = fqEndpoint + '/?' + fqQueryparams;
                    }
                    return fqEndpoint;
                }),
            );
        };

        const bind = await Promise.all(
            ontoPage.bindVis.map(async (d) => {
                let endpoint: any = await getEndPoints(d.bindData);
                return {
                    function: await getVisFunction(d.visId),
                    endpoint: endpoint.length === 1 ? endpoint[0] : endpoint,
                };
            }),
        );

        const result: IPageTemplate = {
            page: {
                id: ontoPage._id as any,
                title: ontoPage.title,
                description: '',
                nrows: 0,
                type: '',
            },
            bind: bind as any,
            links: {},
        };
        console.log('result = ', JSON.stringify(result));

        return result;
    }
}
