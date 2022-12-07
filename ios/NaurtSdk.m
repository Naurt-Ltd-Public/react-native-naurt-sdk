#import "NaurtSdk.h"

// TODO: Need to make all these interfaces
@interface RCT_EXTERN_MODULE(RNaurt, NSObject)

RCT_EXTERN_METHOD(iOSInit: (NSString)apiKey)

RCT_EXTERN_METHOD(start)
RCT_EXTERN_METHOD(stop)

RCT_EXTERN_METHOD(getIsInitialised)
RCT_EXTERN_METHOD(getIsValidated)
RCT_EXTERN_METHOD(getIsRunning)
RCT_EXTERN_METHOD(deviceUUID)
RCT_EXTERN_METHOD(getJourneyUUID)
RCT_EXTERN_METHOD(naurtPoint)
RCT_EXTERN_METHOD(trackingStatus)

@end
