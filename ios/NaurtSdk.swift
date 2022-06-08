import Foundation
import naurt_framework
import Combine
import React

@objc(NaurtSdk)
class NaurtSdk: NSObject {
    private var initialisationSubscriber: AnyCancellable? = nil
    private var validationSubscriber: AnyCancellable? = nil
    private var runningSubscriber: AnyCancellable? = nil
    private var pointSubscriber: AnyCancellable? = nil
    
    @objc var bridge: RCTBridge!


    private let eventIds: [String] = [
      "NAURT_NEW_POINT",          // 0
      "NAURT_NEW_JOURNEY",        // 1
      "NAURT_IS_INITIALISED",     // 2
      "NAURT_IS_VALIDATED",       // 3
      "NAURT_IS_RUNNING",         // 4
      "NAURT_IS_ONLINE",          // 5
      "NAURT_HAS_LOCATION",       // 6
      "NAURT_NEW_DEVICE_REPORT",  // 7
      "NAURT_NEW_TRACKING_STATUS" // 8
    ]
    
    private func getInitialisationSubscriber() -> AnyCancellable {
        return Naurt.shared.$isInitialised.sink(receiveCompletion: { completion in
            switch completion {
            case .failure(let error):
              print("$isInitialised | Something went wrong: \(error)")
            case .finished:
              print("$isInitialised | Received Completion")
            }
          }, receiveValue: { value in
              self.bridge.eventDispatcher().sendAppEvent(withName: self.eventIds[2], body: value)
          })
    }
    
    private func getValidationSubscriber() -> AnyCancellable {
        return Naurt.shared.$isValidated.sink(receiveCompletion: { completion in
            switch completion {
            case .failure(let error):
              print("$isValidated | Something went wrong: \(error)")
            case .finished:
              print("$isValidated | Received Completion")
            }
          }, receiveValue: { value in
              self.bridge.eventDispatcher().sendAppEvent(withName: self.eventIds[3], body: value)
          })
    }
    
    private func getRunningSubscriber() -> AnyCancellable {
        return Naurt.shared.$isRunning.sink(receiveCompletion: { completion in
            switch completion {
            case .failure(let error):
              print("$isRunning | Something went wrong: \(error)")
            case .finished:
              print("$isRunning | Received Completion")
            }
          }, receiveValue: { value in
            self.bridge.eventDispatcher().sendAppEvent(withName: self.eventIds[4], body: value)
          })
    }
    
    private func getPointSubscriber() -> AnyCancellable {
        return Naurt.shared.$naurtPoint.sink(receiveCompletion: { completion in
            switch completion {
            case .failure(let error):
              print("$naurtPoint | Something went wrong: \(error)")
            case .finished:
              print("$naurtPoint | Received Completion")
            }
          }, receiveValue: { value in
              let auxDic: NSMutableDictionary = [:]
              auxDic["altitude_accuracy"] = value?.altitude_accuracy
              auxDic["speed_accuracy"] = value?.speed_accuracy
              auxDic["heading_accuracy"] = value?.heading_accuracy
              auxDic["heading"] = value?.heading
              auxDic["altitude"] = value?.altitude
              auxDic["speed"] = value?.speed
              auxDic["timestamp"] = value?.timestamp
              auxDic["horizontal_accuracy"] = value?.horizontal_accuracy
              auxDic["horizontal_covariance"] = value?.horizontal_covariance
              auxDic["latitude"] = value?.latitude
              auxDic["longitude"] = value?.longitude
              
              self.bridge.eventDispatcher().sendAppEvent(withName: self.eventIds[0], body: auxDic)
          })
    }
    
    override init() {
        super.init()
    }
    
    deinit {
        initialisationSubscriber?.cancel()
        validationSubscriber?.cancel()
        runningSubscriber?.cancel()
        pointSubscriber?.cancel()
    }

    @objc static func requiresMainQueueSetup() -> Bool {
      return true
    }
    
    // ============================= EXPOSED METHODS =============================
    @objc(getItems:rejecter:) public func getIds(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        resolve(eventIds)
    }
    
    @objc(initialiseNaurt:precision:)
    func initialiseNaurt(_ apiKey: String, precision: Int) {
        initialisationSubscriber = getInitialisationSubscriber()
        validationSubscriber = getValidationSubscriber()
        runningSubscriber = getRunningSubscriber()
        pointSubscriber = getPointSubscriber()
      Naurt.shared.initialise(apiKey: apiKey, precision: precision);
    }
    
    @objc public func startNaurt() {
      Naurt.shared.start()
    }
    
    @objc public func stopNaurt() {
      Naurt.shared.stop()
    }
    
    @objc public func pauseNaurt() {
      Naurt.shared.pause()
    }
    
    @objc public func resumeNaurt() {
      Naurt.shared.resume()
    }
    
    @objc(isInitialised:reject:)
    func isInitialised(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        resolve(Naurt.shared.isInitialised)
    }
    
    @objc(isValidated:reject:)
    public func isValidated(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        resolve(Naurt.shared.isValidated)
    }
    @objc(isRunning:reject:)
    public func isRunning(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        resolve(Naurt.shared.isRunning)
    }
    @objc(journeyUuid:reject:)
    public func journeyUuid(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        resolve(Naurt.shared.journeyUuid)
    }
    @objc(naurtPoint:reject:)
    public func naurtPoint(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        resolve(Naurt.shared.naurtPoint)
    }
    @objc(naurtPoints:reject:)
    public func naurtPoints(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        resolve(Naurt.shared.naurtPoints)
    }
    @objc(trackingStatus:reject:)
    public func trackingStatus(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        resolve(Naurt.shared.trackingStatus)
    }
}
