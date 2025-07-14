export interface Content {
    component: {
        uuid: string;
        name: string;
    };
    strategy: string;
    metadata: {
        url: string;
        is_downloadable: boolean;
        alternative_reader: boolean;
    };
    consumption: {
        uuid: string;
        progress: number;
        status: string;
    };
}