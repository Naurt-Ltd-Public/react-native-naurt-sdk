#import "NaurtSdk.h"
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

// TODO: Need to make all these interfaces
@interface RCT_EXTERN_MODULE(RNaurt, RCTEventEmitter)

RCT_EXTERN_METHOD(iOSInit: (NSString *)apiKey resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(beginAnalyticsSession: (NSString *)metadata
                  resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)


RCT_EXTERN_METHOD(stopAnalyticsSession: (NSString *)dummy resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(onAppClose)

RCT_EXTERN_METHOD(getIsValidated)
RCT_EXTERN_METHOD(getDeviceUUID)
RCT_EXTERN_METHOD(getJourneyUUID)
RCT_EXTERN_METHOD(getIsInAnalyticsSession)
@end
