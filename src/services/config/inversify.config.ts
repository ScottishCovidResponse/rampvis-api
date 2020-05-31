import { Container } from 'inversify';
import 'reflect-metadata';

import { ActivityService } from '../implementations/activity.service';
import { UserService } from '../implementations/user.service';
import { IActivityService } from '../interfaces/activity.service.interface';
import { IUserService } from '../interfaces/user.service.interface';
import { TYPES } from './types';

const DIContainer = new Container();

DIContainer.bind<IUserService>(TYPES.IUserService).to(UserService);
DIContainer.bind<IActivityService>(TYPES.IActivityService).to(ActivityService);

export { DIContainer };
