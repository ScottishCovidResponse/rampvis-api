import { Request } from 'express';
import { IUser } from './user.interface';

interface RequestWithUser extends Request {
  user?: IUser;
}

export { RequestWithUser }
