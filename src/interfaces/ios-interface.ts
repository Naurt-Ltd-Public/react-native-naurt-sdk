import type { NaurtPoint } from "./naurt-point";

export interface NaurtIosInterface {
    initialiseNaurt(apiKey: String, precision?: Number): void;
    resumeNaurt(): void;
    pauseNaurt(): void;
    startNaurt(): void;
    stopNaurt(): void;

    isInitialised(): Promise<boolean>;
    isValidated(): Promise<boolean>;
    isRunning(): Promise<boolean>;
    journeyUuid(): Promise<String>;
    naurtPoint(): Promise<NaurtPoint>;
    naurtPoints(): Promise<NaurtPoint[]>;
    trackingStatus(): Promise<String>;
}