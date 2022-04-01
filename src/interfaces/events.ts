export interface NaurtInitialisedEvent extends Event {
    isInitialised: boolean;
}
  
export interface NaurtValidatedEvent extends Event {
    isValidated: boolean;
}

export interface NaurtRunningEvent extends Event {
    isRunning: boolean;
}

// TODO: Expand with data fields from 1.8+
export interface NaurtPointEvent extends Event {
    latitude: number;
    longitude: number;
    timestamp: String;
}