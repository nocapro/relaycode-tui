export interface CopyItem {
    id: string;
    key: string;
    label: string;
    getData: () => string | Promise<string>;
    isDefaultSelected?: boolean;
}