import { NextFunction } from "connect";
import { Request, Response } from "express-serve-static-core";
import { controller, httpDelete, httpGet, httpPost, httpPut } from "inversify-express-utils";
import { inject } from "inversify";
import * as _ from "lodash";

import { logger } from "../../utils/logger";
import { TYPES } from "../../services/config/types";
import { queryParamValidate, vmValidate } from "../../middleware/validators";
import { JwtToken } from "../../middleware/jwt.token";
import { MAPPING_TYPES } from "../../services/config/automapper.config";
import { OntoPageVm } from "../../infrastructure/onto-page/onto-page.vm";
import { OntoPageService } from "../../services/onto-page.service";
import { IOntoPage, PAGE_TYPE } from "../../infrastructure/onto-page/onto-page.interface";
import { SomethingWentWrong } from "../../exceptions/exception";
import { OntoPageDto, OntoPageExtDto } from "../../infrastructure/onto-page/onto-page.dto";
import { OntoPageFilterVm, ONTOPAGE_SORT_BY } from "../../infrastructure/onto-page/onto-page-filter.vm";
import { PaginationVm } from "../../infrastructure/pagination.vm";
import { OntoVisService } from "../../services/onto-vis.service";
import { OntoDataService } from "../../services/onto-data.service";
import { ActivityService } from "../../services/activity.service";
import { IUser } from "../../infrastructure/user/user.interface";
import { ACTIVITY_TYPE, ACTIVITY_ACTION } from "../../infrastructure/activity/activity.interface";
import { UpdateOntoPageDataIdsVm } from "../../infrastructure/onto-page/update-onto-page-data-ids.vm";
import { UpdateOntoPageTypeVm } from "../../infrastructure/onto-page/update-onto-page-type.vm";
import { VIS_TYPE } from "../../infrastructure/onto-vis/onto-vis-type.enum";

@controller("/ontology", JwtToken.verify)
export class OntoPageController {
  constructor(
    @inject(TYPES.ActivityService) private activityService: ActivityService,
    @inject(TYPES.OntoPageService) private ontoPageService: OntoPageService,
    @inject(TYPES.OntoVisService) private ontoVisService: OntoVisService,
    @inject(TYPES.OntoDataService) private ontoDataService: OntoDataService
  ) {}

  @httpGet("/pages/:pageType/", queryParamValidate(OntoPageFilterVm))
  public async getPages(request: Request, response: Response, next: NextFunction): Promise<void> {
    // TODO: Review the onto-page.controller.ts
    const pageType: PAGE_TYPE = request.params.pageType as any;
    const ontoPageFilterVm: OntoPageFilterVm = request.query as any;
    // prettier-ignore
    logger.info(`OntoPageController:getPages: pageType=${pageType}, ontoPageFilterVm=${JSON.stringify(ontoPageFilterVm)}`);

    try {
      const result: PaginationVm<IOntoPage> = await this.ontoPageService.getPaginated(
        pageType,
        "all",
        ontoPageFilterVm
      );
      const ontoPageDtos: OntoPageDto[] = automapper.map(
        MAPPING_TYPES.IOntoPage,
        MAPPING_TYPES.OntoPageDto,
        result.data
      );
      const ontoPageExtDtos: OntoPageExtDto[] = [];
      for (let ontoPageDto of ontoPageDtos) {
        ontoPageExtDtos.push({
          ...ontoPageDto,
          vis: await this.ontoVisService.getOntoVisDto(ontoPageDto.visId),
          data: await this.ontoDataService.getOntoDataDtos(ontoPageDto.dataIds),
        });
      }

      // We are sorting by VIS function name.
      // Perhaps sort it in the service as part of database call after we fetch the extended data there.
      // TODO: Could be very slow!
      if (ontoPageFilterVm.sortBy === ONTOPAGE_SORT_BY.FUNCTION) {
        ontoPageExtDtos.sort((a: OntoPageExtDto, b: OntoPageExtDto) => {
          let comparison = 0;
          if (a.vis.function > b.vis.function) {
            comparison = 1;
          } else if (a.vis.function < b.vis.function) {
            comparison = -1;
          }
          return comparison;
        });
      }

      const resultDto: PaginationVm<OntoPageExtDto> = { ...result, data: ontoPageExtDtos };

      // logger.info(`OntoPageController:getPages: pageDtos = ${JSON.stringify(resultDto)}`);
      response.status(200).send(resultDto);
    } catch (e: any) {
      logger.error(`OntoPageController:getPages: error = ${JSON.stringify(e)}`);
      next(new SomethingWentWrong(e.message));
    }
  }

