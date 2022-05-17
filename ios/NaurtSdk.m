#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(NaurtSdk, NSObject)

RCT_EXTERN_METHOD(initialiseNaurt:(String)apiKey (Int)precision)
RCT_EXTERN_METHOD(startNaurt)
RCT_EXTERN_METHOD(stopNaurt)
RCT_EXTERN_METHOD(pauseNaurt)
RCT_EXTERN_METHOD(resumeNaurt)

RCT_EXTERN_METHOD(getIds: resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(isInitialised: resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(isValidated: resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(isRunning: resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(journeyUuid: resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(naurtPoint: resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(naurtPoints: resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(trackingStatus: resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
@end
