import { UpdateUserDto } from '../../infrastructure/dto/updateUser.dto';
import { UserDto } from '../../infrastructure/dto/user.dto';
import { ACCOUNT_ROLES } from '../../infrastructure/entities/account.interface';
import { IUser } from '../../infrastructure/entities/user.interface';
import { IService } from '../service.interface';

export interface IUserService extends IService<IUser> {
    getAllUsers(): Promise<IUser[]>;
    getUsers(ids: string[]): Promise<IUser[]>;
    getUser(id: string): Promise<IUser>;
    getLoggedInUser(email: string): Promise<IUser>;
    isUser(role: ACCOUNT_ROLES): boolean;
    findByEmail(email: string): Promise<IUser>;
    saveUser(userDto: UserDto): Promise<IUser>;
    updatePassword(id: string, oldPassword: string, newPassword: string): Promise<IUser>;
    updatePhone(id: string, phone: string): Promise<IUser>;
    updateUser(id: string, updateUserDto: UpdateUserDto): Promise<IUser>;
    enableOrDisableUser(id: string): Promise<IUser>;
    getUserSubscriptionTopics(): Promise<string[]>;
}