  @httpPost("/page", vmValidate(OntoPageVm))
  public async createPage(request: Request, response: Response, next: NextFunction): Promise<void> {
    const ontoPageVm: OntoPageVm = request.body as any;
    logger.info(`OntoPageController:createPage: dataVm = ${JSON.stringify(ontoPageVm)}`);

    try {
      const ontoPage: any = await this.ontoPageService.createPage(ontoPageVm);
      const ontoPageDto: OntoPageDto = automapper.map(MAPPING_TYPES.IOntoPage, MAPPING_TYPES.OntoPageDto, ontoPage);

      const user = request.user as IUser;
      await this.activityService.createActivity(
        user,
        ACTIVITY_TYPE.ONTO_PAGE,
        ACTIVITY_ACTION.CREATE,
        user._id.toString()
      );

      logger.info(`OntoPageController:createPage: ontoPageDto = ${JSON.stringify(ontoPageDto)}`);
      response.status(200).send(ontoPageDto);
    } catch (e: any) {
      logger.error(`OntoPageController:createPage: error = ${JSON.stringify(e)}`);
      next(new SomethingWentWrong(e.message));
    }
  }

  @httpPost("/pages", vmValidate(OntoPageVm))
  public async createPages(request: Request, response: Response, next: NextFunction): Promise<void> {
    const ontoPageVms: OntoPageVm[] = request.body as any;
    logger.info(`OntoPageController:createPages: ontoPageVms = ${JSON.stringify(ontoPageVms)}`);

    try {
      const res: any = await this.ontoPageService.createPages(ontoPageVms);

      const user = request.user as IUser;
      await this.activityService.createActivity(
        user,
        ACTIVITY_TYPE.ONTO_PAGES,
        ACTIVITY_ACTION.CREATE,
        user._id.toString()
      );

      logger.info(`OntoPageController:createPage: response = ${JSON.stringify(res)}`);
      response.status(200).send(res);
    } catch (e: any) {
      logger.error(`OntoPageController:createPage: error = ${JSON.stringify(e)}`);
      next(new SomethingWentWrong(e.message));
    }
  }

  @httpPut("/page/:pageId", vmValidate(OntoPageVm))
  public async updatePage(request: Request, response: Response, next: NextFunction): Promise<void> {
    const pageId: string = request.params.pageId;
    const ontoPageVm: OntoPageVm = request.body as any;
    logger.info(`OntoPageController:updatePage: pageId = ${pageId}, ontoPageVm = ${JSON.stringify(ontoPageVm)}`);

    try {
      const ontoPage: IOntoPage = await this.ontoPageService.updatePage(pageId, ontoPageVm);
      const ontoPageDto: OntoPageDto = automapper.map(MAPPING_TYPES.IOntoPage, MAPPING_TYPES.OntoPageDto, ontoPage);

      const user = request.user as IUser;
      await this.activityService.createActivity(
        user,
        ACTIVITY_TYPE.ONTO_PAGE,
        ACTIVITY_ACTION.UPDATE,
        user._id.toString()
      );

      logger.info(`OntoPageController:updatePage: ontoPageDto = ${JSON.stringify(ontoPageDto)}`);
      response.status(200).send(ontoPageDto);
    } catch (e: any) {
      logger.error(`OntoPageController:updatePage: error = ${JSON.stringify(e)}`);
      next(new SomethingWentWrong(e.message));
    }
  }

