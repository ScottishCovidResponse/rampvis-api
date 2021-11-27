import { Logger } from 'winston';

type IsOriginAllowed = (origin: string | undefined) => boolean;

/**
 * This function accepts a list of allowed origins (hosts) and returns a function
 * that can check a given origin.
 *
 * Wildcard matching is supported for origin endings.
 *
 * Example values:
 *     ✅ example.com
 *     ✅ demo.example.com
 *     ✅ *.example.com
 *     ✅ *--demo.example.com
 *     ✅ *example.com
 *     ✅ 42.42.42.42
 *
 * Invalid values in the list of allowedOrigins are ignored with a warning.
 *     🗑 ExAmple.COM
 *     🗑 example.*
 *     🗑     example  .  com
 *     🗑 demo.*.example.com
 *     🗑 42 (number)
 *     🗑 null
 *     🗑 {}
 */
export function generateIsOriginAllowed(allowedOrigins: unknown, logger?: Logger): IsOriginAllowed {
    const allowedOriginLookup: Record<string, true> = {};
    const allowedOriginEndingLookup: Record<string, true> = {};

    if (!Array.isArray(allowedOrigins)) {
        logger?.warn('Expected allowedOrigins to be an array. Allowing all origins.');
        return () => true;
    }

    for (const allowedOrigin of allowedOrigins) {
        if (typeof allowedOrigin !== 'string') {
            logger?.warn(`Ignoring allowedOrigins → ${allowedOrigin} (expected a string)`);
            continue;
        }

        const normalisedAllowedOrigin = allowedOrigin.replace(/\s/g, '').toLowerCase();
        if (!normalisedAllowedOrigin.length) {
            logger?.warn(`Ignoring allowedOrigins → "${allowedOrigin}" (expected a non-empty string)`);
            continue;
        }

        if (normalisedAllowedOrigin !== allowedOrigin) {
            logger?.warn(
                `Ignoring allowedOrigins → "${allowedOrigin}" (expected a normalised string: "${normalisedAllowedOrigin}")`
            );
            continue;
        }

        // TODO: improve host matching if needed, e.g. by using
        // https://github.com/validatorjs/validator.js/blob/master/src/lib/isFQDN.js

        if (!normalisedAllowedOrigin.includes('*')) {
            if (allowedOriginLookup[normalisedAllowedOrigin]) {
                logger?.warn(`Duplicate value in allowedOrigins: "${allowedOrigin}"`);
            } else {
                allowedOriginLookup[normalisedAllowedOrigin] = true;
            }
            continue;
        }

        if (normalisedAllowedOrigin.lastIndexOf('*') !== 0) {
            logger?.warn(
                `Ignoring allowedOrigins → "${allowedOrigin}" (only values like "*.example.com" or "*--demo.example.com" are supported)`
            );
            continue;
        }

        const normalisedAllowedOriginEnding = normalisedAllowedOrigin.substring(1);
        if (normalisedAllowedOrigin) {
            logger?.warn(`Duplicate value in allowedOrigins: "${allowedOrigin}"`);
        } else {
            allowedOriginEndingLookup[normalisedAllowedOriginEnding] = true;
        }
    }

    const allowedOriginEndings = Object.keys(allowedOriginEndingLookup);

    if (!allowedOriginEndings.length && !Object.keys(allowedOriginLookup).length) {
        logger?.warn('No valid values found in allowedOrigins. Allowing all origins.');
        return () => true;
    }

    return (origin) => {
        // Allow requests with no origin, e.g., like mobile apps or curl requests
        if (!origin) {
            return true;
        }

        // Exact match
        if (allowedOriginLookup[origin]) {
            return true;
        }

        // Ending match
        for (const allowedOriginEnding of allowedOriginEndings) {
            if (origin.endsWith(allowedOriginEnding)) {
                return true;
            }
        }

        // No match
        return false;
    };
}
