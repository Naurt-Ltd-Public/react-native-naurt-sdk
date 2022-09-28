import type { AndroidDeviceReport } from "./androrid-device-report";
import type { NaurtPoint } from "./naurt-point";

export interface NaurtAndroidInterface {
    getName(): String;
    getIds(): Promise<String[]>;
    initialiseNaurtStandalone(apiKey: String): void;
    initialiseNaurtService(apiKey: String): void;

    // resumeNaurt(): void;
    // pauseNaurt(): void;
    startNaurt(): void;
    stopNaurt(): void;
    addListener(eventName: String): void;
    removeListeners(count: number): void;
    isInitialised(): Promise<boolean>;
    isValidated(): Promise<boolean>;
    isRunning(): Promise<boolean>;
    hasLocationProvider(): Promise<boolean>;
    deviceReport(): Promise<AndroidDeviceReport>;
    deviceUUID(): Promise<String>;
    journeyUuid(): Promise<String>;
    naurtPoint(): Promise<NaurtPoint>;
    naurtPoints(): Promise<NaurtPoint[]>;
    trackingStatus(): Promise<String>;
}