import config from 'config';

import { DbClient } from '../infrastructure/db/mongodb.connection';
import { ACCOUNT_ROLES } from '../infrastructure/entities/account.interface';
import { IAddress } from '../infrastructure/entities/address.interface';
import { IUser } from '../infrastructure/entities/user.interface';
import { DIContainer } from '../services/config/inversify.config';
import { TYPES } from '../services/config/types';

export class DbSeeder {

    private dbClient: DbClient;

    constructor() {
        this.dbClient = DIContainer.get<DbClient>(TYPES.DbClient);
    }

    public async initDatabase() {

        const users: IUser[] = [
            {
                name: 'Admin User',
                email: 'admin@test.com',
                createdAt: new Date(),
                phone: '000',
                role: ACCOUNT_ROLES.ADMIN,
                password: '$2b$10$Y/9ddj4mEYwP8hRhphlqPOL7yMKuZB/V5FbDkMCUP.xG9zFF1Hwp2',
                address: {
                    street: '100 Street',
                    city: 'London',
                    country: 'UK',
                    zip: 'W0 AB',
                    alpha2Code: 'GB',
                } as IAddress,
            } as IUser,
        ];

        const userDbContext = this.dbClient.db(config.get('mongodb.internal.db')).collection<IUser>(config.get('mongodb.internal.collection.users'));
        await userDbContext.insertMany(users);
    }
}


