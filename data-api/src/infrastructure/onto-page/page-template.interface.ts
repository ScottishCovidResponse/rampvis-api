export interface IPageTemplate {
    page: {
        id: number;
        type: string;
        nrows: number;
        title: string;
        description: string;
        date: Date;
    };
    bind: {
        function: string;
        endpoint: string | string[];
        description: string;
    }[];

    links: { [key: string]: string[] };
}
