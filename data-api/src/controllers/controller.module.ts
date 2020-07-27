import { AuthController } from './auth.controller';
import { UserController } from './user.controller';
import { BookmarkController } from './bookmark.controller';
import { ActivityControllerInt } from './activity.controller';
import { ScotlandNhsboardController } from './scotland/nhsboard/scotland.nhsboard.controller';
import { ScotlandCovidDeathsDataWeek } from './scotland/covid-deaths/data-week.controller';
import { NhsBoardController } from './scotland/nhs-board.controller';
import { NhsBoardDynamicController } from './scotland_dynamic/nhs-board.controller';
import { CovidDeathsController } from './scotland/covid-deaths.controller';
import { SearchController } from './scotland/search.controller';
import { ThumbnailController } from './thumbnail.controller';

export {
    AuthController,
    BookmarkController,
    UserController,
    ActivityControllerInt,
    ScotlandNhsboardController,     // TODO deprecate
    ScotlandCovidDeathsDataWeek,    // TODO deprecate
    NhsBoardController,
    NhsBoardDynamicController,
    CovidDeathsController,
    SearchController,
    ThumbnailController,
};
