export interface NaurtAndroidInterface {
    getName(): String;
    getConstants(): Map<String, any>;
    initialiseNaurt(apiKey: String, precision: Number): void;
    resumeNaurt(): void;
    pauseNaurt(): void;
    startNaurt(): void;
    stopNaurt(): void;
    isNaurtInitialised(): boolean;
    addListener(eventName: String): void;
    removeListeners(count: number): void;
}