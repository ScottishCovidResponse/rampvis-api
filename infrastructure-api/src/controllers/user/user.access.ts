import { AccessControl, Permission } from 'accesscontrol';
import { NextFunction, Response } from 'express';
import { AccessControlException } from '../../exceptions/exception';

import { IRequestWithUser } from '../../infrastructure/user/request-with-user.interface';

const grantObject = {
    user: {
        user: {
            'read:own': ['id'],
            'update:own': ['password'],
        },
    },
    admin: {
        user: {
            'read:own': ['id'],
            'update:any': ['password', 'role'],
            'read:any': ['*'],
            'create:any': ['*'],
            'delete:any': ['*'],
        },
    },
};

const ac = new AccessControl(grantObject);

export async function getUserGrants(role: string) {
    const grants = ac.getGrants();
    return grants[role];
}

export async function canReadAll(request: IRequestWithUser, response: Response, next: NextFunction) {
    try {
        const role = request!.user!.role;
        // First check if current role can read "ANY"  (ANY > OWN)
        const permission = ac.can(role).readAny('user');

        // Finally, execute the operation if allowed:
        if (!permission.granted) {
            next(new AccessControlException());
        }
        next();
    } catch (ex) {
        next(new AccessControlException());
    }
}

export async function canRead(request: IRequestWithUser, response: Response, next: NextFunction) {
    try {
        const role = request!.user!.role;
        // First check if current role can read "ANY"  (ANY > OWN)
        let permission = ac.can(role).readAny('user');

        // if not granted, check if current role can read "OWN"
        if (permission.granted === false) {
            // Determine whether the implied account (folder) is "owned" by the current user.
            if (request.params.id === request!.user!._id.toString()) {
                // We made sure that the implied resource is "owned" by this user.
                // Now we can ask AccessControl permission for performing  the action on the target resource:
                permission = ac.can(role).readOwn('user');
            }
        }

        // Finally, execute the operation if allowed:
        if (!permission.granted) {
            return next(new AccessControlException());
        }
        next();
    } catch (ex) {
        next(new AccessControlException());
    }
}

export async function canCreate(request: IRequestWithUser, response: Response, next: NextFunction) {
    try {
        const role = request!.user!.role;
        // First check if current role can create "ANY"  (ANY > OWN)
        const permission = ac.can(role).createAny('user');

        // Finally, execute the operation if allowed:
        if (!permission.granted) {
            return next(new AccessControlException());
        }
        next();
    } catch (ex) {
        next(new AccessControlException());
    }
}

export async function canDelete(request: IRequestWithUser, response: Response, next: NextFunction) {
    try {
        const role = request!.user!.role;
        // First check if current role can delete "ANY"  (ANY > OWN)
        const permission = ac.can(role).deleteAny('user');

        // Finally, execute the operation if allowed:
        if (!permission.granted) {
            return next(new AccessControlException());
        }
        next();
    } catch (ex) {
        next(new AccessControlException());
    }
}

export async function canUpdatePhone(request: IRequestWithUser, response: Response, next: NextFunction) {
    try {
        const attr: string = 'phone';
        const permission: Permission = canUpdateOwn(request);

        // Finally, execute the operation if allowed:
        if (!permission.granted) {
            return next(new AccessControlException());
        }

        // check if user can update attribute
        if (!permission.attributes.includes(attr)) {
            return next(new AccessControlException());
        }

        next();
    } catch (ex) {
        next(new AccessControlException());
    }
}

export async function canUpdatePassword(request: IRequestWithUser, response: Response, next: NextFunction) {
    try {
        const attr: string = 'password';
        const permission: Permission = canUpdateOwn(request);

        // Finally, execute the operation if allowed:
        if (!permission.granted) {
            return next(new AccessControlException());
        }

        // check if user can update attribute
        if (!permission.attributes.includes(attr)) {
            return next(new AccessControlException());
        }

        next();
    } catch (ex) {
        next(new AccessControlException());
    }
}

export async function canUpdateAll(request: IRequestWithUser, response: Response, next: NextFunction) {
    try {
        const role = request!.user!.role;
        // First check if current role can update "ANY"  (ANY > OWN)
        const permission = ac.can(role).updateAny('user');

        // Finally, execute the operation if allowed:
        if (!permission.granted) {
            next(new AccessControlException());
        }
        next();
    } catch (ex) {
        next(new AccessControlException());
    }
}

function canUpdateOwn(request: IRequestWithUser): Permission {
    const role = request!.user!.role;
    // First check if current role can update "ANY"  (ANY > OWN)
    let permission = ac.can(role).updateAny('user');

    // if not granted, check if current role can update "OWN"
    if (!permission.granted) {
        // Determine whether the implied account (folder) is "owned" by the current user.
        if (request.params.id === request!.user!._id.toString()) {
            // We made sure that the implied resource is "owned" by this user.
            // Now we can ask AccessControl permission for performing  the action on the target resource:
            permission = ac.can(role).updateOwn('user');
        }
    }

    return permission;
}
