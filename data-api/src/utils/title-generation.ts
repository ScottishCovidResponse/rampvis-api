const SCOTLAND_COUNCILS = [
    'aberdeen_city',
    'aberdeenshire',
    'angus',
    'argyll_and_bute',
    'city_of_edinburgh',
    'clackmannanshire',
    'dumfries_and_galloway',
    'dundee_city',
    'east_ayrshire',
    'east_dunbartonshire',
    'east_lothian',
    'east_renfrewshire',
    'falkirk',
    'fife',
    'glasgow_city',
    'highland',
    'inverclyde',
    'midlothian',
    'moray',
    'na_h_eileanan_siar',
    'north_ayrshire',
    'north_lanarkshire',
    'orkney_islands',
    'perth_and_kinross',
    'renfrewshire',
    'scottish_borders',
    'shetland_islands',
    'south_ayrshire',
    'south_lanarkshire',
    'stirling',
    'west_dunbartonshire',
    'west_lothian',
];
const ENGLAND_COUNCILS = [
    'adur',
    'allerdale',
    'amber_valley',
    'arun',
    'ashfield',
    'ashford',
    'babergh',
    'barking_and_dagenham',
    'barnet',
    'barnsley',
    'barrow_in_furness',
    'basildon',
    'basingstoke_and_deane',
    'bassetlaw',
    'bath_and_north_east_somerset',
    'bedford',
    'bexley',
    'birmingham',
    'blaby',
    'blackburn_with_darwen',
    'blackpool',
    'blaenau_gwent',
    'bolsover',
    'bolton',
    'boston',
    'bournemouth,_christchurch_and_poole',
    'bracknell_forest',
    'bradford',
    'braintree',
    'breckland',
    'brent',
    'brentwood',
    'bridgend',
    'brighton_and_hove',
    'bristol,_city_of',
    'broadland',
    'bromley',
    'bromsgrove',
    'broxbourne',
    'broxtowe',
    'buckinghamshire',
    'burnley',
    'bury',
    'caerphilly',
    'calderdale',
    'cambridge',
    'camden',
    'cannock_chase',
    'canterbury',
    'cardiff',
    'carlisle',
    'carmarthenshire',
    'castle_point',
    'central_bedfordshire',
    'ceredigion',
    'charnwood',
    'chelmsford',
    'cheltenham',
    'cherwell',
    'cheshire_east',
    'cheshire_west_and_chester',
    'chesterfield',
    'chichester',
    'chorley',
    'city_of_london',
    'colchester',
    'conwy',
    'copeland',
    'corby',
    'cornwall',
    'cotswold',
    'county_durham',
    'coventry',
    'craven',
    'crawley',
    'croydon',
    'dacorum',
    'darlington',
    'dartford',
    'daventry',
    'denbighshire',
    'derby',
    'derbyshire_dales',
    'doncaster',
    'dorset',
    'dover',
    'dudley',
    'ealing',
    'east_cambridgeshire',
    'east_devon',
    'east_hampshire',
    'east_hertfordshire',
    'east_lindsey',
    'east_northamptonshire',
    'east_riding_of_yorkshire',
    'east_staffordshire',
    'east_suffolk',
    'eastbourne',
    'eastleigh',
    'eden',
    'elmbridge',
    'enfield',
    'epping_forest',
    'epsom_and_ewell',
    'erewash',
    'exeter',
    'fareham',
    'fenland',
    'flintshire',
    'folkestone_and_hythe',
    'forest_of_dean',
    'fylde',
    'gateshead',
    'gedling',
    'gloucester',
    'gosport',
    'gravesham',
    'great_yarmouth',
    'greenwich',
    'guildford',
    'gwynedd',
    'hackney',
    'halton',
    'hambleton',
    'hammersmith_and_fulham',
    'harborough',
    'haringey',
    'harlow',
    'harrogate',
    'harrow',
    'hart',
    'hartlepool',
    'hastings',
    'havant',
    'havering',
    'herefordshire,_county_of',
    'hertsmere',
    'high_peak',
    'hillingdon',
    'hinckley_and_bosworth',
    'horsham',
    'hounslow',
    'huntingdonshire',
    'hyndburn',
    'ipswich',
    'isle_of_anglesey',
    'isle_of_wight',
    'isles_of_scilly',
    'islington',
    'kensington_and_chelsea',
    'kettering',
    "king's_lynn_and_west_norfolk",
    'kingston_upon_hull,_city_of',
    'kingston_upon_thames',
    'kirklees',
    'knowsley',
    'lambeth',
    'lancaster',
    'leeds',
    'leicester',
    'lewes',
    'lewisham',
    'lichfield',
    'lincoln',
    'liverpool',
    'luton',
    'maidstone',
    'maldon',
    'malvern_hills',
    'manchester',
    'mansfield',
    'medway',
    'melton',
    'mendip',
    'merthyr_tydfil',
    'merton',
    'mid_devon',
    'mid_suffolk',
    'mid_sussex',
    'middlesbrough',
    'milton_keynes',
    'mole_valley',
    'monmouthshire',
    'neath_port_talbot',
    'new_forest',
    'newark_and_sherwood',
    'newcastle_under_lyme',
    'newcastle_upon_tyne',
    'newham',
    'newport',
    'north_devon',
    'north_east_derbyshire',
    'north_east_lincolnshire',
    'north_hertfordshire',
    'north_kesteven',
    'north_lincolnshire',
    'north_norfolk',
    'north_somerset',
    'north_tyneside',
    'north_warwickshire',
    'north_west_leicestershire',
    'northampton',
    'northumberland',
    'norwich',
    'nottingham',
    'nuneaton_and_bedworth',
    'oadby_and_wigston',
    'oldham',
    'oxford',
    'pembrokeshire',
    'pendle',
    'peterborough',
    'plymouth',
    'portsmouth',
    'powys',
    'preston',
    'reading',
    'redbridge',
    'redcar_and_cleveland',
    'redditch',
    'reigate_and_banstead',
    'rhondda_cynon_taf',
    'ribble_valley',
    'richmond_upon_thames',
    'richmondshire',
    'rochdale',
    'rochford',
    'rossendale',
    'rother',
    'rotherham',
    'rugby',
    'runnymede',
    'rushcliffe',
    'rushmoor',
    'rutland',
    'ryedale',
    'salford',
    'sandwell',
    'scarborough',
    'sedgemoor',
    'sefton',
    'selby',
    'sevenoaks',
    'sheffield',
    'shropshire',
    'slough',
    'solihull',
    'somerset_west_and_taunton',
    'south_cambridgeshire',
    'south_derbyshire',
    'south_gloucestershire',
    'south_hams',
    'south_holland',
    'south_kesteven',
    'south_lakeland',
    'south_norfolk',
    'south_northamptonshire',
    'south_oxfordshire',
    'south_ribble',
    'south_somerset',
    'south_staffordshire',
    'south_tyneside',
    'southampton',
    'southend_on_sea',
    'southwark',
    'spelthorne',
    'st._helens',
    'st_albans',
    'stafford',
    'staffordshire_moorlands',
    'stevenage',
    'stockport',
    'stockton_on_tees',
    'stoke_on_trent',
    'stratford_on_avon',
    'stroud',
    'sunderland',
    'surrey_heath',
    'sutton',
    'swale',
    'swansea',
    'swindon',
    'tameside',
    'tamworth',
    'tandridge',
    'teignbridge',
    'telford_and_wrekin',
    'tendring',
    'test_valley',
    'tewkesbury',
    'thanet',
    'three_rivers',
    'thurrock',
    'tonbridge_and_malling',
    'torbay',
    'torfaen',
    'torridge',
    'tower_hamlets',
    'trafford',
    'tunbridge_wells',
    'uttlesford',
    'vale_of_glamorgan',
    'vale_of_white_horse',
    'wakefield',
    'walsall',
    'waltham_forest',
    'wandsworth',
    'warrington',
    'warwick',
    'watford',
    'waverley',
    'wealden',
    'wellingborough',
    'welwyn_hatfield',
    'west_berkshire',
    'west_devon',
    'west_lancashire',
    'west_lindsey',
    'west_oxfordshire',
    'west_suffolk',
    'westminster',
    'wigan',
    'wiltshire',
    'winchester',
    'windsor_and_maidenhead',
    'wirral',
    'woking',
    'wokingham',
    'wolverhampton',
    'worcester',
    'worthing',
    'wrexham',
    'wychavon',
    'wyre',
    'wyre_forest',
    'york',
];
const COUNCILS = SCOTLAND_COUNCILS.concat(ENGLAND_COUNCILS);
const REGIONS = [
    'ayrshire_and_arran',
    'borders',
    'dumfries_and_galloway',
    'fife',
    'forth_valley',
    'grampian',
    'greater_glasgow_and_clyde',
    'highland',
    'lanarkshire',
    'lothian',
    'orkney',
    'shetland',
    'tayside',
    'western_isles',
];
const COUNTRIES = ['england', 'scotland', 'wales'];
const LOCATIONS = COUNCILS.concat(REGIONS).concat(COUNTRIES);
const TOPICS = [
    'vaccination',
    'all_deaths',
    'covid_deaths',
    'tests_carried_out',
    'people_tested',
    'hospital_confirmed',
    'icu_confirmed',
    'tests_reported',
    'new_cases',
    'hospital_admission',
    'cumulative_cases',
    'case_trends',
];
const TIMES = ['daily', 'weekly', 'model', 'correlation'];
const GROUPS = [
    'place_of_death',
    'all_sexes_agegroups',
    'all_boards',
    'all_local_authorities',
    'age_group',
    'location_type',
];
const TYPES = ['cumulative'];
const MODELS = ['eera'];

