//
//  NaurtSdk.swift
//  NaurtSdk
//
//  Created by Nathaniel Curnick on 08/11/2022.
//  Copyright © 2022 Facebook. All rights reserved.
//
import React;
import NaurtSDK;
import Foundation;
import CoreLocation;


@objc(RNaurt)
class RNaurt: RCTEventEmitter, NaurtDelegate {
    
    @objc
    func newLocationServicePoint() {
        print("New location point in RNaurt")
        
        if let newLocation = self.locationService?.locationDataArray.last {
            self.naurt?.newLocationPoint(newLocation: newLocation);
            self.locationService?.cleanse();
        }
        
    }
    
    @objc
    func newSensorServicePoint() {
        print("New sensor")
        if let newMotion = self.sensorService?.sensorData.asStruct() {
            self.naurt?.newSensorPoint(newMotion: newMotion);
            self.sensorService?.cleanseSensors();
        }
        
    }
    
    
    
    var naurt: Naurt? = nil;
    var locationService: LocationService? = nil;
    var sensorService: SensorSerivce? = nil;
 
    var isValidated: Bool = false;
    var isRunning: Bool = false;
    var naurtLocation: NaurtLocation? = nil;
    var journeyUUID: UUID? = nil;
    var status: NaurtTrackingStatus = NaurtTrackingStatus.UNKNOWN;
    
    override init() {
        super.init();
        
    }
    
    @objc
    func iOSInit(_ apiKey: String) {
        
        self.naurt = Naurt(apiKey: apiKey, noServices: true);
        self.naurt!.delegate = self;
        
        self.sensorService = SensorSerivce();
        
        self.locationService = LocationService();
        print("The delegate is set");
    }
    
    deinit {
        if self.naurt != nil {
            do {
                try self.naurt!.stop();
            } catch {
                return;
            }
            
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
        
        do {
            try self.naurt!.start();
            self.locationService!.startUpdatingLocation();
            self.sensorService!.startUpdatingSensors();
            NotificationCenter.default.addObserver(self, selector: #selector(self.newLocationServicePoint), name: NSNotification.Name("didUpdateLocation"), object: nil);
            NotificationCenter.default.addObserver(self, selector: #selector(self.newSensorServicePoint), name: NSNotification.Name("didUpdateSensor"), object: nil);
            print("I started everything")
        } catch {
            return
        }
                
    }
    

    
    @objc
    func stop() {
        if self.naurt == nil {
            return;
        }
        do {
            try self.naurt!.stop();
            self.locationService!.stopUpdatingLocation();
            self.sensorService!.stopUpdatingSensors();
            NotificationCenter.default.removeObserver(self);
        } catch {
            return;
        }
        
    
    }
    
    @objc
    func getIsInitialised() -> Bool {
        return true;
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

    // Delegate function
    
    func didChangeValidated(isValidated: Bool) {
        print("Naurt is validating")
        self.isValidated = isValidated;
        sendEvent(withName: "naurtDidUpdateValidation", body: isValidated);
    }
    
    func didChangeRunning(isRunning: Bool) {
        print("Naurt is running")
        self.isRunning = isRunning;
        sendEvent(withName: "naurtDidUpdateRunning", body: isRunning);
    }
        
    func didChangeJourneyUuid(journeyUuid: UUID?) {
        print("journey uuid")
        self.journeyUUID = journeyUuid;
    }
    
    func didChangeStatus(trackingStatus: NaurtTrackingStatus) {
        print("Changing status")
        self.status = trackingStatus;
    }
    
    func didUpdateLocation(naurtPoint: NaurtSDK.NaurtLocation?) {
        print("Naurt updating location")
        if naurtPoint == nil {
            return;
        }
        let np = naurtLocationStructToClass(point: naurtPoint);
        
        if np == nil {
            return;
        }
        
        do {
            let jsonData = try JSONEncoder().encode(np!);
            let jsonString = String(data: jsonData, encoding: .utf8);
            sendEvent(withName: "naurtDidUpdateLocation", body: jsonString);
        } catch {
            sendEvent(withName: "naurtDidUpdateLocation", body: false);
        }
        
    }
}

public class RNaurtLocation: NSObject, Encodable {
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
