type Endpoint = string | undefined;
type BaseEventData = Record<string, string>;
type AdditionalData = BaseEventData;
type TrackerConfig = {
    targets?: string[];
    events?: string[];
    additionalData?: AdditionalData;
    endpoint?: Endpoint;
};
declare const tracker: ({ targets, events, additionalData, endpoint }: TrackerConfig) => {
    send: (payload: Record<string, string>) => void;
    unsubscribe: () => void;
};
export { TrackerConfig, tracker };
