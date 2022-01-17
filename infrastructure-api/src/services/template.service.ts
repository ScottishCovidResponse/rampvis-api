import config from "config";
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
import "reflect-metadata";

import { DbClient } from "../infrastructure/db/mongodb.connection";
import { logger } from "../utils/logger";
import { TYPES } from "./config/types";
import { DataService } from "./data.service";
import { IOntoVis } from "../infrastructure/onto-vis/onto-vis.interface";
import { ILink } from "../infrastructure/onto-page/link.interface";
import { IOntoPage, PAGE_TYPE } from "../infrastructure/onto-page/onto-page.interface";
import { OntoVisService } from "./onto-vis.service";
import { OntoPageService } from "./onto-page.service";
import { OntoPageDto } from "../infrastructure/onto-page/onto-page.dto";
import { OntoPageExtDto } from "../infrastructure/onto-page/onto-page.dto";
import generateTitle from "../utils/title-generation";
import { OntoDataService } from "./onto-data.service";
import { OntoDataDto } from "../infrastructure/onto-data/onto-data.dto";
import hierarchyTree from "../../../data/assets/uk-dashboard-hierarchy.json";
import visFunctionMap from "../../../data/assets/uk-dashboard-visfunction-map.json";
import { OntoPageSearchService } from "./onto-page-search.service";
import { IOntoPageSearch } from "../infrastructure/onto-page/onto-page-search.interface";

interface INode {
  name: string;
  type: string;
  children?: INode[];
  siblings?: string[];
}

@provide(TYPES.TemplateService)
export class TemplateService extends DataService<any> {
  tree: INode;
  inVisFunctionMap: any;
  visFunctionMap: any;

  public constructor(
    @inject(TYPES.DbClient) dbClient: DbClient,
    @inject(TYPES.OntoVisService) private ontoVisService: OntoVisService,
    @inject(TYPES.OntoDataService) private ontoDataService: OntoDataService,
    @inject(TYPES.OntoPageService) private ontoPageService: OntoPageService,
    @inject(TYPES.OntoPageSearchService) private ontoPageSearchService: OntoPageSearchService
  ) {
    super(dbClient, config.get("mongodb.db"), config.get("mongodb.collection.thumbnails"));

    try {
      this.tree = hierarchyTree;
      this.visFunctionMap = new Map(Object.entries(visFunctionMap));
      this.inVisFunctionMap = (d: string) => Array.from(this.visFunctionMap.values()).includes(d);
    } catch (e) {
      logger.error(`DashboardLinking: error = ${JSON.stringify(e)}`);
      process.exit();
    }
  }

  public async resolvePagesExt(ontoPageDtos: OntoPageDto[]): Promise<OntoPageExtDto[]> {
    const ontoPageExtDtos: OntoPageExtDto[] = [];

    for (let d of ontoPageDtos) {
      const ontoData: OntoDataDto[] = await this.ontoDataService.getOntoDataDtos(d.dataIds);

      ontoPageExtDtos.push({
        ...d,
        vis: await this.ontoVisService.getOntoVisDto(d.visId),
        data: ontoData,
        title: generateTitle(Object.values(ontoData).map((d) => d?.keywords)).title,
      });
    }

    return ontoPageExtDtos;
  }

  public async resolvePageExtAndLinks(ontoPageDto: OntoPageDto) {
    // link of each data stream
    const ontoDataDtos: OntoDataDto[] = await this.ontoDataService.getOntoDataDtos(ontoPageDto.dataIds);
    const ontoDataDtoAndLinks: OntoDataDto[] = await Promise.all(
      ontoDataDtos.map(async (d: OntoDataDto) => {
        const ontoPages: IOntoPage[] = await this.ontoPageService.getPagesBindingDataId(d.id);
        const links: ILink[] = await this.resolveDatastraemLinks(ontoPages);

        return { ...d, links };
      })
    );

    const { location, title } = generateTitle(Object.values(ontoDataDtos).map((d) => d.keywords));

    const ontoPageExtDto: OntoPageExtDto = {
      ...ontoPageDto,
      vis: await this.ontoVisService.getOntoVisDto(ontoPageDto.visId),
      data: ontoDataDtoAndLinks,
      title: title,
    };

    // propagated links
    if (ontoPageDto?.pageIds) {
      ontoPageExtDto.propagatedLinks = await this.resolvePropagatedLinks(ontoPageDto?.pageIds);
    }

    // parent/children links
    const { parentLink, childrenLinks } =
      (await this.resolveNeighborhoodLinks(location, ontoPageExtDto.vis.function)) || {};
    if (parentLink) {
      ontoPageExtDto.parentLink = parentLink;
    }
    if (childrenLinks && childrenLinks.length > 0) {
      ontoPageExtDto.childrenLinks = childrenLinks;
    }

    // TODO neighborLinks

    return ontoPageExtDto;
  }

  public async resolveDatastraemLinks(ontoPages: IOntoPage[]): Promise<ILink[]> {
    const pageLinks: ILink[] = await Promise.all(
      ontoPages.map(async (d: IOntoPage) => {
        const ontoVis: IOntoVis = await this.ontoVisService.get(d.visId);
        return { pageId: d._id.toString(), name: ontoVis.function };
      })
    );
    return pageLinks;
  }

  public async resolvePropagatedLinks(pageIds: string[]): Promise<ILink[]> {
    const pageLinks: ILink[] = await Promise.all(
      pageIds.map(async (d: string) => {
        const ontoPage: IOntoPage = await this.ontoPageService.get(d);
        const ontoVis: IOntoVis = await this.ontoVisService.get(ontoPage.visId);
        return { pageId: ontoPage._id.toString(), name: ontoVis.function };
      })
    );
    return pageLinks;
  }

  private async resolveNeighborhoodLinks(location: string, visFunction: string): Promise<any> {
    // prettier-ignore
    logger.debug(`TemplateService:resolveNeighborhoodLinks: search visFunction = ${visFunction}, location = ${location}`);
    if (!this.inVisFunctionMap(visFunction)) return;

    const { parent, current, children } = this.searchTree(null, this.tree, location) || {};
    const parentLink = parent && (await this.searchPage(parent));
    const childrenLinks = children && (await this.searchPage(children));

    return { parentLink, childrenLinks };
  }

  private async resolveNeighborLinks() {}

  private searchTree(parent: INode | null, current: INode, matchingTitle: string): any {
    if (current.name.toLocaleLowerCase() == matchingTitle.toLocaleLowerCase()) {
      return { parent: parent, current: current, children: current?.children, siblings: current?.siblings };
    } else if (current.children != null) {
      let i;
      let result = null;
      for (i = 0; result == null && i < current.children.length; i++) {
        result = this.searchTree(current, current.children[i], matchingTitle);
      }
      return result;
    }
    return null;
  }

  private async searchPage(node: INode | INode[]) {
    const search = async (node: INode): Promise<ILink> => {
      const pages: IOntoPageSearch[] = await this.ontoPageSearchService.searchPage(
        this.visFunctionMap.get(node.type),
        node.name
      );
      return pages && { name: node.name, pageId: pages[0]?._id.toString() };
    };

    if (node && Array.isArray(node)) {
      return await Promise.all(
        node.map((d) => {
          return search(d);
        })
      );
    }

    if (node) {
      return search(node);
    }

    return null;
  }
}
