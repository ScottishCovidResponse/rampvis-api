import 'automapper-ts';

const MAPPING_TYPES = {
    IBookmark: 'IBookmark',
    BookmarkDto: 'BookmarkDto',

    IUser: 'IUser',
    UserDto: 'UserDto',

    IActivity: 'IActivity',
    ActivityDto: 'ActivityDto',

    MongoDbObjectId: 'MongoDbObjectId',
    TsString: 'TsString',
};

function configureAutoMapper() {
    automapper.createMap(MAPPING_TYPES.IBookmark, MAPPING_TYPES.BookmarkDto)
        .forMember('id', (opts: AutoMapperJs.IMemberConfigurationOptions) => opts.mapFrom('_id'))
        .forMember('thumbnail', (opts: AutoMapperJs.IMemberConfigurationOptions) => {
            console.log(opts.sourceObject.thumbnail)
            if (opts.sourceObject.thumbnail === null)
                return '';
            else {
                return opts.sourceObject.thumbnail;
            }
        })

    automapper.createMap(MAPPING_TYPES.IUser, MAPPING_TYPES.UserDto)
        .forMember('id', (opts: AutoMapperJs.IMemberConfigurationOptions) => opts.mapFrom('_id'))
        .forMember('password', (opts: AutoMapperJs.IMemberConfigurationOptions) => opts.ignore())
    // .ignoreAllNonExisting();

    automapper.createMap(MAPPING_TYPES.IActivity, MAPPING_TYPES.ActivityDto)
        .forMember('id', (opts: AutoMapperJs.IMemberConfigurationOptions) => opts.mapFrom('_id'));

    // MongoDb ObjectId to string
    automapper
        .createMap(MAPPING_TYPES.MongoDbObjectId, MAPPING_TYPES.TsString)
        .forMember('_id', (opts: AutoMapperJs.IMemberConfigurationOptions) => opts.sourceObject._id.toString());
}

export {configureAutoMapper, MAPPING_TYPES};
