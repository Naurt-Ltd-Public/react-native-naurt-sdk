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
    var journeyUUID: String? = nil;
    
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
    
    func newSensorServicePoint(newMotion: NaurtSDK.MotionContainer) {
        self.naurt!.newSensorServicePoint(newMotion: newMotion);
        self.sensorService.cleanseSensors();
    }
    
    
    // MARK: Naurt Delegate Functions
    
    
    func didChangeAnalyticsSession(isInSession: Bool) {
        self.isInAnalyticsSession = isInSession;
        sendEvent(withName: "naurtDidUpdateAnalyticsSession", body: isInSession);
    }
    
    func didChangeJourneyUuid(journeyUuid: String) {
        self.journeyUUID = journeyUuid
    }
    
    func startAnalyticsSession(metadata: NSDictionary, geofences: [NaurtSDK.Geofence]?) throws {
        do {
            try self.naurt!.startAnalyticsSession(metadata: metadata);
        } catch (let error as StartNaurtError) {
            switch (error) {
            case StartNaurtError.fileSystem:
                throw NSError(domain: "endAnalyticsSession", code: 1, userInfo: [NSLocalizedDescriptionKey: "Could not init your filesystem"]);
            case .alreadyInAnalyticsSession:
                throw NSError(domain: "endAnalyticsSession", code: 2, userInfo: [NSLocalizedDescriptionKey: "You are already in an analytics session"]);
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
            case .geofencingRequested:
                throw NSError(domain: "endAnalyticsSession", code: 8, userInfo: [NSLocalizedDescriptionKey: "Geofencing requested by methods not provided"]);
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
        
        let nsDict = NSDictionary(dictionary: stringDict);
                
        do {
            try self.startAnalyticsSession(metadata: nsDict, geofences: nil);
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
    
    func newPoi(poi: NSDictionary) throws {
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
        
        naurtPoint!.courseAccuracy = -1;
        naurtPoint!.horizontalCovariance = -1;
        do {
            let jsonData = try JSONEncoder().encode(naurtPoint!);
            let jsonString = String(data: jsonData, encoding: .utf8)!;
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
        return self.naurt!.getDeviceUUID(); // TODO: Come back to this
    }
    
    @objc
    func getJourneyUUID() -> String? {
        // TODO: probably type errors here
        guard let ju = self.journeyUUID else {
            return nil;
        }
        
        return ju;
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
    
    // MARK: Setters
    
    @objc func setEmissionFrequency(_ frequency: NSNumber, nul: Bool) {
        if nul {
            let nul: Double? = nil;
            self.naurt?.setEmissionFrequency(frequency: nul);
        } else {
            self.naurt?.setEmissionFrequency(frequency: frequency);
        }
        
        
    }
    
    // MARK: React Native things
    
    @objc override static func requiresMainQueueSetup() -> Bool {
        return false;
    }
    
    override func supportedEvents() -> [String]! {
        return ["naurtDidUpdateLocation", "naurtDidUpdateValidation", "naurtDidUpdateAnalyticsSession", "naurtUserLocationEnabledEvent"];
    }
}
