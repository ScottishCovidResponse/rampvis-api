import { NextFunction } from "connect";
import { inject } from "inversify";
import { controller, httpGet } from "inversify-express-utils";
import { Request, Response } from "express-serve-static-core";
import { ApiOperationGet, ApiPath, SwaggerDefinitionConstant } from "swagger-express-ts";

import { TYPES } from "../services/config/types";
import { OntoPageService } from "../services/onto-page.service";
import { logger } from "../utils/logger";
import { SearchError, SomethingWentWrong } from "../exceptions/exception";
import { IOntoPage, PAGE_TYPE } from "../infrastructure/onto-page/onto-page.interface";
import { OntoPageDto, OntoPageExtDto } from "../infrastructure/onto-page/onto-page.dto";
import { MAPPING_TYPES } from "../services/config/automapper.config";
import { queryParamValidate } from "../middleware/validators";
import { OntoPageFilterVm } from "../infrastructure/onto-page/onto-page-filter.vm";
import { PaginationVm } from "../infrastructure/pagination.vm";
import { OntoPageSearchService } from "../services/onto-page-search.service";
import { OntoPageSearchFilterVm } from "../infrastructure/onto-page/onto-page-search-filter.vm";
import { IOntoPageSearch } from "../infrastructure/onto-page/onto-page-search.interface";
import { OntoPageSearchDto } from "../infrastructure/onto-page/onto-page-search.dto";
import { VIS_TYPE } from "../infrastructure/onto-vis/onto-vis-type.enum";
import generateTitle from "../utils/title-generation";
import { ThumbnailService } from "../services/thumbnail.service";
import { IThumbnail } from "../infrastructure/thumbnail/thumbnail.interface";
import { ThumbnailDto } from "../infrastructure/thumbnail/thumbnail.dto";
import { TemplateService } from "../services/template.service";
import { JwtToken } from "../middleware/jwt.token";
import { IUser } from "../infrastructure/user/user.interface";
import { UserService } from "../services/user.service";

@ApiPath({
  path: "/api/v1/template",
  name: "Template Data for the RAMPVIS User Interface",
  security: {},
})
@controller("/template")
export class TemplateController {
  constructor(
    @inject(TYPES.OntoPageService) private ontoPageService: OntoPageService,
    @inject(TYPES.OntoPageSearchService) private ontoPageSearchService: OntoPageSearchService,
    @inject(TYPES.ThumbnailService) private thumbnailService: ThumbnailService,
    @inject(TYPES.TemplateService) private templateService: TemplateService,
    @inject(TYPES.UserService) private userService: UserService
  ) {}

  @ApiOperationGet({
    path: "/pages/search",
    summary: "Search propagated pages in ontology",
    description: "",
    parameters: {
      query: {
        query: {
          required: true,
          type: SwaggerDefinitionConstant.Parameter.Type.STRING,
        },
      },
    },
    responses: {
      200: {}, // { model: "TODO",},
      400: {},
    },
  })
  @httpGet("/pages/search/", queryParamValidate(OntoPageSearchFilterVm))
  public async search(request: Request, response: Response, next: NextFunction): Promise<void> {
    const ontPageSearchFilterVm: OntoPageSearchFilterVm = request.query as any;
    logger.info(`TemplateController:search: ontPageSearchFilterVm = ${JSON.stringify(ontPageSearchFilterVm)}`);

    try {
      let ontoPageSearchList: IOntoPageSearch[] = await this.ontoPageSearchService.search(ontPageSearchFilterVm);
      // TODO: pagination

      let ontoPageSearchDtos: OntoPageSearchDto[] = automapper.map(
        MAPPING_TYPES.IOntoPageSearch,
        MAPPING_TYPES.OntoPageSearchDto,
        ontoPageSearchList
      );
      ontoPageSearchDtos = ontoPageSearchDtos.map((d: OntoPageSearchDto) => {
        return { ...d, title: generateTitle([d.keywords]).title };
      });
      // logger.info(`TemplateController:search: ontoPageSearchDtos = ${JSON.stringify(ontoPageSearchDto)}`);
      response.status(200).send(ontoPageSearchDtos);
    } catch (e: any) {
      logger.error(`TemplateController:search: error = ${JSON.stringify(e)}`);
      next(new SearchError(e.message));
    }
  }

