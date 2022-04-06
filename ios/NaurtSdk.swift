import Foundation
import naurt_xcframework

@objc(NaurtSdk)
class NaurtSdk: NSObject {
    @objc(multiply:withB:withResolver:withRejecter:)
    func multiply(a: Float, b: Float, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        resolve(a*b)
    }
    
    @objc static func requiresMainQueueSetup() -> Bool {
      return true
    }
    
    @objc public func initialiseNaurt(apiKey: String, precision: Int) {
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
}
