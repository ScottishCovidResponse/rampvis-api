export async function asyncForEach(array: any[], callback: any) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

export function splitKeywordsString(keywords: any): string[] {
    let result: string[] = [];
    if (keywords && typeof keywords === 'string') {
        // Convert to array and filter empty strings
        result = keywords.split(', ').filter((d: string) => d);
    }
    return result;
}

export function splitPageIndexKeywordsString(keywords: any): string[] {
    let result: string[] = [];
    if (keywords && typeof keywords === 'string') {
        // Convert to array and filter empty strings
        result = keywords.split(' ').filter((d: string) => d);
    }
    return result;
}
