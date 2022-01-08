//
// We are resolving links in runtime, so this file can be deleted later on
//
import { NextFunction } from "connect";
import { Request, Response } from "express-serve-static-core";
import { controller, httpGet } from "inversify-express-utils";
import { inject } from "inversify";

import { logger } from "../../utils/logger";
import { TYPES } from "../../services/config/types";
import { OntoPageService } from "../../services/onto-page.service";
import { SomethingWentWrong } from "../../exceptions/exception";
import { ActivityService } from "../../services/activity.service";
import { OntoPageSearchService } from "../../services/onto-page-search.service";
import { IOntoPageSearch } from "../../infrastructure/onto-page/onto-page-search.interface";
import { JwtToken } from "../../middleware/jwt.token";
import hierarchyJSON from "../../../../data/assets/uk-dashboard-hierarchy.json";
import visFunctionMap from "../../../../data/assets/uk-dashboard-visfunction-map.json";

interface INode {
  name: string;
  type: string;
  children: INode[];
  page?: IOntoPageSearch | null; // undefined when it was not searched
}

@controller("/dashboard", JwtToken.verify)
export class DashboardLinking {
  root: INode;
  visFunctionMap: any;
  getVisFunction: any;

  constructor(
    @inject(TYPES.ActivityService) private activityService: ActivityService,
    @inject(TYPES.OntoPageService) private ontoPageService: OntoPageService,
    @inject(TYPES.OntoPageSearchService) private ontoPageSearchService: OntoPageSearchService
  ) {
    try {
      this.root = hierarchyJSON;
      this.visFunctionMap = visFunctionMap;
      this.getVisFunction = (type: string) => this.visFunctionMap[type];
    } catch (e) {
      logger.error(`DashboardLinking: error = ${JSON.stringify(e)}`);
      process.exit();
    }
  }

  @httpGet("/link")
  public async link(request: Request, response: Response, next: NextFunction): Promise<void> {
    logger.info(`DashboardLinking:link: root = ${this.root}`);

    try {
      await this.traverse(this.root, this.root.children);
      response.status(200).send("success");
    } catch (e: any) {
      logger.error(`DashboardLinking:link: error = ${JSON.stringify(e)}`);
      next(new SomethingWentWrong(e.message));
    }
  }

  public async traverse(node: INode, children: INode[]) {
    await this.addChildren(node, children);
    await this.addParent(children, node);
    for (let d of children) {
      if (!d.children || d.children.length === 0) {
        return;
      } else {
        await this.traverse(d, d.children);
      }
    }
  }

  private async addChildren(node: INode, children: INode[]) {
    if (!(await this.searchPage(node))) {
      return;
    }

    const childrenIds: string[] = [];
    for (let d of children) {
      const page = await this.searchPage(d);
      page?._id && childrenIds.push(page._id as string);
    }

    await this.ontoPageService.updateChildrenPageIds(node.page?._id as string, childrenIds);

    logger.debug(`DashboardLinking: ${node.name} -[c]-> ${children.map((d: any) => d.name)}`);
    logger.debug(`DashboardLinking: ${node.page?._id} -[c]-> ${children.map((d: any) => d.page?._id)}`);
  }

  private async addParent(nodes: INode[], parent: INode) {
    if (!(await this.searchPage(parent))) {
      return;
    }

    for (let d of nodes) {
      const page = await this.searchPage(d);
      page?._id && (await this.ontoPageService.updateParentPageId(page._id as string, parent.page?._id as string));
    }

    logger.debug(`DashboardLinking: ${nodes.map((d: any) => `${parent.name} <-[p]- ${d.name}`)}`);
    logger.debug(`DashboardLinking: ${nodes.map((d: any) => `${parent.page?._id} <-[p]- ${d.page?._id}`)}`);
  }

  private async searchPage(node: INode) {
    if (node.page === undefined) {
      const pages: IOntoPageSearch[] = await this.ontoPageSearchService.searchPage(
        this.getVisFunction(node.type),
        node.name
      );

      if (pages && pages[0]) {
        node.page = pages[0];
      } else {
        node.page = null;
        // prettier-ignore
        logger.error(`DashboardLinking: VIS = ${this.getVisFunction(node.type)}, keyword = ${node.name} > found = 0.`);
      }
      // prettier-ignore
      logger.debug(`DashboardLinking: VIS = ${this.getVisFunction(node.type)}, keyword = ${node.name} > found = ${pages?.length}`);
    }
    return node?.page;
  }
}
