import type { AndroidDeviceReport } from "./androrid-device-report";

export interface NaurtPointEvent extends Event {
    latitude: number,
    longitude: number,
    timestamp: String,
    locationProviderTimestamp: String,
    horizontalAccuracy: number,
    speed: number,
    heading: number,
    speedAccuracy: number,
    headingAccuracy: number,
    horizontalCovariance: number,
    altitude: number,
    verticalAccuracy: number,
    cumulativeDistance: number,
    motionFlag: String,
    locationOrigin: String,
    environmentFlag: String,
    backgroundStatus: String,
}

export interface NaurtOnlineEvent extends Event {
    isOnline: boolean;
}

export interface NaurtInitialisedEvent extends Event {
    isInitialised: boolean;
}

export interface NaurtValidatedEvent extends Event {
    isValidated: boolean;
}

export interface NaurtJourneyEvent extends Event {
    newJourney: String;
}

export interface NaurtRunningEvent extends Event {
    isRunning: boolean;
}

export interface NaurtHasLocationEvent extends Event {
    hasLocationProvider: boolean;
}

export interface NaurtTrackingStatusEvent extends Event {
    trackingStatus: String;
}

export interface NaurtDeviceReportEvent extends Event {
    deviceReport: AndroidDeviceReport;
}