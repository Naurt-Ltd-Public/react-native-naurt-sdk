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
import GenericJSON;

// MARK: RNaurt
@objc(RNaurt)
class RNaurt: RCTEventEmitter, NaurtDelegate, LocationServiceUser, SensorServiceUser {
    
    
    
    
    
    var naurt: Naurt? = nil;
    var locationService: LocationService;
    var sensorService: SensorSerivce;
 
    var isValidated: Bool = false;
    var isInAnalyticsSession: Bool = false;
    var naurtLocation: NaurtLocation? = nil;
    var journeyUUID: UUID? = nil;
    var status: NaurtTrackingStatus = NaurtTrackingStatus.UNKNOWN;
    
    override init() {
        self.sensorService = SensorSerivce();
        self.locationService = LocationService();
        super.init();
        self.locationService.user = self;
        self.sensorService.user = self;
        
    }
    
    @objc
    func iOSInit(_ apiKey: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        do {
            self.naurt = try Naurt(apiKey: apiKey, noServices: true);
        } catch (let error as InitNaurtError) {
            switch (error) {
            case .fileSystem:
                let err = NSError(domain: "iOSInit", code: 1, userInfo: [NSLocalizedDescriptionKey: "Could not init your filesystem"]);
                reject(String(err.code), err.domain, err);
                return;
            case .couldNotCreateFirstJourney:
                let err = NSError(domain: "iOSInit", code: 2, userInfo: [NSLocalizedDescriptionKey: "Could not start the first internal journey"]);
                reject(String(err.code), err.domain, err);
                return;
            case .unknown:
                let err = NSError(domain: "iOSInit", code: 3, userInfo: [NSLocalizedDescriptionKey: "Unknown error"]);
                reject(String(err.code), err.domain, err);
                return
            @unknown default:
                let err = NSError(domain: "iOSInit", code: 4, userInfo: [NSLocalizedDescriptionKey: "Unknown error"]);
                reject(String(err.code), err.domain, err);
                return;
            }
        } catch {
            let err = NSError(domain: "iOSInit", code: 5, userInfo: [NSLocalizedDescriptionKey: "Unknown error"]);
            reject(String(err.code), err.domain, err);
            return;
        }
        
        self.naurt!.delegate = self;
        self.locationService.startUpdatingLocation();
        self.sensorService.startUpdatingSensors();
        resolve("Operation was success");
    }
    
    deinit {
        self.sensorService.stopUpdatingSensors();
        self.locationService.stopUpdatingLocation();
        self.onAppClose();
    }
    
    // MARK: Services Delegate Functions
    
    func newLocationServicePoint(newLocation: CLLocation) {
        self.naurt!.newLocationServicePoint(newLocation: newLocation);
    }
    
    func newSensorServicePoint(newMotion: NaurtSDK.MotionStruct) {
        self.naurt!.newSensorServicePoint(newMotion: newMotion);
        self.sensorService.cleanseSensors();
    }
    
    
    // MARK: Naurt Delegate Functions
    
    
    func didChangeAnalyticsSession(isInSession: Bool) {
        self.isInAnalyticsSession = isInSession;
        sendEvent(withName: "naurtDidUpdateAnalyticsSession", body: isInSession);
    }
    
    func didChangeJourneyUuid(journeyUuid: UUID) {
        self.journeyUUID = journeyUuid
    }
    
    func didEnterGeofence(id: UUID) {
        // Not supported
    }
    
    func startAnalyticsSession(metadata: Encodable, geofences: [NaurtSDK.Geofence]?) throws {
        do {
            try self.naurt!.startAnalyticsSession(metadata: metadata);
        } catch (let error as StartNaurtError) {
            switch (error) {
            case StartNaurtError.fileSystem:
                throw NSError(domain: "endAnalyticsSession", code: 1, userInfo: [NSLocalizedDescriptionKey: "Could not init your filesystem"]);
            case .alreadyInAnalyticsSession:
                throw NSError(domain: "endAnalyticsSession", code: 2, userInfo: [NSLocalizedDescriptionKey: "You are already in an analytics session"]);
            case .notInAnalyticsSession:
                // TODO: What is the point of this error?
                throw NSError(domain: "endAnalyticsSession", code: 3);
            case .notValidated:
                throw NSError(domain: "endAnalyticsSession", code: 4, userInfo: [NSLocalizedDescriptionKey: "You must be validated to start an analytics session"]);
            case .invalidJson:
                throw NSError(domain: "endAnalyticsSession", code: 5, userInfo: [NSLocalizedDescriptionKey: "Could not encode your provided metadata"]);
            case .noLocationService:
                // TODO: What is the point of this error?
                throw NSError(domain: "endAnalyticsSession", code: 6, userInfo: [NSLocalizedDescriptionKey: "No location service was provided"]);
            case .noSensorService:
                // TODO: What is the point of this error?
                throw NSError(domain: "endAnalyticsSession", code: 7, userInfo: [NSLocalizedDescriptionKey: "No sensor service was provided"]);
            case .unknown:
                throw NSError(domain: "endAnalyticsSession", code: 8, userInfo: [NSLocalizedDescriptionKey: "Unknown error"]);
            @unknown default:
                throw NSError(domain: "endAnalyticsSession", code: 9, userInfo: [NSLocalizedDescriptionKey: "Unknown error"]);
            }
        } catch {
            throw NSError(domain: "endAnalyticsSession", code: 10, userInfo: [NSLocalizedDescriptionKey: "Unknown error"]);
        }
        
    }
    
