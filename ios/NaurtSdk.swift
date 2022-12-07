//
//  NaurtSdk.swift
//  NaurtSdk
//
//  Created by Nathaniel Curnick on 08/11/2022.
//  Copyright © 2022 Facebook. All rights reserved.
//
import React
import NaurtSDK
import Foundation

@objc(RNaurt)
class RNaurt: RCTEventEmitter, NaurtDelegate {
    var naurt: NaurtSDK.Naurt? = nil;
 
    
    var isInitialised: Bool = false;
    var isValidated: Bool = false;
    var isRunning: Bool = false;
    var naurtLocation: NaurtLocation? = nil;
    var journeyUUID: UUID? = nil;
    var status: NaurtTrackingStatus = NaurtTrackingStatus.UNKNOWN;
    
    @objc
    func iOSInit(_ apiKey: String) {
        self.naurt = NaurtSDK.Naurt(apiKey: apiKey);
    }
    
    deinit {
        if self.naurt != nil {
            self.naurt!.stop();
        }
    }
    
    @objc override static func requiresMainQueueSetup() -> Bool {
        return false;
    }
    
    override func supportedEvents() -> [String]! {
        return ["naurtDidUpdateLocation", "naurtDidUpdateValidation", "naurtDidUpdateRunning", "naurtDidUpdateInitialise"];
    }
    
    
    @objc
    func start() {
        if self.naurt == nil {
            return;
        }
        self.naurt!.start();
    }
    
    @objc
    func stop() {
        if self.naurt == nil {
            return;
        }
        self.naurt!.stop();
    }
    
    @objc
    func getIsInitialised() -> Bool {
        return self.isInitialised;
    }
    
    @objc
    func getIsValidated() -> Bool {
        return self.isValidated;
    }
    
    @objc
    func getIsRunning() -> Bool {
        return self.isRunning;
    }
    
    @objc
    func deviceUUID() -> String? {
        if self.naurt == nil {
            return nil;
        }
        return self.naurt!.deviceUuid;
    }
    
    @objc
    func getJourneyUUID() -> String? {
        // TODO: probably type errors here
        guard let ju = self.journeyUUID else {
            return nil;
        }
        
        return ju.uuidString;
    }
    
    @objc
    func naurtPoint() -> RNaurtLocation? {
        return naurtLocationStructToClass(point: self.naurtLocation);
    }
    
    @objc
    func trackingStatus() -> RNaurtTrackingStatus {
        return naurtStatusEnumObjc(status: self.status);
    }
    
    // NOTE: We HAVE to conform to the NaurtDelegate protocall, which makes sense
    // in native iOS but seems clunky and redundent here
    // That is because it is clunky and redundent
    // These functions only exist to prevent a crash inside the native Swift code
    func didChangeInitialised(isInitialised: Bool) {
        self.isInitialised = isInitialised;
        sendEvent(withName: "naurtDidUpdateInitialise", body: isInitialised);
    }
    
    func didChangeValidated(isValidated: Bool) {
        self.isValidated = isValidated;
        sendEvent(withName: "naurtDidUpdateValidation", body: isValidated);
    }
    
    func didChangeRunning(isRunning: Bool) {
        self.isRunning = isRunning;
        sendEvent(withName: "naurtDidUpdateRunning", body: isRunning);
    }
    
    func didUpdateLocation(naurtPoint: NaurtLocation?) {
        self.naurtLocation = naurtPoint;
        if naurtPoint != nil {
            sendEvent(withName: "naurtDidUpdateLocation", body: naurtPoint!);
        }
    }
    
    func didChangeJourneyUuid(journeyUuid: UUID?) {
        self.journeyUUID = journeyUuid;
    }
    
    func didChangeStatus(trackingStatus: NaurtTrackingStatus) {
        self.status = trackingStatus;
    }
    
}



public class RNaurtLocation: NSObject {
    public var timestamp: Double;
    public var longitude: Double;
    public var latitude: Double;
    public var altitude: Double;
    public var verticalAccuracy: Double;
    public var speed: Double;
    public var speedAccuracy: Double;
    public var course: Double;
    public var courseAccuracy: Double;
    public var horizontalAccuracy: Double
    public var horizontalCovariance: Double;
    
    init(timestamp: Double, longitude: Double, latitude: Double, altitude: Double, verticalAccuracy: Double, speed: Double, speedAccuracy: Double, course: Double, courseAccuracy: Double, horizontalAccuracy: Double, horizontalCovariance: Double) {
        self.timestamp = timestamp
        self.longitude = longitude
        self.latitude = latitude
        self.altitude = altitude
        self.verticalAccuracy = verticalAccuracy
        self.speed = speed
        self.speedAccuracy = speedAccuracy
        self.course = course
        self.courseAccuracy = courseAccuracy
        self.horizontalAccuracy = horizontalAccuracy
        self.horizontalCovariance = horizontalCovariance
    }
}

// We have to make this a function and not a constructor of the class since objc needs to be able to understand the class
// objc CAN NOT understand Swift structs
private func naurtLocationStructToClass(point: NaurtLocation?) -> RNaurtLocation? {
    guard let unwrappedPoint = point else {
        return nil;
    }
    
    return RNaurtLocation(
        timestamp: unwrappedPoint.timestamp,
        longitude: unwrappedPoint.longitude,
        latitude: unwrappedPoint.latitude,
        altitude: unwrappedPoint.altitude,
        verticalAccuracy: unwrappedPoint.verticalAccuracy,
        speed: unwrappedPoint.speed,
        speedAccuracy: unwrappedPoint.speedAccuracy,
        course: unwrappedPoint.course,
        courseAccuracy: unwrappedPoint.courseAccuracy,
        horizontalAccuracy: unwrappedPoint.horizontalAccuracy,
        horizontalCovariance: unwrappedPoint.horizontalCovariance);
}

private func naurtStatusEnumObjc(status: NaurtTrackingStatus) -> RNaurtTrackingStatus {
    
    switch status {
    case NaurtTrackingStatus.FULL:
        return RNaurtTrackingStatus.FULL;
    case NaurtTrackingStatus.READY:
        return RNaurtTrackingStatus.READY;
    case NaurtTrackingStatus.UNKNOWN:
        return RNaurtTrackingStatus.UNKNOWN;
    case NaurtTrackingStatus.AWAITING_VALIDATION:
        return RNaurtTrackingStatus.AWAITING_VALIDATION;
    case NaurtTrackingStatus.FAILING_VALIDATION:
        return RNaurtTrackingStatus.FAILING_VALIDATION;
    case NaurtTrackingStatus.INVALID_API_KEY:
        return RNaurtTrackingStatus.INVALID_API_KEY;
    @unknown default:
        return RNaurtTrackingStatus.UNKNOWN;
    }
}


@objc
public enum RNaurtTrackingStatus: Int {
    case FULL // Naurt is fully operational, and operating at maximum performance
    case READY // Naurt is ready to start
    case UNKNOWN // An unknown error has occurred, please contact Naurt support
    case AWAITING_VALIDATION // Naurt has been initialised and is now awaiting validation from the Naurt Server
    case FAILING_VALIDATION // Naurt is faling validation. Check internet connection. Naurt will continue to try validating for you.
    case INVALID_API_KEY // Your API key is invalid. Naurt will no longer try to validate. Please contact Naurt Support for help with your API Key
}
