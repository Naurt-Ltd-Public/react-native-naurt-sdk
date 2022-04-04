import Foundation
import naurt_xcframework

@objc(NaurtSdk)
class NaurtSdk: NSObject {
    @objc
    static func requiresMainQueueSetup() -> Bool {
      return true
    }
    
    @objc(multiply:withB:withResolver:withRejecter:)
    func multiply(a: Float, b: Float, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        resolve(a*b)
    }
}
