import { Container } from "inversify";
import "reflect-metadata";

import { ActivityService } from "../activity.service";
import { CSVService } from "../csv.service";
import { ThumbnailService } from "../thumbnail.service";
import { UserService } from "../user.service";
import { OntoDataService } from "../onto-data.service";
import { OntoPageService } from "../onto-page.service";
import { OntoVisService } from "../onto-vis.service";
import { OntoDataSearchService } from "../onto-data-search.service";
import { OntoVisSearchService } from "../onto-vis-search.service";
import { OntoPageSearchService } from "../onto-page-search.service";
import { TemplateService } from "../template.service";

import { TYPES } from "./types";

const DIContainer = new Container();

DIContainer.bind<CSVService>(TYPES.CSVService).to(CSVService);
DIContainer.bind<UserService>(TYPES.UserService).to(UserService);
DIContainer.bind<ActivityService>(TYPES.ActivityService).to(ActivityService);
DIContainer.bind<ThumbnailService>(TYPES.ThumbnailService).to(ThumbnailService);
DIContainer.bind<OntoVisService>(TYPES.OntoVisService).to(OntoVisService);
DIContainer.bind<OntoDataService>(TYPES.OntoDataService).to(OntoDataService);
DIContainer.bind<OntoPageService>(TYPES.OntoPageService).to(OntoPageService);
DIContainer.bind<OntoDataSearchService>(TYPES.OntoDataSearchService).to(OntoDataSearchService);
DIContainer.bind<OntoVisSearchService>(TYPES.OntoVisSearchService).to(OntoVisSearchService);
DIContainer.bind<OntoPageSearchService>(TYPES.OntoPageSearchService).to(OntoPageSearchService);
DIContainer.bind<TemplateService>(TYPES.TemplateService).to(TemplateService);

export { DIContainer };
