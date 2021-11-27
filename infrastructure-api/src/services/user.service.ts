import * as bcrypt from 'bcryptjs';
import 'reflect-metadata';
import config from 'config';
import { inject } from 'inversify';
import { ObjectId, Filter } from 'mongodb';
import { provide } from 'inversify-binding-decorators';

import { IUser } from '../infrastructure/user/user.interface';
import { UserVm } from '../infrastructure/user/user.vm';
import { UpdateUserVm } from '../infrastructure/user/update-user.vm';
import { TYPES } from './config/types';
import { DbClient } from '../infrastructure/db/mongodb.connection';
import { DataService } from './data.service';
import {
    UserPasswordDoesNotMatchException,
    RedundantUpdateErrorException,
    ObjectNotFoundException,
} from '../exceptions/exception';
import { ERROR_CODES } from '../exceptions/error.codes';
import { logger } from '../utils/logger';
import { ROLES } from '../infrastructure/user/roles.enum';

@provide(TYPES.UserService)
export class UserService extends DataService<IUser> {
    public constructor(@inject(TYPES.DbClient) dbClient: DbClient) {
        super(dbClient, config.get('mongodb.db'), config.get('mongodb.collection.users'));
    }

    //
    // GitHub user
    //

    async getGitHubUser(githubId: string): Promise<IUser> {
        return await this.get({ githubId: githubId } as Filter<IUser>);
    }

    async saveGitHubUser(userDto: UserVm): Promise<IUser> {
        const user: IUser = {
            _id: new ObjectId(),
            createdAt: new Date(),
            role: userDto.role || ROLES.USER,
            githubId: userDto.githubId,
            githubUsername: userDto.githubUsername,
        };

        return await this.create(user);
    }

    async getUser(id: string): Promise<IUser> {
        const user: IUser = await this.get({ _id: new ObjectId(id) } as Filter<IUser>);

        if (!user) {
            logger.debug(`UserService: getUser: throw`);
            throw new ObjectNotFoundException(ERROR_CODES.USER_NOT_FOUND);
        }
        return user;
    }

    //
    // email/pass user
    // TODO refactor
    //

    async getAllUsers(): Promise<Array<IUser>> {
        return await this.getAll();
    }

    async getUsers(ids: Array<string>): Promise<Array<IUser>> {
        const objectIds: Array<ObjectId> = ids.map((d) => new ObjectId(d));
        return await this.getAll({ _id: { $in: objectIds } } as Filter<IUser>);
    }

    // Filter deleted user on login
    async getLoggedInUser(email: string): Promise<IUser> {
        return await this.get({ email: email, deleted: { $in: [null, false] } } as Filter<IUser>);
    }

    isUser(accountRole: ROLES): boolean {
        return accountRole === ROLES.ADMIN || accountRole === ROLES.USER;
    }

    async findByEmail(email: string): Promise<IUser> {
        return await this.get({ email: email } as Filter<IUser>);
    }

    async saveUser(userDto: UserVm): Promise<IUser> {
        const hashedPassword = await bcrypt.hash(userDto.password as string, 10);
        const user: IUser = {
            _id: new ObjectId(),
            name: userDto.name,
            createdAt: new Date(),
            email: userDto.email,
            role: userDto.role || ROLES.USER,
            password: hashedPassword,
            expireOn: userDto.expireOn
                ? new Date(new Date(userDto.expireOn).toISOString())
                : new Date(new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString()),
            deleted: false,
        };

        return await this.create(user);
    }

    async updatePassword(id: string, oldPassword: string, newPassword: string): Promise<IUser> {
        const user: IUser = await this.getUser(id);

        const isPasswordMatching = await bcrypt.compare(oldPassword, user.password as string);
        if (!isPasswordMatching) {
            throw new UserPasswordDoesNotMatchException();
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const result: IUser = await this.updateAndGet(id, { password: hashedPassword } as IUser);

        return result;
    }

    async updateUser(id: string, updateUserVm: UpdateUserVm): Promise<IUser> {
        const user: IUser = await this.getUser(id);
        const updateUser: IUser = {} as IUser;

        if (updateUserVm.role && user.role !== updateUserVm.role) {
            updateUser.role = updateUserVm.role;
        }

        if (updateUserVm.password && user.password) {
            const isPasswordMatching = await bcrypt.compare(updateUserVm.password, user.password);
            if (!isPasswordMatching) {
                updateUser.password = await bcrypt.hash(updateUserVm.password, 10);
            }
        }

        if (new Date(updateUserVm?.expireOn).getTime() !== new Date(user?.expireOn as any).getTime()) {
            updateUser.expireOn = new Date(new Date(updateUserVm.expireOn).toISOString());
        }

        if (Object.entries(updateUser).length === 0) {
            throw new RedundantUpdateErrorException();
        }

        const result: IUser = await this.updateAndGet(id, updateUser);
        return result;
    }

    async enableOrDisableUser(id: string): Promise<IUser> {
        const user: IUser = await this.getUser(id);
        const updateUser: IUser = {} as IUser;
        updateUser.deleted = !user.deleted;

        const result: IUser = await this.updateAndGet(id, updateUser);

        return result;
    }

    async bookmarkPage(userId: string, pageId: string): Promise<IUser> {
        const user: IUser = await this.getUser(userId);
        const result = await this.getDbCollection().updateOne(
            { _id: new ObjectId(userId) },
            { $addToSet: { bookmarks: pageId } }
        );

        return await this.getUser(userId);
    }

    async unbookmarkPage(userId: string, pageId: string): Promise<IUser> {
        const user: IUser = await this.getUser(userId);
        const result = await this.getDbCollection().updateOne(
            { _id: new ObjectId(userId) },
            { $pull: { bookmarks: pageId } }
        );

        return await this.getUser(userId);
    }
}