    @objc
    public func beginAnalyticsSession(_ metadata: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        // Takes a String representation of a JSON
        
        func convertToDictionary(text: String) -> [String: Any]? {
          if let data = text.data(using: .utf8) {
            do {
              return try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any]
            } catch {
              print(error.localizedDescription)
            }
          }
          return nil
        }
        
        let optionalAny = convertToDictionary(text: metadata);
        
        if optionalAny == nil{
            let err = NSError(domain: "beginAnalyticsSession", code: 1, userInfo: [NSLocalizedDescriptionKey: "Could not encode your provided metadata"]);
            reject(String(err.code), err.domain, err);
            return;
        }
        let unwrappedAny: [String: Any] = optionalAny!;
        
        var stringDict = [String: String]();
        
        for (key, value) in unwrappedAny {
            guard let stringValue = "\(value)" as? String else {
                let err = NSError(domain: "beginAnalyticsSession", code: 1, userInfo: [NSLocalizedDescriptionKey: "Could not encode your provided metadata"]);
                reject(String(err.code), err.domain, err);
                return;
            }
            stringDict[key] = stringValue;
        }
                
        do {
            try self.startAnalyticsSession(metadata: stringDict, geofences: nil);
        } catch (let err as NSError){
            reject(String(err.code), String(err.domain), err);
            return
        } catch {
            reject("Unknown", "Unknown", error);
            return;
        }
                              
        resolve("Operation was success");
    }
    
    func endAnalyticsSession() throws {
        try self.naurt!.endAnalyticsSession();
    }
    
    @objc
    func stopAnalyticsSession(_ dummy: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        do {
            try self.endAnalyticsSession();
        } catch (let error as StopNaurtError) {
            switch (error) {
            case StopNaurtError.notRunning:
                let err = NSError(domain: "endAnalyticsSession", code: 1, userInfo: [NSLocalizedDescriptionKey: "Could not end the analytics session since there was not one"]);
                reject(String(err.code), err.domain, err);
                return
            case StopNaurtError.uknown:
                let err = NSError(domain: "endAnalyticsSession", code: 2, userInfo: [NSLocalizedDescriptionKey: "Unknown error"]);
                reject(String(err.code), err.domain, err);
                return;
            default:
                let err = NSError(domain: "endAnalyticsSession", code: 3, userInfo: [NSLocalizedDescriptionKey: "Unknown error"]);
                reject(String(err.code), err.domain, err);
                return;
            }
        } catch {
            let err = NSError(domain: "endAnalyticsSession", code: 4, userInfo: [NSLocalizedDescriptionKey: "Unknown error"]);
            reject(String(err.code), err.domain, err);
            return;
        }
        
        resolve("Operation was success");
        
    }
    
    func newPoi(poi: Encodable) throws {
        // Not supported
    }
    
    func errorStream(error: NaurtSDK.NaurtError) {
        // Not supported
    }
    
    @objc
    func destroy() {
        self.onAppClose();
    }
    
    func onAppClose() {
        self.naurt?.onAppClose();
    }
    
    func didChangeValidated(isValidated: Bool) {
        self.isValidated = isValidated;
        sendEvent(withName: "naurtDidUpdateValidation", body: isValidated);
    }
    
    func didUpdateLocation(naurtPoint: NaurtSDK.NaurtLocation?) {
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
    
    // MARK: Getters
    
    @objc
    func getDeviceUUID() -> String? {
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
    func getIsValidated() -> Bool {
        if self.naurt == nil {
            return false;
        }
        
        return self.naurt!.getIsValidated();
    }
    
    @objc
    func getIsInAnalyticsSession() -> Bool {
        if self.naurt == nil {
            return false;
        }
        
        return self.naurt!.getIsInSession();
    }
    
    
    // MARK: React Native things
    
    
    
    
    @objc override static func requiresMainQueueSetup() -> Bool {
        return false;
    }
    
    override func supportedEvents() -> [String]! {
        return ["naurtDidUpdateLocation", "naurtDidUpdateValidation", "naurtDidUpdateAnalyticsSession"];
    }
}

// TODO: Need to add source to the RNaurtLocation
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
