import { Request } from 'express';
import { IUser } from '../infrastructure/entities/user.interface';

interface RequestWithUser extends Request {
  user?: IUser;
}

export { RequestWithUser }
