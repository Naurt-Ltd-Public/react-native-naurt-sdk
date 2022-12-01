import type { NaurtPoint } from "./naurt-point";

export interface NaurtAndroidInterface {
    initialiseNaurtStandalone(apiKey: String): void;
    initialiseNaurtService(apiKey: String): void;
    start(): void;
    stop(): void;

    addListener(eventName: String): void; // TODO: I think these can go
    removeListeners(count: number): void; // TODO: I think these can go

    isInitialised(): boolean;
    isValidated(): boolean;
    isRunning(): boolean;
    deviceUUID(): String;
    journeyUUID(): String;
    naurtPoint(): NaurtPoint;
    trackingStatus(): String; // TODO: Become enum
}

export interface NaurtIosInterface {
    init(apiKey: String): void;
    start(): void;
    stop(): void;

    isInitialised(): boolean;
    isValidated(): boolean;
    isRunning(): boolean;
    deviceUUID(): String;
    journeyUUID(): String | undefined;
    naurtPoint(): NaurtPoint | undefined;
    trackingStatus(): String; // TODO: Become enum
}