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

@objc(NaurtSDK)
class Naurt: NaurtDelegate, RCTEventEmitter {
  var naurt: Naurt;

  var isInitialised: Bool = false;
  var isValidated: Bool = false;
  var isRunning: Bool = false;
  var naurtLocation: NaurtLocation? = nil;
  var journeyUUID: UUID? = nil;
  var status: NaurtTrackingStatus = NaurtTrackingStatus.UNKNOWN;

  @objc
  init(_ apiKey: String) {
    self.naurt = Naurt(apiKey: apiKey);
    self.naurt.delegate = self;
    self.isInitialised = true;
  }

  @objc
  func start() {
    self.naurt.start();
  } 
  
  @objc
  func stop() {
    self.naurt.stop();
  } 

  @objc 
  func isInitialised() -> Bool {
    return self.isInitialised;
  }

  @objc
  func isValidated() -> Bool {
    return self.isValidated;
  }

  @objc 
  func isRunning() -> Bool {
    return self.isRunning;
  }

  @objc
  func deviceUUID() -> String {
    return self.naurt.deviceUUID();
  }

  @objc
  func journeyUUID() -> String? {
    // TODO: probably type errors here
    return self.journeyUuid;
  }

  @objc 
  func naurtPoint() -> NaurtLocation? {
    return self.naurtLocation;
  }

  @objc
  func trackingStatus() -> NaurtTrackingStatus {
    return self.status;
  }

  // NOTE: We HAVE to conform to the NaurtDelegate protocall, which makes sense 
  // in native iOS but seems clunky and redundent here
  // That is because it is clunky and redundent 
  // These functions only exist to prevent a crash inside the native Swift code
  func didChangeInitialised(isInitialised: Bool) {
    self.isInitialised = isInitialised;
  } 

  func didChangeValidated(isValidated: Bool) {
    self.isValidated = isValidated;
  } 
  
  func didChangeRunning(isRunning: Bool) {
    self.isRunning = isRunning;
  } 
  
  func didUpdateLocation(naurtPoint: NaurtLocation?) {
    self.naurtLocation = naurtPoint;
  } 
  
  func didChangeJourneyUuid(journeyUuid: UUID?) {
    self.journeyUuid = journeyUuid;
  } 
  
  func didChangeStatus(trackingStatus: NaurtTrackingStatus) {
    self.status = trackingStatus;
  } 

}