export interface IPageTemplate {
    page: {
        id: number;
        type: string;
        nrows: number;
        title: string;
        description: string;
    };
    bind: {
        function: string;
        endpoint: string | string[];
        description: string;
    }[];

    links: { [key: string]: string[] };
}
