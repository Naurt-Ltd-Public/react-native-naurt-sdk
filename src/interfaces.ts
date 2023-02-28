
export interface NaurtAndroidInterface {
    initialiseNaurtService(apiKey: String): void;


    addListener(eventName: String): void; // *: Only here to conform to type
    removeListeners(count: number): void; // *: Only here to conform to type


    // New ones below here
    // Right now I have copy-pasta to keep in line with iOS
    // This MUST change before RN release: very important!
    beginAnalyticsSession(metadata: String): Promise<void>;
    stopAnalyticsSession(dummy: String): Promise<void>;

    destroy(): void;

    getIsValidated(): boolean;
    getDeviceUUID(): String | undefined;
    getJourneyUUID(): String | undefined;
    getIsInAnalyticsSession(): boolean;
}

export interface NaurtIosInterface {
    iOSInit(apiKey: String): Promise<void>;

    beginAnalyticsSession(metadata: String): Promise<void>;
    stopAnalyticsSession(dummy: String): Promise<void>;

    destroy(): void;

    addListener(eventName: String): void; // *: Only here to conform to type
    removeListeners(count: number): void; // *: Only here to conform to type

    getIsValidated(): boolean;
    getDeviceUUID(): String | undefined;
    getJourneyUUID(): String | undefined;
    getIsInAnalyticsSession(): boolean;
}