  @ApiOperationGet({
    path: "/pages/{pageType}/{visType}",
    summary: "Fetch pages from ontology",
    description: "",
    parameters: {
      path: {
        pageType: {
          required: true,
          type: SwaggerDefinitionConstant.Parameter.Type.STRING,
        },
        visType: {
          required: true,
          type: SwaggerDefinitionConstant.Parameter.Type.STRING,
        },
      },
    },
    responses: {
      200: {}, // { model: "TODO",},
      400: {},
    },
  })
  @httpGet("/pages/:pageType/", queryParamValidate(OntoPageFilterVm))
  @httpGet("/pages/:pageType/:visType/", queryParamValidate(OntoPageFilterVm))
  public async getPages(request: Request, response: Response, next: NextFunction): Promise<void> {
    const pageType: PAGE_TYPE | "all" = request.params.pageType as any;
    const visType: VIS_TYPE | "all" = request.params.visType as any;
    const ontoPageFilterVm: OntoPageFilterVm = request.query as any;
    // prettier-ignore
    logger.info(`TemplateController:getPages: pageType=${pageType}, visType=${visType}, ontoPageFilterVm=${JSON.stringify(ontoPageFilterVm)}`);

    try {
      const result: PaginationVm<IOntoPage> = await this.ontoPageService.getPaginated(
        pageType,
        visType,
        ontoPageFilterVm
      );
      const ontoPageDtos: OntoPageDto[] = automapper.map(
        MAPPING_TYPES.IOntoPage,
        MAPPING_TYPES.OntoPageDto,
        result.data
      );

      const resultDto: PaginationVm<OntoPageExtDto> = {
        ...result,
        data: await this.templateService.resolvePagesExt(ontoPageDtos),
      };
      resultDto.data.sort((d1, d2) => d2.date.getTime() - d1.date.getTime());
      // logger.info(`TemplateController:getPages: pageDtos = ${JSON.stringify(resultDto.data.length)}`);
      response.status(200).send(resultDto);
    } catch (e: any) {
      logger.error(`TemplateController:getPages: error = ${JSON.stringify(e)}`);
      next(new SomethingWentWrong(e.message));
    }
  }

  @ApiOperationGet({
    path: "/pages/{pageId}",
    summary: "Fetch page template data from ontology",
    description: "",
    parameters: {
      path: {
        pageId: {
          required: true,
          type: SwaggerDefinitionConstant.Parameter.Type.STRING,
        },
      },
    },
    responses: {
      200: {}, // { model: "TODO",},
      400: {},
    },
  })
  @httpGet("/page/:pageId")
  public async getPageTemplate(request: Request, response: Response, next: NextFunction): Promise<void> {
    const pageId: string = request.params.pageId;
    logger.info(`TemplateController:getPageTemplate: pageId = ${pageId}`);

    try {
      const ontoPage: IOntoPage = await this.ontoPageService.get(pageId);
      const ontoPageDto: OntoPageDto = automapper.map(MAPPING_TYPES.IOntoPage, MAPPING_TYPES.OntoPageDto, ontoPage);
      const ontoPageExtDto: OntoPageExtDto = await this.templateService.resolvePageExtAndLinks(ontoPageDto);

      // logger.info(`TemplateController:getPageTemplate: ontoPageExtDto = ${JSON.stringify(ontoPageExtDto)}`);
      response.status(200).send(ontoPageExtDto);
    } catch (e: any) {
      logger.error(`TemplateController: getPageTemplate: error = ${JSON.stringify(e)}`);
      next(new SomethingWentWrong(e.message));
    }
  }

  @httpGet("/thumbnail/:pageId")
  public async getThumbnail(request: Request, response: Response, next: NextFunction): Promise<void> {
    const pageId = request.params.pageId;
    logger.debug(`TemplateController: getThumbnail: pageId = ${pageId}`);
    try {
      const result: IThumbnail = await this.thumbnailService.getThumbnail(pageId);
      // logger.debug(`TemplateController: getThumbnail: resultDto = ${result}`);
      response.status(200).send(result.thumbnail);
    } catch (error: any) {
      next(new SomethingWentWrong(error.message));
    }
  }

  @httpGet("/portal", JwtToken.verify)
  public async getPortalData(request: Request, response: Response, next: NextFunction): Promise<void> {
    const user: IUser = <IUser>request.user;
    const userId: string = user._id.toString();
    logger.debug(`TemplateController: getPortalData: userId = ${userId}`);

    try {
      const user: IUser = await this.userService.getUser(userId);
      const thumbnailDtos: ThumbnailDto[] = [];
      if (user?.bookmarks) {
        for (let pageId of user.bookmarks) {
          // for title
          const ontoPage: IOntoPage = await this.ontoPageService.get(pageId);
          const ontoPageDto: OntoPageDto = automapper.map(MAPPING_TYPES.IOntoPage, MAPPING_TYPES.OntoPageDto, ontoPage);
          const ontoPageExtDto: OntoPageExtDto = (await this.templateService.resolvePagesExt([ontoPageDto]))[0];

          // for image
          const thumbnail: IThumbnail = await this.thumbnailService.getThumbnail(pageId);
          let thumbnailDto: ThumbnailDto = automapper.map(
            MAPPING_TYPES.IThumbnail,
            MAPPING_TYPES.ThumbnailDto,
            thumbnail
          );
          thumbnailDto = { ...thumbnailDto, title: ontoPageExtDto?.title, id: pageId };
          thumbnailDtos.push(thumbnailDto);
        }
      }
      logger.debug("TemplateController: getPortalData: thumbnailDtos = " + JSON.stringify(thumbnailDtos));
      response.status(200).send(thumbnailDtos);
    } catch (error: any) {
      next(new SomethingWentWrong(error.message));
    }
  }
}
