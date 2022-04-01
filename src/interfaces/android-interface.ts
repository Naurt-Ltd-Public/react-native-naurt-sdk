export interface NaurtAndroidInterface {
    getName(): String;
    getIds(): Array<String>;
    initialiseNaurt(apiKey: String, precision?: Number): void;
    resumeNaurt(): void;
    pauseNaurt(): void;
    startNaurt(): void;
    stopNaurt(): void;
    isNaurtInitialised(): boolean;
    addListener(eventName: String): void;
    removeListeners(count: number): void;
}