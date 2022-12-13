//
//  NaurtSdk.swift
//  NaurtSdk
//
//  Created by Nathaniel Curnick on 08/11/2022.
//  Copyright © 2022 Facebook. All rights reserved.
//
import React
import RNaurt
import Foundation
import CoreLocation

@objc(RNaurt)
class RNaurt: RCTEventEmitter, NaurtDelegate {
    var naurt: Naurt? = nil;
 
    
    var isInitialised: Bool = false;
    var isValidated: Bool = false;
    var isRunning: Bool = false;
    var naurtLocation: NaurtLocation? = nil;
    var journeyUUID: UUID? = nil;
    var status: NaurtTrackingStatus = NaurtTrackingStatus.UNKNOWN;
    
    private var locationService: LocationService;
    private var sensorService: SensorSerivce;
    
    override init() {
        self.locationService = LocationService();
        self.sensorService = SensorSerivce();
        super.init();
        
    }
    
    @objc
    func iOSInit(_ apiKey: String) {
        self.naurt = Naurt(apiKey: apiKey);
        self.naurt!.delegate = self;
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
        
        self.locationService.startUpdatingLocation();
        NotificationCenter.default.addObserver(self, selector: #selector(self.newLocationServicePoint), name: NSNotification.Name("didUpdateLocation"), object: nil);
        
        self.sensorService.startUpdatingSensors();
        NotificationCenter.default.addObserver(self, selector: #selector(self.newSensorReading), name: NSNotification.Name("didUpdateSensor"), object: nil);
        
    }
    
    @objc func newLocationServicePoint() {
        print("New location point");
        guard let newPoint = self.locationService.locationDataArray.last else {
            return;
        }
        
        self.locationService.cleanseLocations();
        
        let naurtPoint = self.naurt?.newLocationServicePoint(newPoint: newPoint);
        print("Got back \(naurtPoint)");
        
        sendEvent(withName: "naurtDidUpdateLocation", body: naurtPoint);
    
    }
    
    @objc func newSensorReading(){
        
        guard let newSensorReading = self.sensorService.sensorData.asStruct() else {
            return;
        }
               

        self.sensorService.cleanseSensors();
        
        // Note: This line might seem unusual, but we are essential converting the data so it can be passed into the frameworks
        let sr = MotionStruct(accel: newSensorReading.accel, gyro: newSensorReading.gyro, mag: newSensorReading.mag, timeS: newSensorReading.timeS);
        
        self.naurt?.newSensorReading(newSensorReading: sr);
    }
    
    @objc
    func stop() {
        print("Inside the stop function");
        if self.naurt == nil {
            return;
        }
        self.naurt!.stop();
        self.locationService.stopUpdatingLocation();
        self.sensorService.stopUpdatingSensors();
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

    // Delegate function
    func didChangeInitialised(isInitialised: Bool) {
        self.isInitialised = isInitialised;
        print("Just initialised");
        sendEvent(withName: "naurtDidUpdateInitialise", body: isInitialised);
    }
    
    func didChangeValidated(isValidated: Bool) {
        self.isValidated = isValidated;
        print("Just validated")
        sendEvent(withName: "naurtDidUpdateValidation", body: isValidated);
    }
    
    func didChangeRunning(isRunning: Bool) {
        self.isRunning = isRunning;
        print("Just started running");
        print("Running: \(isRunning)");
        sendEvent(withName: "naurtDidUpdateRunning", body: isRunning);
    }
        
    func didChangeJourneyUuid(journeyUuid: UUID?) {
        print("Journey ID \(journeyUUID)");
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
