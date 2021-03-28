export async function asyncForEach(array: any[], callback: any) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

export function splitKeywordsString(keywords: any): string[] {
    let result: string[] = [];
    if (keywords && typeof keywords === 'string') result = keywords.split(', ');
    return result;
}