import nameMappings from './name_mapping.json';
const NAME_MAPPINGS: { [key: string]: any } = nameMappings;

function findKeyword(keywords: string[], checkList: string[]): string | null {
    // Return the keyword in the check list.
    for (const c of checkList) {
        if (keywords.includes(c)) {
            return c;
        }
    }
    return null;
}

function upLevel(loc: string): string {
    if (SCOTLAND_COUNCILS.includes(loc)) return 'scotland';
    if (ENGLAND_COUNCILS.includes(loc)) return 'england';
    if (REGIONS.includes(loc)) return 'scotland';
    return '';
}

function maxLoc(locs: string[]): string | null {
    locs = Array.from(new Set(locs));
    for (const loc of locs) {
        if (COUNTRIES.includes(loc)) {
            return locs.length === 1 ? loc : 'Global';
        }
    }
    for (const loc of locs) {
        if (REGIONS.includes(loc)) {
            return locs.length === 1 ? loc : upLevel(loc);
        }
    }
    for (const loc of locs) {
        if (COUNCILS.includes(loc)) {
            return locs.length === 1 ? loc : upLevel(loc);
        }
    }
    return null;
}

function sameKeyword(keywords: (string | null)[]): string | null {
    if (new Set(keywords).size === 1) {
        return keywords[0];
    }
    return null;
}