  @httpPut("/page/:pageId/data", vmValidate(UpdateOntoPageDataIdsVm))
  public async updatePageDataIds(request: Request, response: Response, next: NextFunction): Promise<void> {
    const pageId: string = request.params.pageId;
    const updateOntoPageDataVm: UpdateOntoPageDataIdsVm = request.body as any;
    logger.info(
      `OntoPageController:updatePageData: pageId = ${pageId}, updateOntoPageDataVm = ${JSON.stringify(
        updateOntoPageDataVm
      )}`
    );

    try {
      const res: any = await this.ontoPageService.updatePageDataIds(pageId, updateOntoPageDataVm.dataIds);

      const user = request.user as IUser;
      await this.activityService.createActivity(
        user,
        ACTIVITY_TYPE.ONTO_PAGE,
        ACTIVITY_ACTION.UPDATE,
        user._id.toString()
      );

      logger.info(`OntoPageController:updatePageData: ontoPageDto = ${JSON.stringify(res)}`);
      response.status(200).send(res);
    } catch (e: any) {
      logger.error(`OntoPageController:updatePageData: error = ${JSON.stringify(e)}`);
      next(new SomethingWentWrong(e.message));
    }
  }

  @httpPut("/page/:pageId/pagetype", vmValidate(UpdateOntoPageTypeVm))
  public async updatePageBindingType(request: Request, response: Response, next: NextFunction): Promise<void> {
    const pageId: string = request.params.pageId;
    const updateOntoPageBindingTypeVm: UpdateOntoPageTypeVm = request.body as any;
    logger.info(
      `OntoPageController:updatePageBindingType: pageId = ${pageId}, updateOntoPageBindingTypeVm = ${JSON.stringify(
        updateOntoPageBindingTypeVm
      )}`
    );

    try {
      const res: any = await this.ontoPageService.updatePageType(pageId, updateOntoPageBindingTypeVm.pageType);

      const user = request.user as IUser;
      await this.activityService.createActivity(
        user,
        ACTIVITY_TYPE.ONTO_PAGE,
        ACTIVITY_ACTION.UPDATE,
        user._id.toString()
      );

      logger.info(`OntoPageController:updatePageBindingType: ontoPageDto = ${JSON.stringify(res)}`);
      response.status(200).send(res);
    } catch (e: any) {
      logger.error(`OntoPageController:updatePageBindingType: error = ${JSON.stringify(e)}`);
      next(new SomethingWentWrong(e.message));
    }
  }

  @httpDelete("/page/:pageId")
  public async deletePage(request: Request, response: Response, next: NextFunction): Promise<void> {
    const pageId: string = request.params.pageId;
    logger.info(`OntoPageController:deletePage: pageId = ${pageId}`);

    try {
      const ontoPage: IOntoPage = await this.ontoPageService.delete(pageId);
      const ontoPageDto: OntoPageDto = automapper.map(MAPPING_TYPES.IOntoPage, MAPPING_TYPES.OntoPageDto, ontoPage);

      const user = request.user as IUser;
      await this.activityService.createActivity(
        user,
        ACTIVITY_TYPE.ONTO_PAGE,
        ACTIVITY_ACTION.DELETE,
        user._id.toString()
      );

      logger.info(`OntoPageController:deletePage: ontoPageDto = ${JSON.stringify(ontoPageDto)}`);
      response.status(200).send(ontoPageDto);
    } catch (e: any) {
      logger.error(`OntoPageController:deletePage: error = ${JSON.stringify(e)}`);
      next(new SomethingWentWrong(e.message));
    }
  }

  @httpGet("/page/:pageId")
  public async getOntoPageExt(request: Request, response: Response, next: NextFunction): Promise<void> {
    const pageId: string = request.params.pageId;
    logger.info(`OntoPageController:getOntoPageExt: pageId = ${JSON.stringify(pageId)}`);

    try {
      const ontoPage: IOntoPage = await this.ontoPageService.get(pageId);
      const ontoPageDto: OntoPageDto = automapper.map(MAPPING_TYPES.IOntoPage, MAPPING_TYPES.OntoPageDto, ontoPage);
      const ontoPageExtDto: OntoPageExtDto = {
        ...ontoPageDto,
        vis: await this.ontoVisService.getOntoVisDto(ontoPageDto.visId),
        data: await this.ontoDataService.getOntoDataDtos(ontoPageDto.dataIds),
      };
      logger.info(`OntoPageController:getOntoPageExt: ontoPageExtDto = ${JSON.stringify(ontoPageExtDto)}`);

      response.status(200).send(ontoPageExtDto);
    } catch (e: any) {
      logger.error(`OntoPageController:getBindings: error = ${JSON.stringify(e)}`);
      next(new SomethingWentWrong(e.message));
    }
  }
}
