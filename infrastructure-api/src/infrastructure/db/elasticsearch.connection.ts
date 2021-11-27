import { Client } from 'elasticsearch';

export type SearchClient = Client;

export async function getSearchClient(url: string) {
    return new Client({ hosts: [url] });
}
