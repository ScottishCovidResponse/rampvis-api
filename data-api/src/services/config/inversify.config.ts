import { Container } from 'inversify';
import 'reflect-metadata';

import { TYPES } from './types';
import {UserService} from "../user.service";
import {ActivityService} from "../activity.service";
import {BookmarkService} from "../bookmark.service";

const DIContainer = new Container();

DIContainer.bind<UserService>(TYPES.UserService).to(UserService);
DIContainer.bind<ActivityService>(TYPES.ActivityService).to(ActivityService);
DIContainer.bind<BookmarkService>(TYPES.BookmarkService).to(BookmarkService);

export { DIContainer };
