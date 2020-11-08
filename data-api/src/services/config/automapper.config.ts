import 'automapper-ts';
import { ActivityDto } from '../../infrastructure/activity/activity.dto';
import { OntoDataDto } from '../../infrastructure/onto-data/onto-data.dto';
import { OntoVisDto } from '../../infrastructure/onto-vis/onto-vis.dto';
import { UserDto } from '../../infrastructure/user/user.dto';

const MAPPING_TYPES = {
    IBookmark: 'IBookmark',
    BookmarkDto: 'BookmarkDto',

    IUser: 'IUser',
    UserDto: 'UserDto',

    IActivity: 'IActivity',
    ActivityDto: 'ActivityDto',

    MongoDbObjectId: 'MongoDbObjectId',
    TsString: 'TsString',

    IOntoVis: 'IOntoVis',
    OntoVisDto: 'OntoVisDto',
    IOntoData: 'IOntoData',
    OntoDataDto: 'OntoDataDto',
};

function configureAutoMapper() {
    // MongoDb ObjectId to string
    automapper
        .createMap(MAPPING_TYPES.MongoDbObjectId, MAPPING_TYPES.TsString)
        .forMember('_id', (opts: AutoMapperJs.IMemberConfigurationOptions) => opts.sourceObject._id.toString());

    automapper
        .createMap(MAPPING_TYPES.IBookmark, MAPPING_TYPES.BookmarkDto)
        .forMember('id', (opts: AutoMapperJs.IMemberConfigurationOptions) => opts.mapFrom('_id'))
        .forMember('thumbnail', (opts: AutoMapperJs.IMemberConfigurationOptions) =>
            opts.sourceObject.thumbnail === null ? '' : opts.sourceObject.thumbnail,
        );

    automapper
        .createMap(MAPPING_TYPES.IUser, MAPPING_TYPES.UserDto)
        .forMember('id', (opts: AutoMapperJs.IMemberConfigurationOptions) => opts.mapFrom('_id'))
        .forMember('password', (opts: AutoMapperJs.IMemberConfigurationOptions) => opts.ignore())
        .convertToType(UserDto);

    automapper
        .createMap(MAPPING_TYPES.IActivity, MAPPING_TYPES.ActivityDto)
        .forMember('id', (opts: AutoMapperJs.IMemberConfigurationOptions) => opts.sourceObject._id.toString())
        .convertToType(ActivityDto);

    automapper
        .createMap(MAPPING_TYPES.IOntoVis, MAPPING_TYPES.OntoVisDto)
        .forMember('id', (opts: AutoMapperJs.IMemberConfigurationOptions) => opts.mapFrom('_id'))
        .convertToType(OntoVisDto);

    automapper
        .createMap(MAPPING_TYPES.IOntoData, MAPPING_TYPES.OntoDataDto)
        .forMember('id', (opts: AutoMapperJs.IMemberConfigurationOptions) => opts.mapFrom('_id'))
        .forMember('query_params', (opts: AutoMapperJs.IMemberConfigurationOptions) => opts.mapFrom('query_params'))
        .convertToType(OntoDataDto);
}

export { configureAutoMapper, MAPPING_TYPES };
