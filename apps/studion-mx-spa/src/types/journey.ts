export interface Journey {
    id: number
    uuid: string
    name: string
    description: string
    workloadType: string
    workloadValue: number
    image: string,
    workload?: {
        type: string;
        value: number;
    }
}