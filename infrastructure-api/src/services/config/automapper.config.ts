import 'automapper-ts';
import { OntoPageDto } from '../../infrastructure/onto-page/onto-page.dto';
import { ActivityDto } from '../../infrastructure/activity/activity.dto';
import { OntoDataDto } from '../../infrastructure/onto-data/onto-data.dto';
import { OntoVisDto, OntoVisSearchDto } from '../../infrastructure/onto-vis/onto-vis.dto';
import { UserDto } from '../../infrastructure/user/user.dto';
import { splitKeywordsString, splitPageIndexKeywordsString } from '../../utils/helper';
import { OntoDataSearchDto } from '../../infrastructure/onto-data/onto-data-search.dto';
import { OntoDataSearchGroupDto } from '../../infrastructure/onto-data/onto-data-search-group.dto';
import { OntoPageSearchDto } from '../../infrastructure/onto-page/onto-page-search.dto';

const MAPPING_TYPES = {
    IThumbnail: 'IThumbnail',
    ThumbnailDto: 'ThumbnailDto',

    IUser: 'IUser',
    UserDto: 'UserDto',

    IActivity: 'IActivity',
    ActivityDto: 'ActivityDto',

    MongoDbObjectId: 'MongoDbObjectId',
    TsString: 'TsString',

    IOntoVis: 'IOntoVis',
    OntoVisDto: 'OntoVisDto',
    IOntoVisSearch: 'IOntoVisSearch',
    OntoVisSearchDto: 'OntoVisSearchDto',

    IOntoData: 'IOntoData',
    OntoDataDto: 'OntoDataDto',
    IOntoDataSearch: 'IOntoDataSearch',
    OntoDataSearchDto: 'OntoDataSearchDto',
    IOntoDataSearchGroup: 'IOntoDataSearchGroup',
    OntoDataSearchGroupDto: 'OntoDataSearchGroupDto',

    IOntoPageSearch: 'IOntoPageSearch',
    OntoPageSearchDto: 'OntoPageSearchDto',

    IOntoPage: 'IOntoPage',
    OntoPageDto: 'OntoPageDto',
};

function configureAutoMapper() {
    // MongoDb ObjectId to string
    automapper
        .createMap(MAPPING_TYPES.MongoDbObjectId, MAPPING_TYPES.TsString)
        .forMember('_id', (opts: AutoMapperJs.IMemberConfigurationOptions) => opts.sourceObject._id.toString());

    automapper
        .createMap(MAPPING_TYPES.IThumbnail, MAPPING_TYPES.ThumbnailDto)
        .forMember('id', (opts: AutoMapperJs.IMemberConfigurationOptions) => opts.mapFrom('_id'))
        .forMember('thumbnail', (opts: AutoMapperJs.IMemberConfigurationOptions) =>
            opts.sourceObject.thumbnail === null ? '' : opts.sourceObject.thumbnail
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
        .createMap(MAPPING_TYPES.IOntoVisSearch, MAPPING_TYPES.OntoVisSearchDto)
        .forMember('id', (opts: AutoMapperJs.IMemberConfigurationOptions) => opts.mapFrom('_id'))
        .forMember('score', (opts: AutoMapperJs.IMemberConfigurationOptions) => opts.mapFrom('_score'))
        .convertToType(OntoVisSearchDto);

    automapper
        .createMap(MAPPING_TYPES.IOntoData, MAPPING_TYPES.OntoDataDto)
        .forMember('id', (opts: AutoMapperJs.IMemberConfigurationOptions) => opts.mapFrom('_id'))
        .forMember('keywords', (opts: AutoMapperJs.IMemberConfigurationOptions) => {
            return splitKeywordsString(opts.sourceObject.keywords);
        })
        .convertToType(OntoDataDto);

    automapper
        .createMap(MAPPING_TYPES.IOntoDataSearch, MAPPING_TYPES.OntoDataSearchDto)
        .forMember('id', (opts: AutoMapperJs.IMemberConfigurationOptions) => opts.mapFrom('_id'))
        .forMember('score', (opts: AutoMapperJs.IMemberConfigurationOptions) => opts.mapFrom('_score'))
        .forMember('keywords', (opts: AutoMapperJs.IMemberConfigurationOptions) => {
            return splitKeywordsString(opts.sourceObject.keywords);
        })
        .convertToType(OntoDataSearchDto);

    automapper
        .createMap(MAPPING_TYPES.IOntoDataSearchGroup, MAPPING_TYPES.OntoDataSearchGroupDto)
        //.forMember('score', (opts: AutoMapperJs.IMemberConfigurationOptions) => opts.mapFrom('_score'))
        .forMember('groups', (opts: AutoMapperJs.IMemberConfigurationOptions) => {
            return automapper.map(MAPPING_TYPES.IOntoData, MAPPING_TYPES.OntoDataDto, opts.sourceObject.groups);
        })
        .convertToType(OntoDataSearchGroupDto);

    automapper
        .createMap(MAPPING_TYPES.IOntoPage, MAPPING_TYPES.OntoPageDto)
        .forMember('id', (opts: AutoMapperJs.IMemberConfigurationOptions) => opts.mapFrom('_id'))
        .convertToType(OntoPageDto);

    automapper
        .createMap(MAPPING_TYPES.IOntoPageSearch, MAPPING_TYPES.OntoPageSearchDto)
        .forMember('id', (opts: AutoMapperJs.IMemberConfigurationOptions) => opts.mapFrom('_id'))
        .forMember('score', (opts: AutoMapperJs.IMemberConfigurationOptions) => opts.mapFrom('_score'))
        .forMember('keywords', (opts: AutoMapperJs.IMemberConfigurationOptions) => {
            return splitPageIndexKeywordsString(opts.sourceObject.keywords);
        })
        .convertToType(OntoPageSearchDto);
}

export { configureAutoMapper, MAPPING_TYPES };
