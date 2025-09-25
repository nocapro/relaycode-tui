export interface CopyItem {
    id: string;
    key: string;
    label: string;
    getData: () => string;
    isDefaultSelected?: boolean;
}