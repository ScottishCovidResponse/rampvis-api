import 'automapper-ts';
import { ActivityDto } from '../../infrastructure/activity/activity.dto';
import { DataDto } from '../../infrastructure/ontology/data.dto';
import { VisDto } from '../../infrastructure/ontology/vis.dto';
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

    IVis: 'IVis',
    VisDto: 'VisDto',
    IData: 'IData',
    DataDto: 'DataDto',
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
        .createMap(MAPPING_TYPES.IVis, MAPPING_TYPES.VisDto)
        .forMember('id', (opts: AutoMapperJs.IMemberConfigurationOptions) => opts.mapFrom('_id'))
        .convertToType(VisDto);

    automapper
        .createMap(MAPPING_TYPES.IData, MAPPING_TYPES.DataDto)
        .forMember('id', (opts: AutoMapperJs.IMemberConfigurationOptions) => opts.mapFrom('_id'))
        .convertToType(DataDto);
}

export { configureAutoMapper, MAPPING_TYPES };