function generateTitle(keywordsList: string[][]): string {
    const locs = [];
    const times = [];
    const topics = [];
    const groups = [];
    const types = [];
    const models = [];
    for (const keywords of keywordsList) {
        let loc = findKeyword(keywords, LOCATIONS);
        if (loc === null) {
            throw new Error(keywords.toString() + ' location missing');
        }
        locs.push(loc);

        let time = findKeyword(keywords, TIMES);
        if (time === null) {
            throw new Error(keywords.toString() + ' should have daily, weekly, model, correlation');
        }
        times.push(time);

        let topic = findKeyword(keywords, TOPICS);
        if (topic === null) {
            throw new Error(keywords.toString() + ' topic missing');
        }
        topics.push(topic);

        const group = findKeyword(keywords, GROUPS);
        groups.push(group);

        const type = findKeyword(keywords, TYPES);
        types.push(type);

        const model = findKeyword(keywords, MODELS);
        models.push(model);
    }

    // Single stream
    if (keywordsList.length === 1) {
        return combineToTitle(locs[0], times[0], topics[0], groups[0], types[0], models[0]);
    }

    // Multiple streams
    return combineToTitle(
        maxLoc(locs),
        sameKeyword(times),
        sameKeyword(topics),
        sameKeyword(groups),
        sameKeyword(types),
        sameKeyword(models)
    );
}

function combineToTitle(
    loc: string | null,
    time: string | null,
    topic: string | null,
    group: string | null,
    type: string | null,
    model: string | null
) {
    if (topic === null) {
        return getNameMapping(loc);
    }
    let result = '';
    if (model === null) {
        if (time === null) {
            result = `${getNameMapping(loc)} - ${getNameMapping(topic)}`;
        }
        if (loc && time && topic) {
            result = `${getNameMapping(loc)} - ${getNameMapping(time)} ${getNameMapping(topic)}`;
        }
    } else {
        result = `${getNameMapping(loc)} - ${getNameMapping(time)} ${getNameMapping(model)} ${getNameMapping(topic)}`;
    }

    if (group !== null) {
        result += ` by ${getNameMapping(group)}`;
    }
    if (type !== null) {
        result += ' (cumulative)';
    }
    return result;
}

function getNameMapping(key: string | null): string {
    if (key === null) return '';

    if (key in NAME_MAPPINGS) {
        return NAME_MAPPINGS[key];
    }
    return key.replace('_', ' ');
}

export default generateTitle;
