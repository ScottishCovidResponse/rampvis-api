import SCOTLAND_COUNCILS from '../../../data/assets/scotland_councils.json';
import ENGLAND_COUNCILS from '../../../data/assets/england_councils.json';
import UTLA_NAMES from '../../../data/assets/utla_codes.json';
import MSOA_NAMES from '../../../data/assets/msoa_codes.json';
import SCOTLAND_REGIONS from '../../../data/assets/scotland_regions.json';
import TOPICS from '../../../data/assets/topics.json';

const COUNCILS = SCOTLAND_COUNCILS.concat(ENGLAND_COUNCILS);
const COUNTRIES = ['uk', 'england', 'scotland', 'wales'];
const NATIONS = ['e92000001', 'n92000002', 's92000003', 'w92000004'];
const LOCATIONS = COUNCILS.concat(SCOTLAND_REGIONS).concat(COUNTRIES).concat(UTLA_NAMES).concat(MSOA_NAMES).concat(NATIONS);

const TIMES = ['daily', 'weekly', 'model', 'correlation'];
const GROUPS = ['place_of_death', 'all_sexes_agegroups', 'all_boards', 'all_local_authorities', 'age_group', 'location_type'];
const TYPES = ['cumulative'];
const MODELS = ['eera'];

import nameMappings from '../../../data/assets/name_mapping.json';
const NAME_MAPPINGS: { [key: string]: any } = nameMappings;

import { logger } from "../utils/logger";

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
    if (NATIONS.includes(loc)) return 'uk';
    if (SCOTLAND_COUNCILS.includes(loc)) return 'scotland';
    if (ENGLAND_COUNCILS.includes(loc)) return 'england';
    if (SCOTLAND_REGIONS.includes(loc)) return 'scotland';
    return '';
}

function maxLoc(locs: string[]): string | null {
    locs = Array.from(new Set(locs));
    for (const loc of locs) {
        if (COUNTRIES.includes(loc)) {
            return locs.length === 1 ? loc : 'UK';
        }
    }
    for (const loc of locs) {
        if (NATIONS.includes(loc)) {
            return locs.length === 1 ? loc : 'UK';
        }
    }
    for (const loc of locs) {
        if (SCOTLAND_REGIONS.includes(loc)) {
            return locs.length === 1 ? loc : upLevel(loc);
        }
    }
    for (const loc of locs) {
        if (COUNCILS.includes(loc)) {
            return locs.length === 1 ? loc : upLevel(loc);
        }
    }
    for (const loc of locs) {
        if (UTLA_NAMES.includes(loc)) {
            return locs.length === 1 ? loc : upLevel(loc);
        }
    }
    for (const loc of locs) {
        if (MSOA_NAMES.includes(loc)) {
            return locs.length === 1 ? loc : upLevel(loc);
        }
    }

    logger.error(`generateTitle, maxLoc(), loc is null, locs=${locs}`);
    return null;
}

function sameKeyword(keywords: (string | null)[]): string | null {
    if (new Set(keywords).size === 1) {
        return keywords[0];
    }
    return null;
}

function generateTitle(keywordsList: string[][]): { location: string, title: string } {
    logger.info("generateTitle: keywordsList = ", keywordsList.map(d => d));

    const locs = [];
    const times = [];
    const topics = [];
    const groups = [];
    const types = [];
    const models = [];
    for (const keywords of keywordsList) {
        let loc = findKeyword(keywords, LOCATIONS);
        if (loc === null) {
            logger.error(`generateTitle: keywords = ${keywords}, loc is null`);
            return { location: "", title: '[keywords error] location missing' };
        }
        locs.push(loc);

        let time = findKeyword(keywords, TIMES);
        // 18.01.2022: I think it's ok to not have topic, especially in dashboard
        // if (time === null) {
        //     logger.warning(`generateTitle: keywords = ${keywords}, time is null`);
        //     return { location: "", title: '[keywords error] should have daily, weekly, model, correlation'};
        // }
        times.push(time);

        let topic = findKeyword(keywords, TOPICS);
        // 18.01.2022: I think it's ok to not have topic, especially in dashboard
        // if (topic === null) {
        //     logger.error(`generateTitle: keywords = ${keywords}, topic is null`);
        //     return { location: "", title: '[keywords error] topic missing' };
        // }
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
) : { location: string, title: string } {
    let result = '';

    if (topic === null) {
        result = getNameMapping(loc);
    }

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

    return { location:loc as string, title:result };
}

function getNameMapping(key: string | null): string {
    if (key === null) return '';

    if (key in NAME_MAPPINGS) {
        return NAME_MAPPINGS[key];
    }
    return key.replace('_', ' ');
}

export default generateTitle;
