import { NextFunction } from "connect";
import { Request, Response } from "express-serve-static-core";
import { controller, httpGet } from "inversify-express-utils";
import { inject } from "inversify";
import { readFileSync } from "fs";

import { logger } from "../../utils/logger";
import { TYPES } from "../../services/config/types";
import { OntoPageService } from "../../services/onto-page.service";
import { SomethingWentWrong } from "../../exceptions/exception";
import { ActivityService } from "../../services/activity.service";
import { OntoPageSearchService } from "../../services/onto-page-search.service";
import { IOntoPageSearch } from "../../infrastructure/onto-page/onto-page-search.interface";

interface INode {
  name: string;
  type: string;
  children: INode[];
  page?: IOntoPageSearch | null; // undefined when it was not searched
}

@controller("/dashboard") // , JwtToken.verify
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
      let hierarchyJSON = readFileSync("src/../../data/assets/uk-dashboard-hierarchy.json", "utf-8");
      this.root = JSON.parse(hierarchyJSON);
      let namingJSON = readFileSync("src/../../data/assets/uk-dashboard-visfunction-map.json", "utf-8");
      this.visFunctionMap = JSON.parse(namingJSON);
      this.getVisFunction = (type: string) => this.visFunctionMap[type];
    } catch (e) {
      logger.error(`DashboardLinking: error = ${JSON.stringify(e)}`);
      process.exit();
    }
  }

  @httpGet("/link")
  public async startLinking(request: Request, response: Response, next: NextFunction): Promise<void> {
    logger.info(`DashboardLinking:startLinking:`);

    try {
      logger.debug(`DashboardLinking:startLinking: ${this.root.type}, ${this.root.name}`);
      await this.traverse(this.root, this.root.children);

      response.status(200).send("success");
    } catch (e: any) {
      logger.error(`DashboardLinking:startLinking: error = ${JSON.stringify(e)}`);
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

    logger.debug(`${node.name} [c]-> ${children.map((d: any) => d.name)}`);
    logger.debug(`${node.page?._id} [c]-> ${children.map((d: any) => d.page?._id)}`);
  }

  private async addParent(nodes: INode[], parent: INode) {
    if (!(await this.searchPage(parent))) {
      return;
    }

    for (let d of nodes) {
      const page = await this.searchPage(d);
      page?._id && (await this.ontoPageService.updateParentPageId(page._id as string, parent.page?._id as string));
    }

    logger.debug(`${nodes.map((d: any) => `${parent.name} <-[p] ${d.name}`)}`);
    logger.debug(`${nodes.map((d: any) => `${parent.page?._id} <-[p] ${d.page?._id}`)}`);
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
        logger.error(`VISFunction = ${this.getVisFunction(node.type)}, keyword = ${node.name}... Num. of page found = 0.`);
      }
      // prettier-ignore
      logger.debug(`VISFunction = ${this.getVisFunction(node.type)}, keyword = ${node.name}... Num. of pages found = ${pages?.length}`);
    }
    return node?.page;
  }
}
