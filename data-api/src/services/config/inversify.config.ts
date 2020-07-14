import { Container } from 'inversify';
import 'reflect-metadata';

import { TYPES } from './types';
import {UserService} from "../user.service";
import {ActivityService} from "../activity.service";
import {BookmarkService} from "../bookmark.service";
import {SearchService} from "../search.service";
import {CSVService} from "../csv.service";

const DIContainer = new Container();

DIContainer.bind<CSVService>(TYPES.CSVService).to(CSVService);
DIContainer.bind<UserService>(TYPES.UserService).to(UserService);
DIContainer.bind<ActivityService>(TYPES.ActivityService).to(ActivityService);
DIContainer.bind<BookmarkService>(TYPES.BookmarkService).to(BookmarkService);
DIContainer.bind<SearchService>(TYPES.SearchService).to(SearchService);

export { DIContainer };
