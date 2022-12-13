import type { NaurtPoint } from "./naurt-point";

export interface NaurtAndroidInterface {
    initialiseNaurtStandalone(apiKey: String): void;
    initialiseNaurtService(apiKey: String): void;
    start(): void;
    stop(): void;

    addListener(eventName: String): void; // *: Only here to conform to type
    removeListeners(count: number): void; // *: Only here to conform to type

    // TODO: Make Android reflect this
    getIsInitialised(): boolean;
    getIsValidated(): boolean;
    getIsRunning(): boolean;
    deviceUUID(): String;
    getJourneyUUID(): String;
    naurtPoint(): NaurtPoint;
    trackingStatus(): String; // TODO: Become enum
}

export interface NaurtIosInterface {
    iOSInit(apiKey: String): void;
    start(): void;
    stop(): void;

    addListener(eventName: String): void; // *: Only here to conform to type
    removeListeners(count: number): void; // *: Only here to conform to type

    getIsInitialised(): boolean;
    getIsValidated(): boolean;
    getIsRunning(): boolean;
    deviceUUID(): String; // TODO: make this getDeviceUUID
    getJourneyUUID(): String | undefined;
    naurtPoint(): NaurtPoint | undefined;
    trackingStatus(): String; // TODO: Become enum
}