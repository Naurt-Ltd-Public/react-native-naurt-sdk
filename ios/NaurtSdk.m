#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(NaurtSdk, NSObject)

RCT_EXTERN_METHOD(initialiseNaurt:(String)apiKey (Int)precision)
RCT_EXTERN_METHOD(startNaurt)
RCT_EXTERN_METHOD(stopNaurt)
RCT_EXTERN_METHOD(pauseNaurt)
RCT_EXTERN_METHOD(resumeNaurt)

@end
