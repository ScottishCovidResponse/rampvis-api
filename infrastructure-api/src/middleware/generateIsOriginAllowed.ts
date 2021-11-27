import { Logger } from 'winston';

type IsOriginAllowed = (originRegex: string | undefined) => boolean;

/**
 * This function accepts a stringified regex of the origin and returns a function
 * that can check a given origin.
 *
 * Note that ^ and $ are automatically applied to the value to match the whole string.
 *
 * @example
 *     "https://example\.com" (same as "^https://example\.com$")
 *     ✅ https://example.com
 *     ⏹ https://www.example.com
 *     ⏹ https://demo.example.com
 *     ⏹ https://example.com.oops
 *     ⏹ http://example.com
 *
 *     "https?://(hello|world)\.example\.com"
 *     ✅ http://hello.example.com
 *     ✅ http://world.example.com
 *     ✅ https://hello.example.com
 *     ✅ https://world.example.com
 *     ⏹ http://example.com
 *     ⏹ https://example.com
 */
export function generateIsOriginAllowed(allowedOriginRegex: unknown, logger?: Logger): IsOriginAllowed {
    if (typeof allowedOriginRegex !== 'string' || !allowedOriginRegex) {
        logger?.warn('Expected allowedOriginRegex to be a non-empty string. Allowing all origins.');
        return () => true;
    }

    let regex: RegExp;
    try {
        let regexString = allowedOriginRegex;
        if (regexString[0] !== '^') {
            regexString = '^' + regexString;
        }
        if (regexString[regexString.length - 1] !== '$') {
            regexString = regexString + '$';
        }
        regex = new RegExp(regexString, 'i');
    } catch (e) {
        logger?.warn(
            `Provided allowedOriginRegex ${allowedOriginRegex} is not a valid regular expression. Allowing all origins.`
        );
        return () => true;
    }

    return (origin) => {
        // Allow requests with no origin, e.g., like mobile apps or curl requests
        if (!origin) {
            return true;
        }

        return Boolean(origin.match(regex));
    };
}
