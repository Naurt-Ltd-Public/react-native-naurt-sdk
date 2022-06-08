#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(NaurtSdk, NSObject)


//RCT_EXTERN_METHOD(initialiseNaurt:(String)apiKey (Int)precision)

RCT_EXTERN_METHOD(initialiseNaurt:(NSString *)apiKey  precision:(nonnull NSNumber *)precision)


RCT_EXTERN_METHOD(startNaurt)
RCT_EXTERN_METHOD(stopNaurt)
RCT_EXTERN_METHOD(pauseNaurt)
RCT_EXTERN_METHOD(resumeNaurt)

RCT_EXTERN_METHOD(getIds: resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)


RCT_EXTERN_METHOD(isInitialised:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

//RCT_EXTERN_METHOD(isInitialised:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
//RCT_EXTERN_METHOD(isInitialised: resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)


RCT_EXTERN_METHOD(isValidated: (RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(isRunning: (RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(journeyUuid: (RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(naurtPoint: (RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(naurtPoints: (RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(trackingStatus: (RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
@end
