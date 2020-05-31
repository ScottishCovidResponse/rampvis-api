import { NextFunction, Response } from 'express';
import { AccessControl } from 'accesscontrol';

import { RequestWithUser } from '../auth/requestWithUser.interface';
import { AccessControlException } from '../../../exceptions/exception';


const grantObject = {
  guest: {
    activity: {
      "read:any": ['*']
    }
  },
  user: {
    activity: {
      "read:any": ['*']
    }
  },
  admin: {
    activity: {
      "read:any": ['*']
    }
  }
};

const ac = new AccessControl(grantObject);

export async function getActivityGrants(role: string) {
  var grants = ac.getGrants();
  return grants[role];
}


export async function canReadAll(request: RequestWithUser, response: Response, next: NextFunction) {
  const role = request!.user!.role;
  // First check if current role can read "ANY"  (ANY > OWN)
  let permission = ac.can(role).readAny('activity');

  // Finally, execute the operation if allowed:
  if (!permission.granted) {
    next(new AccessControlException());
  }
  next();
}
