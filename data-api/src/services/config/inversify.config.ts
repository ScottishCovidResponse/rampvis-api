import { Container } from 'inversify';
import 'reflect-metadata';

import { ActivityService } from '../activity.service';
import { BookmarkService } from '../bookmark.service';
import { CSVService } from '../csv.service';
import { SearchService } from '../search.service';
import { TemplateService } from '../template.service';
import { ThumbnailService } from '../thumbnail.service';
import { UserService } from '../user.service';
import { OntoDataService } from '../onto-data.service';
import { OntoPageService } from '../onto-page.service';
import { OntoVisService } from '../onto-vis.service';
import { TYPES } from './types';

const DIContainer = new Container();

DIContainer.bind<CSVService>(TYPES.CSVService).to(CSVService);
DIContainer.bind<UserService>(TYPES.UserService).to(UserService);
DIContainer.bind<ActivityService>(TYPES.ActivityService).to(ActivityService);
DIContainer.bind<BookmarkService>(TYPES.BookmarkService).to(BookmarkService);
DIContainer.bind<ThumbnailService>(TYPES.ThumbnailService).to(ThumbnailService);
DIContainer.bind<SearchService>(TYPES.SearchService).to(SearchService);
DIContainer.bind<OntoVisService>(TYPES.OntoVisService).to(OntoVisService);
DIContainer.bind<OntoDataService>(TYPES.OntoDataService).to(OntoDataService);
DIContainer.bind<OntoPageService>(TYPES.OntoPageService).to(OntoPageService);
DIContainer.bind<TemplateService>(TYPES.TemplateService).to(TemplateService);

export { DIContainer };
