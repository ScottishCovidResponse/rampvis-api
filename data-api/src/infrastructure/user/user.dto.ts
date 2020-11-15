import { ROLES } from './roles.enum';

export class UserDto {
    public id: string = '';
    public name: string = '';
    public email: string = '';
    public createdAt: Date = undefined as any;
    public expireOn: Date = undefined as any;
    public role: ROLES = undefined as any;
    public deleted: boolean = undefined as any;

    public githubId?: string = '';
    public githubUsername?: string = '';
}
