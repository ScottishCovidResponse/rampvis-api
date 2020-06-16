import * as bcrypt from 'bcryptjs';
import "reflect-metadata";
import config from 'config';
import { injectable, inject } from "inversify";
import { ObjectId, FilterQuery } from 'mongodb';

import { IUser } from "../../infrastructure/entities/user.interface";
import { UserDto } from "../../infrastructure/dto/user.dto";
import { UpdateUserDto } from '../../infrastructure/dto/updateUser.dto';
import { TYPES } from '../config/types';
import { IUserService } from '../interfaces/user.service.interface';
import { DbClient } from '../../infrastructure/db/mongodb.connection';
import { DataService } from '../data.service';
import { UserPasswordDoesNotMatchException, RedundantUpdateErrorException, ObjectNotFoundException } from '../../exceptions/exception';
import { ACCOUNT_ROLES } from '../../infrastructure/entities/account.interface';
import { ERROR_CODES } from '../../exceptions/error.codes';


@injectable()
export class UserService extends DataService<IUser> implements IUserService {
    public constructor(
        @inject(TYPES.DbClient) dbClient: DbClient,
    ) {
        super(
            dbClient,
            config.get('mongodb.internal.db'),
            config.get('mongodb.internal.collection.users')
        );
    }


    async getAllUsers(): Promise<Array<IUser>> {
        return await this.getAll();
    }


    async getUsers(ids: Array<string>): Promise<Array<IUser>> {
        const objectIds: Array<ObjectId> = ids.map(d => new ObjectId(d));
        return await this.getAll({ _id: { "$in": objectIds } } as FilterQuery<IUser>);
    }


    async getUser(id: string): Promise<IUser> {
        const user: IUser = await this.get({ _id: new ObjectId(id) } as FilterQuery<IUser>);

        if(!user) {
            throw new ObjectNotFoundException(ERROR_CODES.USER_NOT_FOUND);
        }

        return user;
    }
    

    // Filter deleted user on login
    async getLoggedInUser(email: string): Promise<IUser> {
        console.log('getLoggedInUser: email = ', email);
        return await this.get({ email: email, deleted: { $in: [null, false] } } as FilterQuery<IUser>);
    }

    
    isUser(accountRole: ACCOUNT_ROLES): boolean {
        return accountRole === ACCOUNT_ROLES.ADMIN
            || accountRole === ACCOUNT_ROLES.USER
            || accountRole === ACCOUNT_ROLES.DEVELOPER;
    }
    

    async findByEmail(email: string): Promise<IUser> {
        return await this.get({ email: email } as FilterQuery<IUser>);
    }


    async saveUser(userDto: UserDto): Promise<IUser> {
        const hashedPassword = await bcrypt.hash(userDto.password as string, 10);
        const user: IUser = {
            _id: new ObjectId(),
            name: userDto.name,
            createdAt: new Date(),
            email: userDto.email,
            phone: userDto.phone,
            role: userDto.role,
            password: hashedPassword,
            expireOn: userDto.expireOn ? new Date(userDto.expireOn) : new Date(new Date().setFullYear(new Date().getFullYear() + 30)),
            address: userDto.address,
            deleted: false
        };

        return await this.save(user);
    }


    async updatePassword(id: string, oldPassword: string, newPassword: string): Promise<IUser> {
        const user: IUser = await this.getUser(id);

        const isPasswordMatching = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordMatching) {
            throw new UserPasswordDoesNotMatchException();
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const result: IUser = await this.updateAndGet(id, { password: hashedPassword } as IUser);

        return result;
    }


    async updatePhone(id: string, phone: string): Promise<IUser> {
        const user: IUser = await this.getUser(id);
        if (!user) {
            throw new ObjectNotFoundException(ERROR_CODES.USER_NOT_FOUND);
        }

        const result: IUser = await this.updateAndGet(id, { phone: phone } as IUser);

        return result;
    }


    async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<IUser> {
        const user: IUser = await this.getUser(id);
        const updateUser: IUser = {} as IUser;

        if (updateUserDto.phone && user.phone !== updateUserDto.phone) {
            updateUser.phone = updateUserDto.phone;
        }

        if (updateUserDto.role && user.role !== updateUserDto.role) {
            updateUser.role = updateUserDto.role;
        }

        if (updateUserDto.password) {
            const isPasswordMatching = await bcrypt.compare(updateUserDto.password, user.password);
            if (!isPasswordMatching) {
                updateUser.password = await bcrypt.hash(updateUserDto.password, 10);
            }
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


    async getUserSubscriptionTopics(): Promise<Array<string>> {
        const topics: Array<string> = [];
        // TODO
        return topics;
    }

}
