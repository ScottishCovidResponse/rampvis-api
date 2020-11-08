import { Container } from 'inversify';
import 'reflect-metadata';

import { ActivityService } from '../activity.service';
import { BookmarkService } from '../bookmark.service';
import { CSVService } from '../csv.service';
import { OntologyDataService } from '../ontology-data.service';
import { OntologyPageService } from '../ontology-page.service';
import { OntologyVisService } from '../ontology-vis.service';
import { SearchService } from '../search.service';
import { ThumbnailService } from '../thumbnail.service';
import { UserService } from '../user.service';
import { TYPES } from './types';

const DIContainer = new Container();

DIContainer.bind<CSVService>(TYPES.CSVService).to(CSVService);
DIContainer.bind<UserService>(TYPES.UserService).to(UserService);
DIContainer.bind<ActivityService>(TYPES.ActivityService).to(ActivityService);
DIContainer.bind<BookmarkService>(TYPES.BookmarkService).to(BookmarkService);
DIContainer.bind<ThumbnailService>(TYPES.ThumbnailService).to(ThumbnailService);
DIContainer.bind<SearchService>(TYPES.SearchService).to(SearchService);
DIContainer.bind<OntologyVisService>(TYPES.OntologyVisService).to(OntologyVisService);
DIContainer.bind<OntologyDataService>(TYPES.OntologyDataService).to(OntologyDataService);
DIContainer.bind<OntologyPageService>(TYPES.OntologyPageService).to(OntologyPageService);

export { DIContainer };
