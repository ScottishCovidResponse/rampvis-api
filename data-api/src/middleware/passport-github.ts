import passport from 'passport';
import config from 'config';

import { Strategy } from 'passport-github2'
import {UserService} from "../services/user.service";
import {DIContainer} from "../services/config/inversify.config";
import {TYPES} from "../services/config/types";
import {IUser} from "../infrastructure/entities/user.interface";

// Use the Strategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.

export const configureGithubStrategy = () => {
    passport.use(
        new Strategy(
            { // TODO in config
                clientID: config.get('github.clientId'),
                clientSecret: config.get('github.clientSecret'),
                callbackURL: config.get('github.callbackUrl')
            },
            async (token: string, tokenSecret: string, profile: any, done: (...args: any[]) => any) => {
                try {
                    // find the user by github id
                    const userService: UserService = DIContainer.get<UserService>(TYPES.UserService);
                    const user: IUser = await userService.getGitHubUser(profile.id);

                    console.log('configureGithubStrategy: github profile = ', profile, ', existing user = ', user);

                    // user exists in database
                    if (user) {
                        return done(null, user);
                    }

                    // user does not exist in database
                    const newUser: IUser = await userService.saveGitHubUser({
                        githubId : profile.id,
                        githubUsername: profile.username,
                        name: profile.name,
                    });
                    console.log('configureGithubStrategy: create new user = ', newUser);

                    done(null, newUser);
                } catch (err) {
                    console.error(err);
                    return done(err);
                }
            }
        )
    );
};
