import { Container } from 'inversify';
import 'reflect-metadata';

import { ActivityService } from '../activity.service';
import { BookmarkService } from '../bookmark.service';
import { CSVService } from '../csv.service';
import { SearchServiceV05 } from '../search.service.v0.5';
import { ThumbnailService } from '../thumbnail.service';
import { UserService } from '../user.service';
import { OntoDataService } from '../onto-data.service';
import { OntoPageService } from '../onto-page.service';
import { OntoVisService } from '../onto-vis.service';
import { OntoDataSearchService } from '../onto-data-search.service';
import { OntoVisSearchService } from '../onto-vis-search.service';
import { OntoPageSearchService } from '../onto-page-search.service';

import { TYPES } from './types';

const DIContainer = new Container();

DIContainer.bind<CSVService>(TYPES.CSVService).to(CSVService);
DIContainer.bind<UserService>(TYPES.UserService).to(UserService);
DIContainer.bind<ActivityService>(TYPES.ActivityService).to(ActivityService);
DIContainer.bind<BookmarkService>(TYPES.BookmarkService).to(BookmarkService);
DIContainer.bind<ThumbnailService>(TYPES.ThumbnailService).to(ThumbnailService);
DIContainer.bind<SearchServiceV05>(TYPES.SearchServiceV05).to(SearchServiceV05);
DIContainer.bind<OntoVisService>(TYPES.OntoVisService).to(OntoVisService);
DIContainer.bind<OntoDataService>(TYPES.OntoDataService).to(OntoDataService);
DIContainer.bind<OntoPageService>(TYPES.OntoPageService).to(OntoPageService);
DIContainer.bind<OntoDataSearchService>(TYPES.OntoDataSearchService).to(OntoDataSearchService);
DIContainer.bind<OntoVisSearchService>(TYPES.OntoVisSearchService).to(OntoVisSearchService);
DIContainer.bind<OntoPageSearchService>(TYPES.OntoPageSearchService).to(OntoPageSearchService);

export { DIContainer };
